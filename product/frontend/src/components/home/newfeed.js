"use client";
// import { useUser } from "@clerk/nextjs"; // useUser() hook to get user data not use server side (Current user)
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { formatDistanceToNow } from "date-fns";
import CommentBox from "./commentBox";

import {
  faClock,
  faEllipsis,
  faXmark,
  faShare,
  faComment,
  faThumbsUp,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";

const Newfeed = ({ user, posts = [] }) => {
  const [showCommentbox, setShowCommentbox] = useState({});
  // Toggle only the clicked post's comment box
  const toggleCommentBox = (postId) => {
    setShowCommentbox((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [expanded, setExpanded] = useState(false); // for expanding post description
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
                <div className="mx-3 flex-1 flex-col items-center justify-center">
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
              <div className="flex w-full gap-0 md:gap-3 items-around justify-center pb-2">
                <Button
                  className={`bg-inherit shadow-none w-fit hover:bg-slate-200 rounded-full ${
                    liked ? "text-blue-600" : "text-black"
                  }`}
                  onClick={handleLike}
                >
                  <FontAwesomeIcon icon={faThumbsUp} size="sm" />
                  <span>{post._count?.likes || 0}</span>
                  <span className="hidden md:block">Like</span>
                </Button>
                <Separator
                  className="h-3 bg-slate-400 my-auto"
                  orientation="vertical"
                />
                <Button
                  className={`bg-inherit shadow-none w-fit hover:bg-slate-200 rounded-full ${
                    loved ? "text-red-600" : "text-black"
                  }`}
                  onClick={handleLove}
                >
                  <FontAwesomeIcon icon={faHeart} size="sm" />
                  <span>{post._count?.loves || 0}</span>
                  <span className="hidden md:block">Love</span>
                </Button>
                <Separator
                  className="h-3 bg-slate-400 my-auto"
                  orientation="vertical"
                />
                <Button
                  onClick={() => toggleCommentBox(post.id)}
                  className={`bg-inherit w-fit shadow-none hover:bg-transparent rounded-full ${
                    showCommentbox[post.id] ? "text-blue-600" : "text-black"
                  }`}
                >
                  <FontAwesomeIcon icon={faComment} size="sm" />
                  <span>{post._count?.comments || 0}</span>
                  <span className="hidden md:block">Comment</span>
                </Button>
                <Separator
                  className="h-3 bg-slate-400 my-auto"
                  orientation="vertical"
                />
                <Button className="bg-inherit w-fit shadow-none hover:bg-slate-200 rounded-full text-black">
                  <FontAwesomeIcon icon={faShare} size="sm" />
                  <span className="hidden md:block">Share</span>
                </Button>
              </div>

              {showCommentbox[post.id] && <CommentBox user={user} />}
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
