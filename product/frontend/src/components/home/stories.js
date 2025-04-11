// components/home/stories.jsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const Stories = ({ user, stories }) => {
  const [selectedUserStories, setSelectedUserStories] = useState(null);

  const handleCloseModal = () => {
    setSelectedUserStories(null);
  };

  return (
    <div className="w-[95%] mx-auto h-fit rounded-2xl overflow-x-auto overflow-scroll items-center py-4 px-5 shadow-md text-xs border-[1px] bg-slate-50 scrollbar-hide">
      {/* Stories wrapper */}
      <div className="flex gap-1 md:gap-4 items-center w-max">
        {/* Add story button for the current user */}
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

        {/* Dynamically render story cards for each user */}
        {stories && stories.length > 0 ? (
          stories.map((group) => (
            <div
              key={group.user.id}
              onClick={() => setSelectedUserStories(group)} // Store the entire group object
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
          <div className="bg-white rounded-lg shadow-md flex flex-col gap-4 w-[90%] sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[20%] relative">
            {/* Story Images with Overlay */}
            <div className="flex flex-col gap-4">
              {selectedUserStories.stories.map((story) => (
                <div key={story.id} className="relative flex justify-center">
                  {/* Story Image */}
                  <img
                    src={story.image}
                    alt="Story"
                    className="rounded-lg object-contain"
                  />
                  {/* Overlay Component */}
                  <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
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
                          {formatDistanceToNow(new Date(story.createdAt), {
                            addSuffix: true,
                          })}
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
