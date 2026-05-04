"use client";

import { useState, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const TEXTAREA_ID = "image_urls";

export function PropertyImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = input.files;
    if (!files?.length) return;

    setHint(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setHint("Sign in to upload photos.");
        setUploading(false);
        return;
      }

      const ta = document.getElementById(TEXTAREA_ID) as HTMLTextAreaElement | null;

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const safeName = file.name.replace(/[^\w.-]/g, "_").slice(0, 80);
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("property-images").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) {
          setHint(error.message);
          continue;
        }
        const { data: pub } = supabase.storage.from("property-images").getPublicUrl(path);
        const url = pub.publicUrl;
        if (ta) {
          const cur = ta.value.trim();
          ta.value = cur ? `${cur}\n${url}` : url;
        }
      }
    } catch (err) {
      setHint(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-800/50">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upload photos</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Uploaded photo links are added to the image field below.
      </p>
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={onFileChange}
        className="mt-3 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-800 dark:text-zinc-400 dark:file:bg-emerald-600"
      />
      {uploading && <p className="mt-2 text-xs text-zinc-500">Uploading…</p>}
      {hint && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{hint}</p>}
    </div>
  );
}
