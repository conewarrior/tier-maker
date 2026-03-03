"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/app/actions/social";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  tierListId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}

export default function LikeButton({
  tierListId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Optimistic update
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    startTransition(async () => {
      const result = await toggleLike(tierListId);
      if (result.error) {
        // Revert on error
        setLiked(prevLiked);
        setCount(prevCount);
      } else if (result.data) {
        setLiked(result.data.liked);
        setCount(result.data.likeCount);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent",
        liked && "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      )}
    >
      <Heart
        className={cn("h-4 w-4", liked && "fill-current")}
      />
      <span>{count}</span>
    </button>
  );
}
