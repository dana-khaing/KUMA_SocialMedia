"use client";
import React from "react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faEllipsis,
  faXmark,
  faShare,
  faComment,
  faThumbsUp,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";

export const DanaummyPost = () => {
  const { user } = useUser();
  const imageUrl = user?.imageUrl;
  const [expanded, setExpanded] = useState(false);
  const decription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

  const [liked, setLiked] = useState(false);
  const [loved, setLoved] = useState(false);

  const handleLike = () => {
    if (!loved) {
      setLiked(!liked);
    } else {
      setLiked(!liked);
      setLoved(!loved);
    }
  };
  const handleLove = () => {
    if (!liked) {
      setLoved(!loved);
    } else {
      setLiked(!liked);
      setLoved(!loved);
    }
  };
  return (
    <div>
      {" "}
      <div className="h-fit shrink-0 rounded-2xl shadow-md border-t-[2px] border-b-[2px] w-[100%] border-[#FF4E02] px-7 py-5 text-sm">
        {/* user detail*/}
        {/* avator */}
        <div className="flex gap-3">
          <div className=" flex items-center justify-center w-12">
            <img
              src="/stories1.jpg"
              alt="profile"
              className="w-10 h-10 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
            />
          </div>
          {/* name & time */}
          <div className=" mx-3 flex-1 flex-col items-center justify-center ">
            <div className="text-black font-semibold ">Hein Htet Aung</div>
            <div className="text-slate-400">
              <FontAwesomeIcon icon={faClock} size="sm" />
              <span> 2 hours ago</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 items-center">
            <Button className="bg-inherit text-black shadow-none hover:bg-slate-200 rounded-full">
              <FontAwesomeIcon icon={faEllipsis} size="sm" />
            </Button>
            <Button className="bg-inherit text-black shadow-none hover:bg-slate-200 rounded-full">
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </Button>
          </div>
        </div>

        {/* desc & photo */}
        <div className="p-4">
          {/* if the decrption is over 2 line they gonna hide but iff we press see more we can see whole */}
          <p
            className={`${
              expanded ? "" : "line-clamp-2"
            }  text-justify align-super`}
          >
            {decription}
          </p>
          {decription.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#FF4E02] mb-5 text-left"
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}
          <img
            src="/stories1.jpg"
            alt="post"
            className="w-full h-[20rem] object-cover rounded-xl"
          />
        </div>
        {/* reaction bar */}
        <div>
          <div className="flex justify-between gap-3">
            <div className="flex gap-3 items-center">
              <Button
                className={`bg-inherit shadow-none hover:bg-slate-200 rounded-full ${
                  liked ? "text-blue-600" : "text-black"
                }`}
                onClick={handleLike}
              >
                <FontAwesomeIcon icon={faThumbsUp} size="sm" />
                <span>Like</span>
              </Button>
              <Button
                className={`bg-inherit shadow-none hover:bg-slate-200 rounded-full ${
                  loved ? "text-red-600" : "text-black"
                }`}
                onClick={handleLove}
              >
                <FontAwesomeIcon icon={faHeart} size="sm" />
                <span>Love</span>
              </Button>
              <Button className="bg-inherit shadow-none hover:bg-slate-200 rounded-full text-black">
                <FontAwesomeIcon icon={faComment} size="sm" />
                <span>Comment</span>
              </Button>
            </div>
            <div>
              <Button className="bg-inherit shadow-none hover:bg-slate-200 rounded-full text-black">
                <FontAwesomeIcon icon={faShare} size="sm" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full justify-center items-center mt-4 px-4">
          <img
            src={imageUrl}
            alt="profile"
            className="w-8 h-8 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
          />

          <input
            type="text"
            placeholder="Write a comment"
            className="w-full p-2 px-4 rounded-full bg-slate-100 text-black"
          />
          {/* flex  w-24 l text-[#FF4E01]   */}
          <Button className="flex items-center w-fit shadow-md justify-between bg-transparent  h-fit cursor-pointer hover:bg-[#FF4E02] hover:text-white rounded-full text-black">
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DanaummyPost;
