import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Função para gerar perguntas com o Gemini
export const generateQuestionsWithAI = action({
  args: {
    jobId: v.id("jobs"),
    title: v.string(),
    company: v.string(),
    description: v.string(),
    skills: v.string(),
    experience: v.string(),
    idealProfile: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ConvexError("Gemini API key não encontrada");
    }

    // Inicializar o cliente do Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Preparar o prompt para o Gemini
    const prompt = `
      Você é um especialista em recrutamento e seleção com ampla experiência em avaliar candidatos para posições técnicas e não-técnicas.
      
      Preciso que você crie 5 perguntas desafiadoras e específicas para avaliar candidatos para a seguinte vaga:
      
      Título: ${args.title}
      Empresa: ${args.company}
      Descrição: ${args.description}
      Habilidades Técnicas: ${args.skills}
      Experiência: ${args.experience}
      Perfil Ideal: ${args.idealProfile}
      
      DIRETRIZES IMPORTANTES:
      1. As perguntas devem avaliar profundamente o COGNITIVO, a INTELIGÊNCIA e as HABILIDADES TÉCNICAS específicas para esta função.
      2. Evite completamente perguntas genéricas que poderiam ser aplicadas a qualquer vaga.
      3. Crie perguntas que avaliem:
         - Capacidade de resolução de problemas complexos relacionados à área
         - Raciocínio lógico aplicado ao contexto específico da vaga
         - Conhecimento técnico mencionado nas habilidades requeridas
         - Experiência prática com situações reais do dia-a-dia desta função
         - Capacidade de inovação e pensamento crítico no contexto da vaga
      4. As perguntas devem ser desafiadoras o suficiente para diferenciar candidatos excepcionais de candidatos medianos.
      5. Inclua pelo menos uma pergunta que avalie como o candidato lidaria com um problema específico que poderia enfrentar nesta posição.
      6. Adapte o nível de complexidade das perguntas ao nível de experiência solicitado na vaga.
      
      Retorne apenas as perguntas em formato JSON, como este exemplo:
      [
        { "question": "Pergunta 1", "type": "text" },
        { "question": "Pergunta 2", "type": "text" }
      ]
    `;

    try {
      // Fazer a chamada para a API do Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new ConvexError("Resposta vazia do Gemini");
      }

      // Extrair o JSON da resposta
      let questions;
      try {
        // Tenta extrair o JSON da resposta, removendo qualquer texto adicional
        const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          // Se não conseguir extrair com regex, tenta parsear diretamente
          questions = JSON.parse(content);
        }

        // Salvar as perguntas no banco de dados usando uma mutation interna
        for (const q of questions) {
          await ctx.runMutation(internal.questions.createQuestion, {
            jobId: args.jobId,
            question: q.question,
            type: q.type || "text",
          });
        }

        return questions;
      } catch (e) {
        // Se falhar ao parsear, lançar erro
        console.error("Falha ao analisar resposta do Gemini:", e);
        throw new ConvexError("Falha ao processar as perguntas geradas pela IA. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar perguntas com IA:", error);
      // Em caso de erro, lançar exceção
      if (error instanceof ConvexError) {
        throw error; // Repassa o erro específico que já foi criado
      }
      throw new ConvexError("Falha ao gerar perguntas com IA. Por favor, tente novamente.");
    }
  },
});

