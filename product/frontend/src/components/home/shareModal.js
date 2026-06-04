"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import { sharePost } from "@/lib/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ModalPortal from "../ui/modalPortal";

const ShareModal = ({ post, user, onClose }) => {
  const [desc, setDesc] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Always show the root post (never a share-of-a-share)
  const original = post.sharedPost ?? post;

  const handleShare = async () => {
    if (!user?.id) return;
    setIsPending(true);
    try {
      const result = await sharePost(post.id, user.id, desc);
      if (result.success) {
        toast("Post shared to your feed!");
        router.refresh();
        onClose();
      }
    } catch {
      toast("Failed to share post. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-800">Share to Feed</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Sharer user row */}
            <div className="flex items-center gap-3 px-5 pt-4">
              <img
                src={user?.avatar || "/user-default.png"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <p className="text-sm font-semibold text-gray-800">
                {[user?.name, user?.surname].filter(Boolean).join(" ") || "You"}
              </p>
            </div>

            {/* Optional comment */}
            <textarea
              placeholder="Say something about this…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full px-5 pt-3 pb-2 resize-none text-gray-800 placeholder-gray-400 text-base focus:outline-none"
            />

            {/* Embedded original post preview */}
            <div className="mx-5 mb-5 rounded-xl border border-gray-200 overflow-hidden">
              {/* Original post header */}
              <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
                <img
                  src={original.user?.avatar || "/user-default.png"}
                  alt="original poster"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-[#FF4E01]"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {[original.user?.name, original.user?.surname]
                      .filter(Boolean)
                      .join(" ") || original.user?.username || "Kuma User"}
                  </span>
                </div>
              </div>

              {/* Original post description */}
              {original.desc && (
                <p className="px-4 pb-2 text-sm text-gray-700 line-clamp-3">
                  {original.desc}
                </p>
              )}

              {/* Original post first image */}
              {original.images && original.images.length > 0 && (
                <img
                  src={original.images[0].url}
                  alt="Original post"
                  className="w-full max-h-48 object-cover"
                />
              )}

              {/* No content fallback */}
              {!original.desc && (!original.images || original.images.length === 0) && (
                <p className="px-4 pb-3 text-sm text-gray-400 italic">
                  No preview available
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex justify-end flex-shrink-0">
            <Button
              onClick={handleShare}
              disabled={isPending || !user?.id}
              className="bg-[#FF4E02] text-white hover:bg-[#e04300] px-5 py-2 rounded-full text-sm font-medium shadow-md"
            >
              {isPending ? "Sharing…" : "Share to Feed"}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ShareModal;
