"use client";
import React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DummyPost from "./dummyPost.js";
import {
  faClock,
  faEllipsis,
  faXmark,
  faShare,
  faComment,
  faThumbsUp,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/button";
const Newfeed = () => {
  const [liked, setLiked] = useState(false);
  const [loved, setLoved] = useState(false);
  const [commented, setCommented] = useState(false);

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
    <div className="w-[100%] overflow-scroll scrollbar-hide">
      {/* postcard container */}
      <div className=" flex flex-col justify-center items-center gap-5">
        {/* postCard */}
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
          <div className="p-4 ">
            <p className="text-black flex mt-3 mb-5">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              laborum, voluptates, quod, autem quae quos quas voluptatem
              accusamus
            </p>
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
        </div>
        <DummyPost />
        <DummyPost />
        <DummyPost />
        <DummyPost />
        <DummyPost />
        <DummyPost />
      </div>
    </div>
  );
};

export default Newfeed;
