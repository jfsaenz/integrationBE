"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CURRENT_USER } from "@/lib/mock-data";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/uploadthing";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState(CURRENT_USER.name);
  const [bio, setBio] = useState(CURRENT_USER.bio);
  const [website, setWebsite] = useState(CURRENT_USER.website ?? "");
  const [avatarPreview, setAvatarPreview] = useState(CURRENT_USER.avatar);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);

    try {
      const results = await uploadFiles("imageUploader", {
        files: [file],
      });

      const uploadedUrl = results?.[0]?.ufsUrl ?? results?.[0]?.url;

      if (!uploadedUrl) {
        throw new Error("No se obtuvo URL del archivo subido");
      }

      setUploadedAvatarUrl(uploadedUrl);
      toast.success("Avatar subido con éxito");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el avatar");
    } finally {
      setUploadingAvatar(false);
    }

    
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        bio,
        website,
        avatarUrl: uploadedAvatarUrl ?? avatarPreview,
      };

      console.log("Profile payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSaved(true);
      toast.success("Usuario actualizado con éxito");

      setTimeout(() => {
        router.push(`/profile/${CURRENT_USER.username}`);
        router.refresh();
      }, 800);
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-8">Edit profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarPreview}
            alt="Avatar preview"
            className="w-16 h-16 rounded-full object-cover border border-gray-200"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-semibold text-blue-500 hover:text-blue-700"
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? "Uploading..." : "Change photo"}
            </button>
            {uploadedAvatarUrl && (
              <span className="text-xs text-green-600">Imagen subida</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={150}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-gray-500 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {bio.length}/150
          </p>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold mb-1.5">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || saved || uploadingAvatar}
          className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-40"
        >
          {uploadingAvatar
            ? "Uploading avatar..."
            : saved
            ? "Saved ✓"
            : loading
            ? "Saving…"
            : "Save changes"}
        </button>
      </form>
    </div>
  );
}