"use client";
import React from "react";
import LoginForm from "@/components/admin-login";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Brain size={32} className="text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              GenTel™ Access
            </h1>
            <p className="text-sm text-muted-foreground">
              Please enter your credentials to continue.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <LoginForm onSuccess={() => router.push("/")} />
        </div>

        <div className="mt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Secure Environment • TacticDev Intelligence
        </div>
      </div>
    </div>
  );
}
