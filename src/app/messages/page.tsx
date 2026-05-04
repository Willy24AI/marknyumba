import type { Metadata } from "next";
import Link from "next/link";
import { listConversationsForUser } from "@/lib/data/messages";
import { createClient } from "@/lib/supabase/server";

type PageProps = { searchParams: Promise<{ err?: string }> };
import { unwrapOne } from "@/lib/supabase/nested";
import type { ConversationWithProperty } from "@/types/social";

export const metadata: Metadata = {
  title: "Messages | Mark Nyumba",
  description: "Conversations with buyers and sellers.",
};

type PropSnippet = { title?: string; image_urls?: string[] | null; city?: string };

function propOf(c: ConversationWithProperty): PropSnippet | null {
  return unwrapOne(c.properties as PropSnippet | PropSnippet[] | null);
}

function convImage(c: ConversationWithProperty) {
  const urls = propOf(c)?.image_urls;
  return urls?.[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80";
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const q = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: conversations, error } = await listConversationsForUser(supabase, user.id);

  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Messages</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Chats tied to a specific listing. You can message sellers as a buyer, or reply when you list property.
      </p>

      {q.err && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {q.err}
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {!error && conversations.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-zinc-200 py-12 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          No conversations yet. Open a listing and use &ldquo;Contact seller&rdquo; to start one.
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {conversations.map((c) => {
          const p = propOf(c);
          const title = p?.title ?? "Listing";
          const city = p?.city ?? "";
          const role = c.buyer_id === user.id ? "You · buyer" : "You · seller";
          const updated = new Date(c.updated_at).toLocaleString();

          return (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={convImage(c)}
                  alt=""
                  className="h-16 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {city} · {role}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">Updated {updated}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
