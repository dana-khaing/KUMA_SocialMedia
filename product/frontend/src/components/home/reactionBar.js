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

  ///Like action
  const [liked, setLiked] = useState({
    isLiked: user?.id
      ? post.likes.some((like) => like.userId === user.id)
      : false,
    likeCount: post._count?.likes || 0,
  });

  const [optimisticLike, updateOptimisticLike] = useOptimistic(
    liked,
    (state) => ({
      ...state,
      isLiked: !state.isLiked,
      likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
    })
  );

  const [isPending, startTransition] = useTransition();

  const likeAction = async () => {
    startTransition(() => {
      updateOptimisticLike();
    });

    try {
      await switchLike(post.id, user.id);
      setLiked((prev) => ({
        isLiked: !prev.isLiked,
        likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      }));
    } catch (error) {
      console.error("Failed to update like:", error);
      setLiked(liked);
    }
  };

  const [loved, setLoved] = useState(
    user?.id ? post.loves.some((love) => love.userId === user.id) : false
  );

  return (
    <>
      <div className="flex w-full gap-0 md:gap-3 items-around justify-center pb-2">
        <Button
          className={`bg-inherit shadow-none w-fit hover:bg-slate-200 rounded-full ${
            optimisticLike.isLiked ? "text-blue-600" : "text-black"
          }`}
          onClick={likeAction}
          disabled={isPending || !user?.id}
        >
          <FontAwesomeIcon icon={faThumbsUp} size="sm" />
          <span>{optimisticLike.likeCount}</span>
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
