"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Tab = "post" | "reel";

export default function CreatePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("post");
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [audioTrack, setAudioTrack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    // TODO (BONO): Upload the file to UploadThing and save the returned URL.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!preview) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulación de POST
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (tab === "post") {
        toast.success("Post creado con éxito");
      } else {
        toast.success("Reel creado con éxito");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Error al crear");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Create new {tab}</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {(["post", "reel"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPreview(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* File picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden"
        >
          {preview ? (
            tab === "post" ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={preview}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400 p-8 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="font-semibold text-sm">
                Click to select a file
              </p>
              <p className="text-xs">
                {tab === "post" ? "JPEG, PNG, WEBP" : "MP4, MOV"}
              </p>
              {/* TODO (BONO): Replace this area with UploadDropzone */}
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={tab === "post" ? "image/*" : "video/*"}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-blue-400 transition-colors"
            required
          />
        </div>

        {tab === "post" && (
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add a location"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        )}

        {tab === "reel" && (
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Audio track (optional)
            </label>
            <input
              type="text"
              value={audioTrack}
              onChange={(e) => setAudioTrack(e.target.value)}
              placeholder="e.g. Golden Hour — JVKE"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !caption.trim() || !preview}
          className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-40"
        >
          {loading ? "Sharing…" : `Share ${tab}`}
        </button>
      </form>
    </div>
  );
}