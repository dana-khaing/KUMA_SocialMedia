"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faEye } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CldUploadWidget } from "next-cloudinary";
import { createStory, deleteStory, recordStoryView, getStoryViewers } from "@/lib/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ModalPortal from "../ui/modalPortal";

const STORY_DURATION = 5000;

const Stories = ({ user, stories }) => {
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const pointerDownAt = useRef(null);
  const router = useRouter();

  const storyCount = selectedUserStories?.stories.length ?? 0;
  const currentStory = selectedUserStories?.stories[storyIndex] ?? null;
  const isOwner = selectedUserStories?.user.id === user.id;

  // ── close ──────────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setSelectedUserStories(null);
    setStoryIndex(0);
    setProgress(0);
    setIsHolding(false);
    setShowViewers(false);
    setViewers([]);
  };

  // ── navigation ─────────────────────────────────────────────────────────
  const goNext = () => {
    if (storyIndex < storyCount - 1) {
      setStoryIndex((p) => p + 1);
      setProgress(0);
      setShowViewers(false);
    } else {
      handleCloseModal();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((p) => p - 1);
      setProgress(0);
      setShowViewers(false);
    }
  };

  // ── record view ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentStory || currentStory.userId === user.id) return;
    recordStoryView(currentStory.id, user.id);
  }, [currentStory?.id]);

  // ── progress bar (pauses while viewers panel is open) ─────────────────
  useEffect(() => {
    if (!selectedUserStories || isHolding || showViewers) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 100 / (STORY_DURATION / 100)));
    }, 100);
    return () => clearInterval(interval);
  }, [selectedUserStories, isHolding, storyIndex, showViewers]);

  // ── auto-advance (blocked while viewers panel is open) ────────────────
  useEffect(() => {
    if (!selectedUserStories || progress < 100 || isHolding || showViewers) return;
    const t = setTimeout(goNext, 200);
    return () => clearTimeout(t);
  }, [progress, showViewers]);

  // ── tap-zone pointer handlers ──────────────────────────────────────────
  const onZoneDown = (e) => {
    e.stopPropagation();
    pointerDownAt.current = Date.now();
    setIsHolding(true);
  };

  const onZoneUp = (e, dir) => {
    e.stopPropagation();
    // if viewers panel is open, any tap just closes it
    if (showViewers) {
      setShowViewers(false);
      setIsHolding(false);
      return;
    }
    setIsHolding(false);
    const held = Date.now() - (pointerDownAt.current ?? Date.now());
    if (held < 200) {
      if (dir === "prev") goPrev();
      else if (dir === "next") goNext();
    }
  };

  // ── viewers ────────────────────────────────────────────────────────────
  const handleShowViewers = async () => {
    if (!currentStory) return;
    setLoadingViewers(true);
    setShowViewers(true);
    try {
      const result = await getStoryViewers(currentStory.id);
      if (result.success) setViewers(result.viewers);
    } catch {
      setViewers([]);
    } finally {
      setLoadingViewers(false);
    }
  };

  // ── story creation ─────────────────────────────────────────────────────
  const handleUploadSuccess = (result) => {
    const imageUrl = result?.info?.secure_url;
    if (!imageUrl) { toast("Failed to retrieve image URL."); return; }
    setUploadedImageUrl(imageUrl);
    setShowCreateModal(true);
  };

  const handleCreateStory = () => {
    if (!uploadedImageUrl) return;
    startTransition(async () => {
      try {
        const newStory = await createStory({ userId: user.id, imageUrl: uploadedImageUrl });
        if (newStory?.success) {
          router.refresh();
          toast("Story created!");
          setShowCreateModal(false);
        } else {
          throw new Error(newStory?.error || "Story creation failed");
        }
      } catch (err) {
        toast(`Failed: ${err.message}`);
      } finally {
        setUploadedImageUrl(null);
      }
    });
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setUploadedImageUrl(null);
  };

  // ── delete ─────────────────────────────────────────────────────────────
  const handleDeleteStory = (storyId) => {
    startTransition(async () => {
      try {
        const result = await deleteStory(storyId, user.id);
        if (result.success) {
          router.refresh();
          toast("Story deleted!");
          const updated = selectedUserStories.stories.filter((s) => s.id !== storyId);
          if (updated.length === 0) {
            handleCloseModal();
          } else {
            setSelectedUserStories({ ...selectedUserStories, stories: updated });
            if (storyIndex >= updated.length) setStoryIndex(updated.length - 1);
          }
        }
      } catch (err) {
        toast(`Failed: ${err.message}`);
      }
    });
  };

  // ── open story group ───────────────────────────────────────────────────
  const openGroup = (group) => {
    setSelectedUserStories(group);
    setStoryIndex(0);
    setProgress(0);
    setShowViewers(false);
    setViewers([]);
  };

  // ──────────────────────────────────────────────────────────────────────
  return (
    <div className="w-[95%] mx-auto h-fit rounded-2xl overflow-x-auto py-4 px-5 shadow-md text-xs border-[1px] bg-slate-50 scrollbar-hide">

      {/* ── thumbnail strip ─────────────────────────────────────────────── */}
      <div className="flex gap-1 md:gap-4 items-center w-max">
        {/* create button */}
        <div className="flex flex-col items-center gap-1 cursor-pointer w-[5rem]">
          <CldUploadWidget
            uploadPreset="kumasocialmedia"
            onSuccess={handleUploadSuccess}
            onError={(e) => { toast("Upload failed."); console.error(e); }}
          >
            {({ open, isLoading }) => (
              <Button
                onClick={() => open()}
                className="w-[4rem] h-[4rem] rounded-full bg-white text-black hover:bg-slate-300"
                disabled={isLoading || isPending}
              >
                <FontAwesomeIcon icon={faPlus} size="lg" className="text-[#FF4E02]" />
              </Button>
            )}
          </CldUploadWidget>
          <span className="text-black">{isPending ? "Uploading..." : "Create Stories"}</span>
        </div>

        {/* thumbnails */}
        {stories.map((group) => (
          <div
            key={group.user.id}
            onClick={() => openGroup(group)}
            className="flex flex-col items-center gap-1 cursor-pointer w-[5rem]"
          >
            <div className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01]">
              <img
                src={group.stories[0].image}
                alt="Story preview"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-black truncate w-full text-center">
              {group.user.id === user.id ? "Your stories" : group.user.name}
            </span>
          </div>
        ))}
      </div>

      {/* ── create-story confirmation modal ─────────────────────────────── */}
      {showCreateModal && (
        <ModalPortal>
          <div
            onClick={handleCloseCreateModal}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-[90%] rounded-lg p-4 shadow-md sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[20%]"
            >
              <div className="relative flex flex-col items-center gap-4">
                <h3 className="absolute top-4 text-lg text-white">Story Preview</h3>
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded story preview"
                  className="rounded-lg object-contain max-h-[60vh] max-w-full"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  <Button
                    onClick={handleCloseCreateModal}
                    className="bg-gray-300 text-black hover:bg-gray-400 px-4 py-2 rounded-lg shadow-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStory}
                    className="bg-[#FF4E02] text-white hover:bg-[#e04300] px-4 py-2 rounded-lg shadow-md"
                    disabled={isPending}
                  >
                    {isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Facebook-style story viewer ──────────────────────────────────── */}
      {selectedUserStories && currentStory && (
        <ModalPortal>
          {/* Full-screen black backdrop */}
          <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">

            {/* Story card: full-screen on mobile, portrait column on desktop */}
            <div className="relative w-full h-full sm:w-[420px] overflow-hidden">

              {/* Blurred background fill (prevents black bars on non-portrait images) */}
              <img
                key={`bg-${currentStory.id}`}
                src={currentStory.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50 select-none"
                draggable={false}
              />

              {/* Main story image */}
              <img
                key={`img-${currentStory.id}`}
                src={currentStory.image}
                alt="Story"
                className="absolute inset-0 w-full h-full object-contain select-none"
                draggable={false}
              />

              {/* ── tap zones ── z-10, below all overlays */}
              <div className="absolute inset-0 flex z-10">
                <div
                  className="w-1/3 h-full cursor-pointer"
                  onPointerDown={onZoneDown}
                  onPointerUp={(e) => onZoneUp(e, "prev")}
                />
                <div
                  className="flex-1 h-full"
                  onPointerDown={onZoneDown}
                  onPointerUp={(e) => onZoneUp(e, null)}
                />
                <div
                  className="w-1/3 h-full cursor-pointer"
                  onPointerDown={onZoneDown}
                  onPointerUp={(e) => onZoneUp(e, "next")}
                />
              </div>

              {/* ── top overlay: progress + user info ── z-20 */}
              <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-4 pb-10 bg-gradient-to-b from-black/75 to-transparent pointer-events-none">
                {/* Progress bars */}
                <div className="flex gap-1 mb-3">
                  {selectedUserStories.stories.map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-[2px] bg-white/35 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-white rounded-full"
                        style={{
                          width: `${
                            idx < storyIndex ? 100 : idx === storyIndex ? progress : 0
                          }%`,
                          transition: idx === storyIndex ? "width 100ms linear" : "none",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* User row */}
                <div
                  className="flex items-center justify-between pointer-events-auto"
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${selectedUserStories.user.id}`}>
                      <img
                        src={selectedUserStories.user?.avatar || "/user-default.png"}
                        alt="profile"
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FF4E01]"
                      />
                    </Link>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-semibold leading-tight">
                        {selectedUserStories.user.name}
                      </span>
                      <span className="text-white/65 text-xs">
                        {formatDistanceToNow(new Date(currentStory.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                  </button>
                </div>
              </div>

              {/* ── bottom overlay: viewers + delete ── z-20 */}
              <div
                className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-14 bg-gradient-to-t from-black/75 to-transparent"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  {isOwner ? (
                    <button
                      onClick={handleShowViewers}
                      className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-sm font-medium"
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Viewers</span>
                    </button>
                  ) : (
                    <div />
                  )}
                  {currentStory.userId === user.id && (
                    <Button
                      onClick={() => handleDeleteStory(currentStory.id)}
                      disabled={isPending}
                      className="h-auto px-4 py-1.5 text-sm rounded-full bg-transparent border border-white/40 text-white hover:bg-white/10 shadow-none"
                    >
                      {isPending ? "Deleting…" : "Delete"}
                    </Button>
                  )}
                </div>
              </div>

              {/* ── viewers panel (slides up from bottom) ── z-30 */}
              {showViewers && isOwner && (
                <div
                  className="absolute inset-x-0 bottom-0 z-30 bg-zinc-900/95 backdrop-blur-md rounded-t-3xl px-5 pt-4 pb-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* drag pill */}
                  <div className="w-10 h-1 bg-white/25 rounded-full mx-auto mb-4" />

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold text-base">
                      {loadingViewers
                        ? "Loading…"
                        : `${viewers.length} viewer${viewers.length !== 1 ? "s" : ""}`}
                    </span>
                    <button
                      onClick={() => setShowViewers(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={faXmark} size="sm" />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto flex flex-col gap-3">
                    {loadingViewers ? (
                      <p className="text-white/50 text-sm text-center py-6">Loading…</p>
                    ) : viewers.length === 0 ? (
                      <p className="text-white/50 text-sm text-center py-6">No viewers yet</p>
                    ) : (
                      viewers.map((viewer) => (
                        <div key={viewer.id} className="flex items-center gap-3">
                          <img
                            src={viewer.avatar || "/user-default.png"}
                            alt={viewer.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-white text-sm font-medium">{viewer.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default Stories;
