/**
 * DiscussionThread — Database-backed threaded comment system
 *
 * Gothic-themed comment UI for the Balance Analysis page.
 * Supports:
 * - Top-level comments and nested replies (1 level deep)
 * - Guest identity via localStorage (sinnerName + guestId)
 * - Upvoting
 * - Delete own comments
 * - Mobile responsive
 *
 * Uses direct fetch to /api/trpc/* endpoints (no tRPC React provider needed).
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ────────────────────────────────────────────────── */
interface CommentData {
  id: number;
  authorName: string;
  content: string;
  upvotes: number;
  createdAt: string;
  guestId: string | null;
  parentId: number | null;
  pageContext: string;
  section: string | null;
  userId: number | null;
  updatedAt: string;
}

/* ─── tRPC fetch helpers ───────────────────────────────────── */
const TRPC_BASE = "/api/trpc";

async function trpcQuery<T>(
  path: string,
  input: Record<string, unknown>
): Promise<T> {
  const url = `${TRPC_BASE}/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`tRPC query failed: ${res.status}`);
  const json = await res.json();
  return json.result?.data?.json as T;
}

async function trpcMutate<T>(
  path: string,
  input: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${TRPC_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: input }),
  });
  if (!res.ok) throw new Error(`tRPC mutation failed: ${res.status}`);
  const json = await res.json();
  return json.result?.data?.json as T;
}

/* ─── Guest Identity (localStorage) ─────────────────────────── */
function getGuestIdentity(): { guestId: string; guestName: string } {
  let guestId = localStorage.getItem("discussion_guestId");
  let guestName = localStorage.getItem("discussion_guestName") || "";
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("discussion_guestId", guestId);
  }
  return { guestId, guestName };
}

function setGuestName(name: string) {
  localStorage.setItem("discussion_guestName", name);
}

/* ─── Time Formatting ───────────────────────────────────────── */
function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/* ─── Comment Form ──────────────────────────────────────────── */
function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Share your thoughts on the balance analysis...",
  isReply = false,
  isSubmitting = false,
}: {
  onSubmit: (name: string, content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
  isSubmitting?: boolean;
}) {
  const { guestName } = getGuestIdentity();
  const [name, setName] = useState(guestName);
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setGuestName(name.trim());
    onSubmit(name.trim(), content.trim());
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!isReply && (
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your sinful name..."
            maxLength={100}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
            style={{ fontFamily: "var(--font-body)" }}
          />
        </div>
      )}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={2000}
          rows={isReply ? 2 : 4}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
          style={{ fontFamily: "var(--font-body)" }}
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors tracking-wider uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!name.trim() || !content.trim() || isSubmitting}
          className="px-5 py-2 text-xs tracking-wider uppercase rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            fontFamily: "var(--font-heading)",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "rgba(245, 158, 11, 0.9)",
          }}
        >
          {isSubmitting ? "Posting..." : isReply ? "Reply" : "Post Comment"}
        </button>
      </div>
    </form>
  );
}

/* ─── Single Comment ────────────────────────────────────────── */
function Comment({
  comment,
  onReply,
  onDelete,
  onUpvote,
  isOwn,
  depth = 0,
}: {
  comment: CommentData;
  onReply: (parentId: number) => void;
  onDelete: (id: number) => void;
  onUpvote: (id: number) => void;
  isOwn: boolean;
  depth?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group ${depth > 0 ? "ml-6 sm:ml-10 pl-4 border-l border-amber-500/10" : ""}`}
    >
      <div
        className="rounded-lg p-4 transition-all duration-200 hover:bg-white/[0.02]"
        style={{
          background: depth > 0
            ? "rgba(0, 0, 0, 0.15)"
            : "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
          border: "1px solid rgba(255, 255, 255, 0.04)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              color: "rgba(245, 158, 11, 0.8)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <span
            className="text-sm font-semibold text-amber-200/80 tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {comment.authorName}
          </span>
          <span className="text-[10px] text-white/20">{timeAgo(comment.createdAt)}</span>
          {isOwn && (
            <span className="text-[9px] text-amber-500/30 tracking-wider uppercase ml-1" style={{ fontFamily: "var(--font-heading)" }}>
              You
            </span>
          )}
        </div>

        {/* Content */}
        <p
          className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap break-words"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onUpvote(comment.id)}
            className="flex items-center gap-1 text-[11px] text-white/30 hover:text-amber-400/70 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
            <span>{comment.upvotes > 0 ? comment.upvotes : ""}</span>
          </button>

          {depth === 0 && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-[11px] text-white/30 hover:text-amber-400/70 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10l7-7v4c11 0 11 9 11 9s-2-5-11-5v4z" />
              </svg>
              Reply
            </button>
          )}

          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-[11px] text-white/30 hover:text-red-400/70 transition-colors ml-auto"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Thread Component ─────────────────────────────────── */
export default function DiscussionThread({
  pageContext = "balance",
}: {
  pageContext?: string;
}) {
  const { guestId } = getGuestIdentity();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const data = await trpcQuery<CommentData[]>("discussion.list", { pageContext });
      setComments(data || []);
      setError(null);
    } catch (err) {
      console.error("[Discussion] Failed to fetch comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [pageContext]);

  // Initial load + polling
  useEffect(() => {
    fetchComments();
    refreshTimerRef.current = setInterval(fetchComments, 30000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchComments]);

  // Create comment
  const handleSubmit = useCallback(
    async (name: string, content: string) => {
      setIsSubmitting(true);
      try {
        await trpcMutate("discussion.create", {
          pageContext,
          authorName: name,
          guestId,
          content,
        });
        await fetchComments();
      } catch (err) {
        console.error("[Discussion] Failed to create comment:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [pageContext, guestId, fetchComments]
  );

  // Reply to comment
  const handleReply = useCallback(
    async (name: string, content: string) => {
      if (replyingTo === null) return;
      setIsSubmitting(true);
      try {
        await trpcMutate("discussion.create", {
          pageContext,
          parentId: replyingTo,
          authorName: name,
          guestId,
          content,
        });
        setReplyingTo(null);
        await fetchComments();
      } catch (err) {
        console.error("[Discussion] Failed to create reply:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [pageContext, guestId, replyingTo, fetchComments]
  );

  // Delete comment
  const handleDelete = useCallback(
    async (commentId: number) => {
      try {
        await trpcMutate("discussion.delete", { commentId });
        // Optimistic: remove from local state immediately
        setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      } catch (err) {
        console.error("[Discussion] Failed to delete comment:", err);
      }
    },
    []
  );

  // Upvote comment
  const handleUpvote = useCallback(
    async (commentId: number) => {
      // Optimistic update
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c))
      );
      try {
        await trpcMutate("discussion.upvote", { commentId });
      } catch (err) {
        // Revert on failure
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, upvotes: c.upvotes - 1 } : c))
        );
        console.error("[Discussion] Failed to upvote:", err);
      }
    },
    []
  );

  // Build thread structure
  const threads = useMemo(() => {
    const topLevel = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);
    return topLevel.map((parent) => ({
      parent,
      replies: replies.filter((r) => r.parentId === parent.id),
    }));
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Comment count header */}
      <div className="flex items-center gap-3">
        <h3
          className="text-lg text-white/80"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Community Discussion
        </h3>
        <span className="text-xs text-white/20 bg-white/5 px-2 py-0.5 rounded-full">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* New comment form */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(15, 12, 10, 0.6), rgba(20, 15, 12, 0.4))",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <CommentForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          placeholder="Share your observations on faction balance, matchup dynamics, or suggest improvements..."
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-400/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
            {error}
          </p>
          <button
            onClick={fetchComments}
            className="mt-2 text-xs text-amber-500/50 hover:text-amber-500/80 transition-colors tracking-wider uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500/60 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && comments.length === 0 && (
        <div className="text-center py-10">
          <div className="text-white/10 text-4xl mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto opacity-30">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-body)" }}>
            No comments yet. Be the first to share your analysis.
          </p>
        </div>
      )}

      {/* Comment threads */}
      <AnimatePresence mode="popLayout">
        {threads.map(({ parent, replies }) => (
          <div key={parent.id} className="space-y-2">
            <Comment
              comment={parent}
              onReply={setReplyingTo}
              onDelete={handleDelete}
              onUpvote={handleUpvote}
              isOwn={parent.guestId === guestId}
            />

            {/* Replies */}
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                onReply={() => setReplyingTo(parent.id)}
                onDelete={handleDelete}
                onUpvote={handleUpvote}
                isOwn={reply.guestId === guestId}
                depth={1}
              />
            ))}

            {/* Reply form */}
            {replyingTo === parent.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 sm:ml-10 pl-4 border-l border-amber-500/10"
              >
                <div className="py-2">
                  <p className="text-[10px] text-white/20 mb-2 tracking-wider uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                    Replying to {parent.authorName}
                  </p>
                  <CommentForm
                    onSubmit={handleReply}
                    onCancel={() => setReplyingTo(null)}
                    placeholder={`Reply to ${parent.authorName}...`}
                    isReply
                    isSubmitting={isSubmitting}
                  />
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
