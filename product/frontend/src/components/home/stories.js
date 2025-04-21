"use client";

import { useState, useEffect, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
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
import { createStory, deleteStory } from "@/lib/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const router = useRouter();

  const STORY_DURATION = 5000; // 5 seconds per story

  const handleCloseModal = () => {
    setSelectedUserStories(null);
    setCurrent(0);
    setProgress(0);
    setIsHolding(false);
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
      if (updatedIndex === totalSlides - 1) {
        api.plugins().autoplay?.stop();
      }
    };

    api.on("select", handleSelect);
    return () => api.off("select", handleSelect);
  }, [api, selectedUserStories]);

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

  // Cloudinary upload handling
  const handleUploadSuccess = (result) => {
    // console.log("Cloudinary upload result:", result);
    const imageUrl = result?.info?.secure_url;
    if (!imageUrl) {
      toast("Failed to retrieve image URL from Cloudinary.");
      console.error("Image URL not found in result:", result);
      return;
    }
    setUploadedImageUrl(imageUrl);
    setShowCreateModal(true);
  };

  const handleCreateStory = () => {
    if (!uploadedImageUrl) {
      toast("No image URL available to create story.");
      console.warn("handleCreateStory called but uploadedImageUrl is null");
      return;
    }

    startTransition(async () => {
      try {
        const payload = { userId: user.id, imageUrl: uploadedImageUrl };
        console.log("Creating story with payload:", payload);
        const newStory = await createStory(payload);
        console.log("createStory response:", newStory);

        if (newStory?.success) {
          router.refresh();
          // will show the new story in the carousel
          // setSelectedUserStories({
          //   user: newStory.story.user,
          //   stories: [newStory.story],
          // });
          toast("Story created successfully!");
          setShowCreateModal(false);
        } else {
          throw new Error(newStory?.error || "Story creation failed");
        }
      } catch (error) {
        toast(`Failed to create story: ${error.message}`);
        console.error("Error creating story:", error);
      } finally {
        setUploadedImageUrl(null);
      }
    });
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setUploadedImageUrl(null);
  };

  // Handle story deletion
  const handleDeleteStory = (storyId) => {
    startTransition(async () => {
      try {
        const result = await deleteStory(storyId, user.id);
        if (result.success) {
          router.refresh();
          toast("Story deleted successfully!");
          // Update the stories list by filtering out the deleted story
          const updatedStories = selectedUserStories.stories.filter(
            (story) => story.id !== storyId
          );
          if (updatedStories.length === 0) {
            // If no stories remain, close the modal
            handleCloseModal();
          } else {
            // Update the stories and reset the carousel
            setSelectedUserStories({
              ...selectedUserStories,
              stories: updatedStories,
            });
            // Adjust the current index if necessary
            if (current >= updatedStories.length) {
              setCurrent(updatedStories.length - 1);
            }
            // Refresh the page to sync with the server
          }
        }
      } catch (error) {
        toast(`Failed to delete story: ${error.message}`);
        console.error("Error deleting story:", error);
      }
    });
  };

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
        <div
          onClick={handleCloseCreateModal}
          className="fixed w-screen h-screen bg-black bg-opacity-50 top-0 left-0 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg shadow-md w-[90%] sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[20%] p-4 relative"
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
      )}

      {/* Story Viewing Modal */}
      {selectedUserStories && (
        <div
          onClick={handleCloseModal}
          className="fixed w-screen h-screen bg-black bg-opacity-50 top-0 left-0 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg shadow-md w-[90%] sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[20%]"
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
                    <div className="relative flex items-center justify-center h-full w-full">
                      <img
                        src={story.image}
                        alt="Story"
                        className="rounded-lg object-contain max-h-[80vh] max-w-full"
                        onMouseDown={handleHoldStart}
                        onMouseUp={handleHoldEnd}
                        onTouchStart={handleHoldStart}
                        onTouchEnd={handleHoldEnd}
                      />
                      <div className="absolute top-4 left-4 right-4 flex flex-col gap-2">
                        <div className="flex gap-1">
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
                              className="flex-1 h-1 bg-gray-300 [&>*]:bg-white"
                            />
                          ))}
                        </div>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center gap-4">
                            <Link
                              href={`/profile/${selectedUserStories.user.id}`}
                            >
                              <img
                                src={
                                  selectedUserStories.user?.avatar ||
                                  "/user-default.png"
                                }
                                alt="profile"
                                className="w-10 h-10 rounded-full ring-1 hover:ring-2 ring-[#FF4E01]"
                              />
                            </Link>
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-semibold">
                                {selectedUserStories.user.name}
                              </span>
                              <span className="text-white text-xs">
                                {formatDistanceToNow(
                                  new Date(story.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          <div
                            className="absolute top-0 right-0 w-8 h-8 hover:bg-gray-200 hover:text-black text-white rounded-full flex items-center justify-center cursor-pointer"
                            onClick={handleCloseModal}
                          >
                            <FontAwesomeIcon icon={faXmark} size="md" />
                          </div>
                        </div>
                      </div>
                      {/* Delete Button for User-Owned Stories */}
                      {story.userId === user.id && (
                        <div className="absolute bottom-4 right-4">
                          <Button
                            onClick={() => handleDeleteStory(story.id)}
                            className="bg-transparent text-white  px-4 py-2 rounded-lg shadow-md"
                            disabled={isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
