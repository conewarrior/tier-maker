import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { Topic } from "@/types/tier";

interface TopicCardProps {
  topic: Topic;
  href: string;
}

export function TopicCard({ topic, href }: TopicCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent"
    >
      <h3 className="text-sm font-semibold text-foreground">{topic.title}</h3>
      {topic.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {topic.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {new Date(topic.created_at).toLocaleDateString("ko-KR")}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          티어 만들기
        </span>
      </div>
    </Link>
  );
}
