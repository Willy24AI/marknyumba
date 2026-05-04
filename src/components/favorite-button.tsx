"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { toggleFavoriteAction } from "@/lib/actions/social";

type Props = {
  propertyId: string;
  initialFavorited: boolean;
  signedIn: boolean;
};

export function FavoriteButton({ propertyId, initialFavorited, signedIn }: Props) {
  const [pending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  if (!signedIn) return null;

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      const res = await toggleFavoriteAction(propertyId);
      if (!res.ok) {
        setFavorited(!next);
      } else {
        setFavorited(res.favorited);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      title={favorited ? "Remove from favorites" : "Save listing"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-base shadow-md ring-1 ring-zinc-200/80 transition hover:scale-105 hover:bg-white disabled:opacity-60 dark:bg-zinc-900/95 dark:ring-zinc-700 sm:h-10 sm:w-10 sm:text-lg"
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
