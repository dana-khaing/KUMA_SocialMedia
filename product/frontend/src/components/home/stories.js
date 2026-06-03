"use client";

import { useState, useEffect, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faEye } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import Autoplay from "embla-carousel-autoplay";
import { CldUploadWidget } from "next-cloudinary";
import { createStory, deleteStory, recordStoryView, getStoryViewers } from "@/lib/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ModalPortal from "../ui/modalPortal";

const Stories = ({ user, stories }) => {
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const router = useRouter();

  const STORY_DURATION = 5000;

  const handleCloseModal = () => {
    setSelectedUserStories(null);
    setCurrent(0);
    setProgress(0);
    setIsHolding(false);
    setShowViewers(false);
    setViewers([]);
    api?.plugins().autoplay?.stop();
  };

  // Sync carousel state
  useEffect(() => {
    if (!api || !selectedUserStories) return;

    const totalSlides = selectedUserStories.stories.length;
    setCount(totalSlides);
    const newIndex = api.selectedScrollSnap();
    setCurrent(newIndex);

    if (newIndex === totalSlides - 1) {
      api.plugins().autoplay?.stop();
    }

    const handleSelect = () => {
      const updatedIndex = api.selectedScrollSnap();
      setCurrent(updatedIndex);
      setProgress(0);
      setShowViewers(false);
      if (updatedIndex === totalSlides - 1) {
        api.plugins().autoplay?.stop();
      }
    };

    api.on("select", handleSelect);
    return () => api.off("select", handleSelect);
  }, [api, selectedUserStories]);

  // Record view when story slide becomes active (skip if viewer is the owner)
  useEffect(() => {
    if (!selectedUserStories) return;
    const story = selectedUserStories.stories[current];
    if (!story || story.userId === user.id) return;
    recordStoryView(story.id, user.id);
  }, [current, selectedUserStories]);

  // Progress bar updates
  useEffect(() => {
    if (!selectedUserStories || isHolding) return;

    const interval = setInterval(() => {
      setProgress((prev) =>
        prev >= 100 ? 100 : prev + 100 / (STORY_DURATION / 100)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [selectedUserStories, isHolding]);

  // Advance or close on progress completion
  useEffect(() => {
    if (!selectedUserStories || progress < 100 || isHolding) return;

    const timer = setTimeout(() => {
      if (current === count - 1) {
        api?.plugins().autoplay?.stop();
        handleCloseModal();
      } else {
        api?.scrollNext();
        setProgress(0);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [progress, current, count, selectedUserStories, api, isHolding]);

  const handleHoldStart = () => {
    setIsHolding(true);
    api?.plugins().autoplay?.stop();
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    if (current < count - 1) {
      api?.plugins().autoplay?.play();
    }
  };

  const handleShowViewers = async () => {
    const story = selectedUserStories?.stories[current];
    if (!story) return;
    setLoadingViewers(true);
    setShowViewers(true);
    try {
      const result = await getStoryViewers(story.id);
      if (result.success) setViewers(result.viewers);
    } catch {
      setViewers([]);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleUploadSuccess = (result) => {
    const imageUrl = result?.info?.secure_url;
    if (!imageUrl) {
      toast("Failed to retrieve image URL from Cloudinary.");
      return;
    }
    setUploadedImageUrl(imageUrl);
    setShowCreateModal(true);
  };

  const handleCreateStory = () => {
    if (!uploadedImageUrl) {
      toast("No image URL available to create story.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = { userId: user.id, imageUrl: uploadedImageUrl };
        const newStory = await createStory(payload);

        if (newStory?.success) {
          router.refresh();
          toast("Story created successfully!");
          setShowCreateModal(false);
        } else {
          throw new Error(newStory?.error || "Story creation failed");
        }
      } catch (error) {
        toast(`Failed to create story: ${error.message}`);
      } finally {
        setUploadedImageUrl(null);
      }
    });
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setUploadedImageUrl(null);
  };

  const handleDeleteStory = (storyId) => {
    startTransition(async () => {
      try {
        const result = await deleteStory(storyId, user.id);
        if (result.success) {
          router.refresh();
          toast("Story deleted successfully!");
          const updatedStories = selectedUserStories.stories.filter(
            (story) => story.id !== storyId
          );
          if (updatedStories.length === 0) {
            handleCloseModal();
          } else {
            setSelectedUserStories({
              ...selectedUserStories,
              stories: updatedStories,
            });
            if (current >= updatedStories.length) {
              setCurrent(updatedStories.length - 1);
            }
          }
        }
      } catch (error) {
        toast(`Failed to delete story: ${error.message}`);
      }
    });
  };

  const isOwner = selectedUserStories?.user.id === user.id;

  return (
    <div className="w-[95%] mx-auto h-fit rounded-2xl overflow-x-auto py-4 px-5 shadow-md text-xs border-[1px] bg-slate-50 scrollbar-hide">
      {/* Stories List */}
      <div className="flex gap-1 md:gap-4 items-center w-max">
        <div className="flex flex-col items-center gap-1 cursor-pointer w-[5rem]">
          <CldUploadWidget
            uploadPreset="kumasocialmedia"
            onSuccess={handleUploadSuccess}
            onError={(error) => {
              toast("Upload failed. Check console for details.");
              console.error("Cloudinary upload error:", error);
            }}
          >
            {({ open, isLoading }) => (
              <Button
                onClick={() => open()}
                className="w-[4rem] h-[4rem] rounded-full bg-white text-black hover:bg-slate-300"
                disabled={isLoading || isPending}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  size="lg"
                  className="text-[#FF4E02]"
                />
              </Button>
            )}
          </CldUploadWidget>
          <span className="text-black">
            {isPending ? "Uploading..." : "Create Stories"}
          </span>
        </div>

        {stories.map((group) => (
          <div
            key={group.user.id}
            onClick={() => setSelectedUserStories(group)}
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

      {/* Create Story Modal */}
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
                <h3 className="absolute top-4 text-lg text-white">
                  Story Preview
                </h3>
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

      {/* Story Viewing Modal */}
      {selectedUserStories && (
        <ModalPortal>
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative rounded-xl shadow-xl overflow-hidden w-[96vw] sm:w-[400px]"
            >
              <Carousel
                opts={{ loop: false }}
                setApi={setApi}
                plugins={[
                  Autoplay({ delay: STORY_DURATION, stopOnInteraction: false }),
                ]}
              >
                <CarouselContent>
                  {selectedUserStories.stories.map((story) => (
                    <CarouselItem key={story.id}>
                      {/* Fixed-height portrait container */}
                      <div
                        className="relative w-full bg-black rounded-xl"
                        style={{ height: "min(85vh, 750px)" }}
                      >
                        <img
                          src={story.image}
                          alt="Story"
                          className="w-full h-full object-contain select-none"
                          onMouseDown={handleHoldStart}
                          onMouseUp={handleHoldEnd}
                          onTouchStart={handleHoldStart}
                          onTouchEnd={handleHoldEnd}
                          draggable={false}
                        />

                        {/* Top: progress bars + header */}
                        <div className="absolute top-0 left-0 right-0 px-3 pt-3 pb-2 bg-gradient-to-b from-black/70 to-transparent">
                          <div className="flex gap-1 mb-2">
                            {selectedUserStories.stories.map((_, idx) => (
                              <Progress
                                key={idx}
                                value={
                                  idx < current
                                    ? 100
                                    : idx === current
                                    ? progress
                                    : 0
                                }
                                className="flex-1 h-[3px] bg-white/30 [&>*]:bg-white"
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/profile/${selectedUserStories.user.id}`}
                              >
                                <img
                                  src={
                                    selectedUserStories.user?.avatar ||
                                    "/user-default.png"
                                  }
                                  alt="profile"
                                  className="h-9 w-9 rounded-full object-cover ring-2 ring-[#FF4E01]"
                                />
                              </Link>
                              <div className="flex flex-col">
                                <span className="text-white text-sm font-semibold leading-tight">
                                  {selectedUserStories.user.name}
                                </span>
                                <span className="text-white/70 text-xs">
                                  {formatDistanceToNow(
                                    new Date(story.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                            </div>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition"
                              onClick={handleCloseModal}
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                          </div>
                        </div>

                        {/* Bottom: viewers icon + delete */}
                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="flex items-center justify-between">
                            {isOwner ? (
                              <button
                                onClick={handleShowViewers}
                                className="flex items-center gap-1.5 text-white/80 hover:text-white transition text-sm"
                              >
                                <FontAwesomeIcon icon={faEye} />
                                <span>Viewers</span>
                              </button>
                            ) : (
                              <div />
                            )}
                            {story.userId === user.id && (
                              <Button
                                onClick={() => handleDeleteStory(story.id)}
                                className="bg-transparent text-white hover:bg-white/10 px-3 py-1.5 text-sm rounded-lg shadow-none"
                                disabled={isPending}
                              >
                                {isPending ? "Deleting..." : "Delete"}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Viewers panel (owner only) */}
                        {showViewers && isOwner && (
                          <div
                            className="absolute inset-x-0 bottom-0 bg-black/85 backdrop-blur-sm rounded-t-2xl px-4 pt-3 pb-6 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white text-sm font-semibold">
                                {loadingViewers
                                  ? "Loading..."
                                  : `${viewers.length} viewer${viewers.length !== 1 ? "s" : ""}`}
                              </span>
                              <button
                                onClick={() => setShowViewers(false)}
                                className="text-white/60 hover:text-white"
                              >
                                <FontAwesomeIcon icon={faXmark} size="sm" />
                              </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto flex flex-col gap-2.5">
                              {loadingViewers ? (
                                <p className="text-white/50 text-xs text-center py-4">
                                  Loading viewers...
                                </p>
                              ) : viewers.length === 0 ? (
                                <p className="text-white/50 text-xs text-center py-4">
                                  No viewers yet
                                </p>
                              ) : (
                                viewers.map((viewer) => (
                                  <div
                                    key={viewer.id}
                                    className="flex items-center gap-3"
                                  >
                                    <img
                                      src={viewer.avatar || "/user-default.png"}
                                      alt={viewer.name}
                                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                    <span className="text-white text-sm">
                                      {viewer.name}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default Stories;
