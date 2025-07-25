"use client";

import { UserButton as ClerkUserButton, useAuth } from "@clerk/nextjs";

export function UserButton() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return null;
  }

  return (
    <ClerkUserButton afterSignOutUrl="/" />
  );
}