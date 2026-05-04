"use client";

import { useFormStatus } from "react-dom";
import { sendMessageAction } from "@/lib/actions/social";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-500"
    >
      {pending ? "Sending…" : label}
    </button>
  );
}

type Props = {
  /** New thread about a listing */
  propertyId?: string;
  /** Reply in an existing thread */
  conversationId?: string;
  submitLabel?: string;
};

export function MessageComposer({ propertyId, conversationId, submitLabel }: Props) {
  const label = submitLabel ?? (conversationId ? "Send reply" : "Message seller");

  return (
    <form action={sendMessageAction} className="space-y-3">
      {conversationId ? (
        <input type="hidden" name="conversation_id" value={conversationId} />
      ) : null}
      {propertyId && !conversationId ? <input type="hidden" name="property_id" value={propertyId} /> : null}
      <textarea
        name="body"
        required
        minLength={1}
        maxLength={5000}
        rows={4}
        placeholder="Introduce yourself and ask about viewing, price, or terms…"
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <SubmitButton label={label} />
    </form>
  );
}
