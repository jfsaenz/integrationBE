"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, Post } from "@/lib/types";
import { CURRENT_USER } from "@/lib/mock-data";
import Link from "next/link";
import { toast } from "sonner";

type ProfileResponse = {
  user: User;
  posts: Post[];
};

type Reel = {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
};

type ProfileTab = "posts" | "reels" | "saved";
type FollowListType = "followers" | "following" | null;

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  const [openList, setOpenList] = useState<FollowListType>(null);
  const [followUsers, setFollowUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      try {
        const res = await fetch(`/api/profile/${username}`);

        if (!res.ok) {
          throw new Error("Profile not found");
        }

        const data: ProfileResponse = await res.json();
        setUser(data.user);
        setPosts(data.posts ?? []);
      } catch {
        setUser(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  useEffect(() => {
    async function loadReels() {
      if (activeTab !== "reels") return;

      setReelsLoading(true);

      try {
        const res = await fetch(`/api/profile/${username}/reels`);

        if (!res.ok) {
          throw new Error("Could not load reels");
        }

        const data = await res.json();
        setReels(Array.isArray(data) ? data : data.reels ?? []);
      } catch {
        setReels([]);
        toast.error("No se pudieron cargar los reels");
      } finally {
        setReelsLoading(false);
      }
    }

    loadReels();
  }, [activeTab, username]);

  async function handleFollow() {
    if (isFollowing || followLoading) return;

    setFollowLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsFollowing(true);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              followersCount: prev.followersCount + 1,
            }
          : prev
      );

      toast.success("Usuario seguido con éxito");
    } catch {
      toast.error("Error al seguir al usuario");
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleOpenFollowList(type: "followers" | "following") {
    setOpenList(type);
    setListLoading(true);

    try {
      const res = await fetch(`/api/profile/${username}/${type}`);

      if (!res.ok) {
        throw new Error(`Could not load ${type}`);
      }

      const data = await res.json();
      setFollowUsers(Array.isArray(data) ? data : data.users ?? []);
    } catch {
      setFollowUsers([]);
      toast.error(`No se pudo cargar la lista de ${type}`);
    } finally {
      setListLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        User not found.
      </div>
    );
  }

  const isOwn = username === CURRENT_USER.username;

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-8 md:gap-16 items-start mb-8">
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar}
              alt={user.username}
              className="w-20 h-20 md:w-36 md:h-36 rounded-full object-cover border border-gray-200"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-xl font-light">{user.username}</h1>

              {user.isVerified && (
                <svg
                  viewBox="0 0 24 24"
                  fill="#3b82f6"
                  className="w-5 h-5"
                  aria-label="Verified"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              )}

              {isOwn ? (
                <Link
                  href="/profile/edit"
                  className="px-4 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Edit profile
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    disabled={isFollowing || followLoading}
                    className="px-6 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60"
                  >
                    {followLoading
                      ? "Following..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </button>

                  <Link
                    href="/messages"
                    className="px-4 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Message
                  </Link>
                </>
              )}
            </div>

            <div className="flex gap-6 mb-4">
              <div>
                <span className="font-semibold">
                  {user.postsCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">posts</span>
              </div>

              <button
                onClick={() => handleOpenFollowList("followers")}
                className="hover:opacity-70"
              >
                <span className="font-semibold">
                  {user.followersCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">followers</span>
              </button>

              <button
                onClick={() => handleOpenFollowList("following")}
                className="hover:opacity-70"
              >
                <span className="font-semibold">
                  {user.followingCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">following</span>
              </button>
            </div>

            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              {user.bio && (
                <p className="text-sm whitespace-pre-line mt-0.5">{user.bio}</p>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-900 font-semibold hover:underline mt-0.5 block"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 flex justify-center gap-10 mb-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-widest ${
              activeTab === "posts"
                ? "border-t-2 border-gray-900"
                : "text-gray-400"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
            Posts
          </button>

          <button
            onClick={() => setActiveTab("reels")}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-widest ${
              activeTab === "reels"
                ? "border-t-2 border-gray-900"
                : "text-gray-400"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.375 9h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 20.625v-9.75C1.5 9.839 2.34 9 3.375 9z"
              />
            </svg>
            Reels
          </button>

          {isOwn && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-widest ${
                activeTab === "saved"
                  ? "border-t-2 border-gray-900"
                  : "text-gray-400"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
              Saved
            </button>
          )}
        </div>

        {activeTab === "posts" && (
          posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square group overflow-hidden bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={post.caption || "Post image"}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white text-sm font-semibold">
                    <div className="flex items-center gap-1.5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span>{post.likesCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
                      </svg>
                      <span>{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-16 text-gray-400">
              No posts yet.
            </div>
          )
        )}

        {activeTab === "reels" && (
          reelsLoading ? (
            <div className="flex justify-center py-16 text-gray-400">
              Loading reels…
            </div>
          ) : reels.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="relative aspect-square overflow-hidden bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reel.thumbnailUrl || reel.videoUrl || "/placeholder.png"}
                    alt={reel.caption || "Reel thumbnail"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-16 text-gray-400">
              No reels yet.
            </div>
          )
        )}

        {activeTab === "saved" && (
          <div className="flex justify-center py-16 text-gray-400">
            Saved posts coming soon.
          </div>
        )}
      </div>

      {openList && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setOpenList(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold capitalize">{openList}</h2>
              <button
                onClick={() => setOpenList(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {listLoading ? (
                <div className="py-10 text-center text-gray-400">
                  Loading {openList}…
                </div>
              ) : followUsers.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {followUsers.map((followUser) => (
                    <div
                      key={followUser.id}
                      className="flex items-center gap-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={followUser.avatar}
                        alt={followUser.username}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">
                          {followUser.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {followUser.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-400">
                  No {openList} found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}