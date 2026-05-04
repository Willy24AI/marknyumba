import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | Mark Nyumba",
  description: "Sign in to list and manage properties in Uganda.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold text-brand-800 dark:text-brand-400">
            Mark Nyumba
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in with Google or email to manage your listings.
          </p>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
