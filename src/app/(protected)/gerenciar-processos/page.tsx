"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Id } from "@/../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function GerenciarJobsPage() {
    const router = useRouter();
    const { user } = useUser();
    const jobs = useQuery(api.jobs.getJobs, user?.id ? { userId: user.id } : "skip");
    const updateJob = useMutation(api.jobs.updateJob);
    const updateQuestion = useMutation(api.questions.updateQuestion);
    const createQuestion = useMutation(api.questions._createQuestion);
    const deleteQuestion = useMutation(api.questions.deleteQuestion);

    const [selectedJobId, setSelectedJobId] = useState<Id<"jobs"> | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        description: "",
        skills: "",
        experience: "",
        idealProfile: "",
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<{ id: Id<"questions">; index: number } | null>(null);
    const [confirmationText, setConfirmationText] = useState("");

    // Buscar perguntas do job selecionado
    const questions = useQuery(
        api.questions.getQuestionsByJobId,
        selectedJobId ? { jobId: selectedJobId } : "skip"
    );

    // Carregar dados do job selecionado
    const selectedJob = useQuery(
        api.jobs.getJob,
        selectedJobId && user?.id ? { jobId: selectedJobId, userId: user.id } : "skip"
    );

    // Atualizar formData quando um job for selecionado
    useEffect(() => {
        if (selectedJob) {
            setFormData({
                title: selectedJob.title || "",
                company: selectedJob.company || "",
                description: selectedJob.description || "",
                skills: selectedJob.skills || "",
                experience: selectedJob.experience || "",
                idealProfile: selectedJob.idealProfile || "",
            });
        }
    }, [selectedJob]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index: number, value: string) => {
        if (!questions) return;

        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], question: value };
    };

    const handleAddQuestion = () => {
        if (newQuestion.trim() && selectedJobId) {
            createQuestion({
                jobId: selectedJobId,
                question: newQuestion,
                type: "text",
            }).then(() => {
                setNewQuestion("");
            });
        }
    };


    const handleRemoveQuestion = (questionId: Id<"questions">, index: number) => {
        setQuestionToDelete({ id: questionId, index });
        setConfirmationText("");
        setDeleteModalOpen(true);
    };

    // Função para confirmar e executar a exclusão
    const confirmDelete = () => {
        if (!questionToDelete) return;

        deleteQuestion({ questionId: questionToDelete.id });
        setDeleteModalOpen(false);
        setQuestionToDelete(null);
        setConfirmationText("");
    };

    const handleSaveJob = async () => {
        if (!selectedJobId) return;

        setLoading(true);
        try {
            // Atualizar job
            await updateJob({
                jobId: selectedJobId,
                ...formData,
            });

            // Atualizar perguntas
            if (questions) {
                for (const q of questions) {
                    await updateQuestion({
                        questionId: q._id,
                        question: q.question,
                    });
                }
            }

            setEditMode(false);
        } catch (error) {
            console.error("Erro ao salvar job:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">Gerenciar Processos Seletivos</h1>
                        <p className="text-zinc-400">Visualize e edite seus processos seletivos</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Lista de Jobs */}
                        <div className="md:col-span-1">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle>Seus Processos</CardTitle>
                                    <CardDescription className="text-zinc-400">Selecione um processo para gerenciar</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {jobs && jobs.length > 0 ? (
                                            jobs.map((job) => (
                                                <div
                                                    key={job._id}
                                                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedJobId === job._id ? 'bg-red-600/20 border border-red-600/30' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                                                    onClick={() => {
                                                        setSelectedJobId(job._id);
                                                        setEditMode(false);
                                                    }}
                                                >
                                                    <div className="font-medium">{job.title}</div>
                                                    <div className="text-sm text-zinc-400">{job.company}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-zinc-400 text-center py-4">
                                                Nenhum processo encontrado
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={() => router.push('/criar-processo')}
                                        className="w-full bg-red-600 hover:bg-red-700"
                                    >
                                        Criar Novo Processo
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Detalhes do Job */}
                        <div className="md:col-span-2">
                            {selectedJobId && selectedJob ? (
                                <Card className="bg-zinc-900 border-zinc-800">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>{editMode ? 'Editar Processo' : selectedJob.title}</CardTitle>
                                            <CardDescription className="text-zinc-400">
                                                {editMode ? 'Modifique as informações do processo' : selectedJob.company}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={() => setEditMode(!editMode)}
                                            variant="outline"
                                            className="border-zinc-700 hover:bg-zinc-800"
                                        >
                                            {editMode ? 'Cancelar' : 'Editar'}
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {editMode ? (
                                            <div className="space-y-6">
                                                {/* Formulário de edição */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor="title" className="block text-sm font-medium mb-1">Título da Vaga</label>
                                                        <Input
                                                            id="title"
                                                            name="title"
                                                            value={formData.title}
                                                            onChange={handleChange}
                                                            className="bg-zinc-800 border-zinc-700"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="company" className="block text-sm font-medium mb-1">Empresa</label>
                                                        <Input
                                                            id="company"
                                                            name="company"
                                                            value={formData.company}
                                                            onChange={handleChange}
                                                            className="bg-zinc-800 border-zinc-700"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição da Vaga</label>
                                                        <Textarea
                                                            id="description"
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleChange}
                                                            className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="skills" className="block text-sm font-medium mb-1">Habilidades Técnicas</label>
                                                        <Textarea
                                                            id="skills"
                                                            name="skills"
                                                            value={formData.skills}
                                                            onChange={handleChange}
                                                            className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="experience" className="block text-sm font-medium mb-1">Experiência Necessária</label>
                                                        <Textarea
                                                            id="experience"
                                                            name="experience"
                                                            value={formData.experience}
                                                            onChange={handleChange}
                                                            className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="idealProfile" className="block text-sm font-medium mb-1">Perfil Ideal do Candidato</label>
                                                        <Textarea
                                                            id="idealProfile"
                                                            name="idealProfile"
                                                            value={formData.idealProfile}
                                                            onChange={handleChange}
                                                            className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Perguntas */}
                                                <div className="mt-8">
                                                    <h3 className="text-lg font-medium mb-4">Perguntas</h3>

                                                    {questions && questions.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {questions.map((q, index) => (
                                                                <div key={q._id} className="bg-zinc-800 p-4 rounded-lg">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="text-sm font-medium text-zinc-400">Pergunta {index + 1}</span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-red-500 hover:text-red-400 hover:bg-zinc-700 h-8 px-2"
                                                                            onClick={() => handleRemoveQuestion(q._id, index)}
                                                                        >
                                                                            Remover
                                                                        </Button>
                                                                    </div>
                                                                    <Textarea
                                                                        value={q.question}
                                                                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                                                                        className="bg-zinc-700 border-zinc-600 min-h-[100px]"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-zinc-400 text-center py-4">
                                                            Nenhuma pergunta encontrada
                                                        </div>
                                                    )}

                                                    {/* Adicionar nova pergunta */}
                                                    <div className="bg-zinc-800 p-4 rounded-lg mt-6">
                                                        <h3 className="text-sm font-medium mb-2">Adicionar Nova Pergunta</h3>
                                                        <Textarea
                                                            value={newQuestion}
                                                            onChange={(e) => setNewQuestion(e.target.value)}
                                                            placeholder="Digite uma nova pergunta personalizada..."
                                                            className="bg-zinc-700 border-zinc-600 min-h-[100px] mb-3"
                                                        />
                                                        <Button
                                                            onClick={handleAddQuestion}
                                                            className="w-full bg-zinc-700 hover:bg-zinc-600"
                                                            disabled={!newQuestion.trim()}
                                                        >
                                                            Adicionar Pergunta
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Visualização dos detalhes */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Descrição da Vaga</h3>
                                                    <p className="whitespace-pre-line">{selectedJob.description}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Habilidades Técnicas</h3>
                                                    <p className="whitespace-pre-line">{selectedJob.skills}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Experiência Necessária</h3>
                                                    <p className="whitespace-pre-line">{selectedJob.experience}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Perfil Ideal</h3>
                                                    <p className="whitespace-pre-line">{selectedJob.idealProfile}</p>
                                                </div>

                                                {/* Perguntas */}
                                                <div className="mt-8">
                                                    <h3 className="text-lg font-medium mb-4">Perguntas</h3>

                                                    {questions && questions.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {questions.map((q, index) => (
                                                                <div key={q._id} className="bg-zinc-800 p-4 rounded-lg">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="text-sm font-medium text-zinc-400">Pergunta {index + 1}</span>
                                                                    </div>
                                                                    <p className="whitespace-pre-line">{q.question}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-zinc-400 text-center py-4">
                                                            Nenhuma pergunta encontrada
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Link de captação */}
                                                <div className="mt-8">
                                                    <h3 className="text-lg font-medium mb-2">Link de Captação</h3>
                                                    <div className="bg-zinc-800 p-4 rounded-lg">
                                                        <p className="text-sm mb-2">Compartilhe este link com os candidatos:</p>
                                                        <Input
                                                            value={`${window.location.origin}/candidatar/${selectedJobId}`}
                                                            readOnly
                                                            className="bg-zinc-700 border-zinc-600"
                                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    {editMode && (
                                        <CardFooter>
                                            <Button
                                                onClick={handleSaveJob}
                                                className="w-full bg-red-600 hover:bg-red-700"
                                                disabled={loading}
                                            >
                                                {loading ? "Salvando..." : "Salvar Alterações"}
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            ) : (
                                <Card className="bg-zinc-900 border-zinc-800">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <p className="text-zinc-400 mb-4">Selecione um processo para visualizar os detalhes</p>
                                        <Button
                                            onClick={() => router.push('/criar-processo')}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Criar Novo Processo
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal de confirmação para exclusão de pergunta */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Esta ação é irreversível. A pergunta será permanentemente removida do processo seletivo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="mb-4">Para confirmar a exclusão, digite a pergunta a ser excluída abaixo:</p>

                        <Input
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder={`pergunta ${questionToDelete?.index !== undefined ? questionToDelete.index + 1 : ''}`}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            className="border-zinc-700 hover:bg-zinc-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={confirmationText.toLowerCase() !== `pergunta ${questionToDelete?.index !== undefined ? questionToDelete.index + 1 : ''}`}
                        >
                            Excluir Pergunta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
