"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";

export function LoginButton() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return null;
  }

  return (
    <SignInButton mode="modal">
      <Button className="bg-red-600 hover:bg-red-700">
        Entrar
      </Button>
    </SignInButton>
  );
}