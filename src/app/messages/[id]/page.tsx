import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageComposer } from "@/components/message-composer";
import { getConversationById, listMessages } from "@/lib/data/messages";
import { createClient } from "@/lib/supabase/server";
import { unwrapOne } from "@/lib/supabase/nested";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Conversation | Mark Nyumba", robots: { index: false, follow: false } };
}

export default async function MessageThreadPage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: conv, error: ce } = await getConversationById(supabase, id, user.id);
  if (ce || !conv) notFound();

  const { data: messages, error: me } = await listMessages(supabase, id, user.id);
  if (me) notFound();

  const prop = unwrapOne(
    conv.properties as { title?: string } | { title?: string }[] | null | undefined
  );
  const title = prop?.title ?? "Listing";
  const propertyId = conv.property_id;

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6">
      <Link
        href="/messages"
        className="mb-6 inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        ← All messages
      </Link>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
        <Link
          href={`/listings/${propertyId}`}
          className="mt-1 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-400"
        >
          View listing →
        </Link>
      </div>

      <ul className="flex flex-1 flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        {messages.length === 0 && (
          <li className="text-center text-sm text-zinc-500 dark:text-zinc-400">No messages yet.</li>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <li
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                mine
                  ? "ml-auto bg-emerald-700 text-white dark:bg-emerald-600"
                  : "mr-auto border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p
                className={`mt-1 text-[10px] uppercase tracking-wide ${
                  mine ? "text-emerald-100/90" : "text-zinc-400"
                }`}
              >
                {new Date(m.created_at).toLocaleString()}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Reply</h2>
        {q.err && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {q.err}
          </p>
        )}
        <MessageComposer conversationId={id} />
      </div>
    </div>
  );
}
