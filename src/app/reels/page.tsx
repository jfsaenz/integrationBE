"use client";

import { useEffect, useState } from "react";
import { Reel } from "@/lib/types";
import ReelCard from "@/components/ReelCard";

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReels() {
      try {
        const res = await fetch("/api/reels");

        if (!res.ok) {
          throw new Error("Error loading reels");
        }

        const data = await res.json();
        setReels(Array.isArray(data) ? data : data.reels ?? []);
      } catch (error) {
        console.error(error);
        setReels([]);
      } finally {
        setLoading(false);
      }
    }

    loadReels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        Loading reels…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 px-4">
      <h1 className="text-xl font-bold mb-6 self-start lg:self-center">
        Reels
      </h1>

      <div className="flex flex-col gap-6 items-center w-full">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  );
}