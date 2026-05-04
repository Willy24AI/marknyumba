import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create account | Mark Nyumba",
  description: "Create an account to list properties for sale or rent in Uganda.",
};

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold text-emerald-800 dark:text-emerald-400">
            Mark Nyumba
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Save favorite listings, message sellers, or publish your own properties with photos and descriptions.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
