"use client";
import {
  faComment,
  faHeart,
  faShare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useState } from "react";
import CommentBox from "./commentBox";
import { useOptimistic, useTransition } from "react";
import { switchLike } from "@/lib/action";

const ReactionBar = ({ post, user }) => {
  /// show comment box
  const [showCommentbox, setShowCommentbox] = useState({});
  const toggleCommentBox = (postId) => {
    setShowCommentbox((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  /// like action
  const [like, setLike] = useState(false);
  const [loved, setLoved] = useState(false);
  return (
    <>
      <div className="flex w-full gap-0 md:gap-3 items-around justify-center pb-2">
        <Button
          className={`bg-inherit shadow-none w-fit hover:bg-slate-200 rounded-full ${
            like ? "text-blue-600" : "text-black"
          }`}
          //   onClick={likeAction}
        >
          <FontAwesomeIcon icon={faThumbsUp} size="sm" />
          <span>{post._count.like}</span>
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
          // onClick={handleLove}
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
    </>
  );
};

export default ReactionBar;
