"use client";
// import { useUser } from "@clerk/nextjs"; // useUser() hook to get user data not use server side (Current user)
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { formatDistanceToNow } from "date-fns";

import ReactionBar from "./reactionBar";

import { faClock, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button.jsx";

const Newfeed = ({ user, posts = [] }) => {
  const [expanded, setExpanded] = useState(false); // for expanding post description

  return (
    <div className="w-full">
      {/* postcard container */}
      <div className=" flex flex-col justify-center items-center gap-5">
        {/* postCard */}
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="h-fit rounded-2xl shadow-md border-t-[2px] border-b-[2px] w-[100%] border-[#FF4E02] md:px-7 py-3 md:py-5 text-sm"
            >
              {/* user detail*/}
              {/* avatar */}
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-12">
                  <img
                    src={post.user?.avatar || "/user-default.png"}
                    alt="profile"
                    className="w-10 h-10 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
                  />
                </div>
                {/* name & time */}
                <div className=" flex-1 flex-col items-center justify-center">
                  <div className="text-black font-semibold">
                    {post.user.name + " " + post.user.surname ||
                      post.user.username ||
                      "Kuma User"}
                  </div>
                  <div className="text-slate-400">
                    <FontAwesomeIcon icon={faClock} size="sm" />
                    <span>
                      {" "}
                      {formatDistanceToNow(post.createdAt, {
                        addSuffix: true,
                      })}{" "}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 items-center">
                  {/* <Button className="bg-inherit text-black shadow-none hover:bg-slate-200 rounded-full">
                    <FontAwesomeIcon icon={faEllipsis} size="sm" />
                  </Button> */}
                  <Button className="bg-inherit text-black shadow-none hover:bg-slate-200 rounded-full">
                    <FontAwesomeIcon icon={faXmark} size="sm" />
                  </Button>
                </div>
              </div>

              {/* desc & photo */}
              <div className="p-2">
                <p
                  className={`p-2 ${
                    expanded ? "" : "line-clamp-2"
                  } text-justify align-super`}
                >
                  {post.desc}
                </p>
                {post.desc?.length > 100 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[#FF4E02] mb-5 text-left"
                  >
                    {expanded ? "See less" : "See more"}
                  </button>
                )}
                <img
                  src={post.image}
                  alt="post"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              {/* reaction bar */}
              <ReactionBar post={post} user={user} />
            </div>
          ))
        ) : (
          <p className="text-[#FF4E01] font-bold p-20 h-20">
            No posts to show, KUMA!!
          </p>
        )}
      </div>
    </div>
  );
};

export default Newfeed;
