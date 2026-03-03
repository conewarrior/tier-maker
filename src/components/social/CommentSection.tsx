"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Trash2, User } from "lucide-react";
import Link from "next/link";
import { addComment, deleteComment } from "@/app/actions/social";
import type { CommentWithUser } from "@/app/actions/social";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  tierListId: string;
  initialComments: CommentWithUser[];
  currentUserId: string | null;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;

  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export default function CommentSection({
  tierListId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await addComment(tierListId, trimmed);
      if (result.data) {
        setComments((prev) => [...prev, result.data!]);
        setContent("");
      }
    });
  }

  function handleDelete(commentId: string) {
    // Optimistic removal
    const prev = comments;
    setComments((c) => c.filter((item) => item.id !== commentId));

    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.error) {
        setComments(prev);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          댓글 {comments.length}
        </span>
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                {comment.user?.avatar_url ? (
                  <img
                    src={comment.user.avatar_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {comment.user?.nickname ?? "익명"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                  {currentUserId === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                      className="ml-auto rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            maxLength={500}
            rows={3}
            className={cn(
              "w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length}/500
            </span>
            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className={cn(
                "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors",
                "hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isPending ? "작성 중..." : "댓글 작성"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-md border border-border px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">
            댓글을 작성하려면{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              로그인
            </Link>
            이 필요합니다.
          </p>
        </div>
      )}
    </div>
  );
}
