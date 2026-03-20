"use client";

import { useState, useRef, useEffect } from "react";
import { Conversation, DirectMessage } from "@/lib/types";
import { CURRENT_USER } from "@/lib/mock-data";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/uploadthing";

interface Props {
  initialConversation: Conversation;
}

type ThreadMessage = DirectMessage & {
  mediaUrl?: string;
  mediaType?: "image" | "video";
};

export default function MessageThread({ initialConversation }: Props) {
  const [messages, setMessages] = useState<ThreadMessage[]>(
    initialConversation.messages
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<
    "image" | "video" | null
  >(null);
  const [selectedMediaPreview, setSelectedMediaPreview] = useState<string | null>(
    null
  );
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const endpoint = isVideo ? "videoUploader" : "imageUploader";
    const mediaType = isVideo ? "video" : "image";

    setSelectedMediaPreview(URL.createObjectURL(file));
    setSelectedMediaType(mediaType);
    setUploadingMedia(true);

    try {
      const results = await uploadFiles(endpoint, {
        files: [file],
      });

      const uploadedUrl = results?.[0]?.ufsUrl ?? results?.[0]?.url;

      if (!uploadedUrl) {
        throw new Error("No se obtuvo URL del archivo subido");
      }

      setSelectedMediaUrl(uploadedUrl);
      toast.success(
        mediaType === "video"
          ? "Video subido con éxito"
          : "Imagen subida con éxito"
      );
    } catch (error) {
      console.error(error);
      setSelectedMediaUrl(null);
      setSelectedMediaType(null);
      setSelectedMediaPreview(null);
      toast.error("Error al subir el archivo");
    } finally {
      setUploadingMedia(false);
    }
  }

  function clearSelectedMedia() {
    setSelectedMediaUrl(null);
    setSelectedMediaType(null);
    setSelectedMediaPreview(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    const trimmedText = text.trim();
    const hasText = Boolean(trimmedText);
    const hasMedia = Boolean(selectedMediaUrl);

    if ((!hasText && !hasMedia) || sending || uploadingMedia) return;

    const optimistic: ThreadMessage = {
      id: `msg_optimistic_${Date.now()}`,
      senderId: CURRENT_USER.id,
      text: trimmedText,
      createdAt: new Date().toISOString(),
      isRead: false,
      mediaUrl: selectedMediaUrl ?? undefined,
      mediaType: selectedMediaType ?? undefined,
    };

    const previousText = text;
    const previousMediaUrl = selectedMediaUrl;
    const previousMediaType = selectedMediaType;
    const previousMediaPreview = selectedMediaPreview;

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    clearSelectedMedia();
    setSending(true);

    try {
      const payload = {
        text: trimmedText,
        mediaUrl: previousMediaUrl,
        mediaType: previousMediaType,
      };

      console.log("Message payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Message creado con éxito");
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimistic.id));
      setText(previousText);
      setSelectedMediaUrl(previousMediaUrl);
      setSelectedMediaType(previousMediaType);
      setSelectedMediaPreview(previousMediaPreview);
      toast.error("Error al enviar el mensaje");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={initialConversation.participant.avatar}
          alt={initialConversation.participant.username}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm">
            {initialConversation.participant.username}
          </p>
          <p className="text-xs text-gray-400">
            {initialConversation.participant.name}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === CURRENT_USER.id;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                }`}
              >
                {msg.text ? <p>{msg.text}</p> : null}

                {msg.mediaUrl && msg.mediaType === "image" && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.mediaUrl}
                      alt="Sent media"
                      className="mt-2 rounded-lg max-w-full object-cover"
                    />
                  </>
                )}

                {msg.mediaUrl && msg.mediaType === "video" && (
                  <video
                    src={msg.mediaUrl}
                    controls
                    className="mt-2 rounded-lg max-w-full"
                  />
                )}

                <p
                  className={`text-xs mt-1 ${
                    isMe ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {formatDistanceToNow(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Selected media preview */}
      {selectedMediaPreview && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="relative w-fit">
            {selectedMediaType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedMediaPreview}
                alt="Selected media preview"
                className="w-28 h-28 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <video
                src={selectedMediaPreview}
                className="w-28 h-28 rounded-xl object-cover border border-gray-200"
                muted
                controls
              />
            )}

            <button
              type="button"
              onClick={clearSelectedMedia}
              className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {uploadingMedia ? "Subiendo archivo..." : "Archivo listo para enviar"}
          </p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-3 border-t border-gray-200"
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700"
          disabled={uploadingMedia || sending}
        >
          +
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
        />

        <button
          type="submit"
          disabled={(!text.trim() && !selectedMediaUrl) || sending || uploadingMedia}
          className="text-sm font-semibold text-blue-500 disabled:opacity-40"
        >
          {uploadingMedia ? "Uploading..." : sending ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}