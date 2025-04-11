"use client";

import { useState, useEffect, useRef } from "react";
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

const Stories = ({ user, stories }) => {
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const STORY_DURATION = 5000; // 5 seconds in milliseconds
  const autoplayRef = useRef(null); // Store Autoplay instance

  const handleCloseModal = () => {
    setSelectedUserStories(null);
    setCurrent(0);
    setProgress(0);
    setIsHolding(false);
    api?.plugins().autoplay?.stop();
  };

  // Update current slide and count
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    const newIndex = api.selectedScrollSnap() + 1;
    setCurrent(newIndex);

    // Stop autoplay if on the last slide
    if (newIndex === api.scrollSnapList().length) {
      api.plugins().autoplay?.stop();
    }

    const handleSelect = () => {
      const updatedIndex = api.selectedScrollSnap() + 1;
      setCurrent(updatedIndex);
      setProgress(0); // Reset progress on slide change

      // Stop autoplay on last slide
      if (updatedIndex === api.scrollSnapList().length) {
        api.plugins().autoplay?.stop();
      }
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  // Handle progress bar updates
  useEffect(() => {
    if (!selectedUserStories || isHolding) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return prev; // Stop incrementing; handle advancement in separate effect
        }
        return prev + 100 / (STORY_DURATION / 100); // Increment progress
      });
    }, 100);

    return () => clearInterval(interval);
  }, [selectedUserStories, isHolding]);

  // Handle slide advancement and modal closing
  useEffect(() => {
    if (!selectedUserStories || progress < 100 || isHolding) return;

    const timer = setTimeout(() => {
      if (current === count) {
        handleCloseModal(); // Close modal on last story
      } else {
        api?.scrollNext(); // Advance to next slide
        setProgress(0); // Reset progress after advancing
      }
    }, 0); // Defer to avoid render-time update

    return () => clearTimeout(timer);
  }, [progress, current, count, selectedUserStories, api, isHolding]);

  // Handle hold events
  const handleHoldStart = () => {
    setIsHolding(true);
    api?.plugins().autoplay?.stop();
  };

  const handleHoldEnd = () => {
    if (isHolding) {
      setIsHolding(false);
      if (current !== count) {
        api?.plugins().autoplay?.play(); // Resume only if not on last slide
      }
    }
  };

  // Sort stories by createdAt (oldest first)
  const sortedStories = selectedUserStories
    ? [...selectedUserStories.stories].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    : [];

  return (
    <div className="w-[95%] mx-auto h-fit rounded-2xl overflow-x-auto overflow-scroll items-center py-4 px-5 shadow-md text-xs border-[1px] bg-slate-50 scrollbar-hide">
      {/* Stories wrapper */}
      <div className="flex gap-1 md:gap-4 items-center w-max">
        {/* Add story button */}
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <div className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] flex items-center justify-center">
            <Button className="w-[4rem] h-[4rem] rounded-full bg-white text-black hover:bg-slate-300">
              <FontAwesomeIcon
                icon={faPlus}
                size="lg"
                className="text-[#FF4E02]"
              />
            </Button>
          </div>
          <span className="text-black">Your Stories</span>
        </div>

        {/* Story cards */}
        {stories && stories.length > 0 ? (
          stories.map((group) => (
            <div
              key={group.user.id}
              onClick={() => setSelectedUserStories(group)}
              className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]"
            >
              <div className="relative w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1">
                <img
                  src={group.stories[0].image}
                  alt="Story preview"
                  className="w-[4.5rem] h-[4.5rem] rounded-full object-cover"
                />
              </div>
              <span className="text-black truncate w-full text-center">
                {group.user.username}
              </span>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No stories available</div>
        )}
      </div>

      {/* Popup Modal for Story Viewing */}
      {selectedUserStories && (
        <div className="fixed w-screen h-screen bg-black top-0 bg-opacity-50 left-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="rounded-lg shadow-md flex flex-col gap-4 w-[90%] sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[20%] relative">
            {/* Carousel for Stories */}
            <Carousel
              className="w-full"
              opts={{ loop: false }}
              setApi={setApi}
              plugins={[
                Autoplay({
                  delay: STORY_DURATION,
                  stopOnInteraction: false,
                  ref: autoplayRef,
                }),
              ]}
            >
              <CarouselContent>
                {sortedStories.map((story, index) => (
                  <CarouselItem key={story.id}>
                    <div className="relative flex justify-center">
                      <img
                        src={story.image}
                        alt="Story"
                        className="rounded-lg object-contain w-full h-auto"
                        onMouseDown={handleHoldStart}
                        onMouseUp={handleHoldEnd}
                        onMouseLeave={handleHoldEnd}
                        onTouchStart={handleHoldStart}
                        onTouchEnd={handleHoldEnd}
                      />
                      {/* Overlay Component (Top) */}
                      <div className="absolute top-4 left-4 right-4 flex flex-col gap-2">
                        {/* Progress Bars for Each Story */}
                        <div className="flex gap-1">
                          {sortedStories.map((_, progressIndex) => (
                            <div key={progressIndex} className="flex-1">
                              <Progress
                                value={
                                  progressIndex + 1 < current
                                    ? 100 // Completed
                                    : progressIndex + 1 === current
                                    ? progress // Current story progress
                                    : 0 // Not yet viewed
                                }
                                className="h-1 bg-gray-300 [&>*]:bg-white"
                              />
                            </div>
                          ))}
                        </div>
                        {/* User Info and Close Button */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Link
                              href={`/profile/${selectedUserStories.user.id}`}
                              className="flex items-center justify-center w-12"
                            >
                              <img
                                src={
                                  selectedUserStories.user?.avatar ||
                                  "/user-default.png"
                                }
                                alt="profile"
                                className="w-10 h-10 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
                              />
                            </Link>
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-semibold drop-shadow-md">
                                {selectedUserStories.user.name +
                                  " " +
                                  selectedUserStories.user.surname ||
                                  selectedUserStories.user.username}
                              </span>
                              <span className="text-white text-xs drop-shadow-md">
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
                            className="w-8 h-8 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                            onClick={handleCloseModal}
                          >
                            <FontAwesomeIcon icon={faXmark} size="md" />
                          </div>
                        </div>
                      </div>
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