export const analyzeWithAI = action({
  args: {
    candidateId: v.id("candidates"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ConvexError("Gemini API key não encontrada");
    }

    // Inicializar o cliente do Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    try {
      // Buscar dados do candidato usando runQuery
      const candidate = await ctx.runQuery(internal.internalFunctions.getCandidate, {
        candidateId: args.candidateId,
      });
      if (!candidate) {
        throw new ConvexError("Candidato não encontrado");
      }

      // Buscar a vaga usando runQuery
      const job = await ctx.runQuery(internal.internalFunctions.getJob, {
        jobId: candidate.jobId,
      });
      if (!job) {
        throw new ConvexError("Vaga não encontrada");
      }

      // Buscar perguntas da vaga usando runQuery
      const questions = await ctx.runQuery(internal.internalFunctions.getQuestionsByJobId, {
        jobId: candidate.jobId,
      });

      // Buscar respostas do candidato usando runQuery
      const answers = await ctx.runQuery(internal.internalFunctions.getAnswersByCandidateId, {
        candidateId: args.candidateId,
      });

      // Preparar os dados para análise
      const questionsAndAnswers = questions.map(q => {
        const answer = answers.find(a => a.questionId === q._id);
        return {
          question: q.question,
          answer: answer ? answer.answer : "Sem resposta"
        };
      });

      // Preparar o prompt para o Gemini
      const prompt = `
        Você é um especialista em recrutamento e seleção com foco em análise cognitiva.
        
        Analise as respostas deste candidato para a seguinte vaga:
        
        Título: ${job.title}
        Empresa: ${job.company}
        Descrição: ${job.description}
        Habilidades Técnicas: ${job.skills}
        Experiência: ${job.experience}
        Perfil Ideal: ${job.idealProfile}
        
        Dados do candidato:
        Nome: ${candidate.name}
        
        Perguntas e Respostas:
        ${questionsAndAnswers.map(qa => `Pergunta: ${qa.question}\nResposta: ${qa.answer}`).join('\n\n')}
        
        Avalie o candidato com base em suas respostas, focando especialmente em:
        1. Capacidade cognitiva para a função
        2. Alinhamento com as necessidades da vaga
        3. Potencial de crescimento
        4. Pontos fortes e fracos
        
        Retorne sua análise em formato JSON, como este exemplo:
        {
          "score": 85,
          "strengths": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
          "weaknesses": ["Ponto fraco 1", "Ponto fraco 2"],
          "recommendation": "Uma recomendação geral sobre o candidato."
        }
        
        A pontuação (score) deve ser de 0 a 100, onde 100 é o candidato perfeito para a vaga.
      `;

      // Fazer a chamada para a API do Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new ConvexError("Resposta vazia do Gemini");
      }

      // Extrair o JSON da resposta
      let analysis;
      try {
        // Tenta extrair o JSON da resposta, removendo qualquer texto adicional
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          // Se não conseguir extrair com regex, tenta parsear diretamente
          analysis = JSON.parse(content);
        }
        
        // Garantir que strengths e weaknesses sejam arrays
        if (analysis.strengths && !Array.isArray(analysis.strengths)) {
          if (typeof analysis.strengths === 'string') {
            analysis.strengths = [analysis.strengths];
          } else {
            analysis.strengths = [];
          }
        }
        
        if (analysis.weaknesses && !Array.isArray(analysis.weaknesses)) {
          if (typeof analysis.weaknesses === 'string') {
            analysis.weaknesses = [analysis.weaknesses];
          } else {
            analysis.weaknesses = [];
          }
        }
        
        // Garantir que recommendation seja string
        if (analysis.recommendation && typeof analysis.recommendation !== 'string') {
          analysis.recommendation = String(analysis.recommendation);
        }
        
      } catch (e) {
        console.error("Falha ao analisar resposta do Gemini:", e);
        console.error("Conteúdo que falhou:", content);
        // Lançar erro
        throw new ConvexError("Falha ao processar a análise da IA. Por favor, tente novamente.");
      }

      // Atualizar todos os dados da análise do candidato no banco de dados usando runMutation
      await ctx.runMutation(internal.internalFunctions.updateCandidateAnalysis, { 
        candidateId: args.candidateId,
        score: analysis.score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendation: analysis.recommendation
      });

      return analysis;
    } catch (error) {
      console.error("Erro ao analisar candidato com IA:", error);
      // Lançar erro
      if (error instanceof ConvexError) {
        throw error; // Repassa o erro específico que já foi criado
      }
      throw new ConvexError("Falha ao analisar candidato com IA. Por favor, tente novamente.");
    }
  },
});