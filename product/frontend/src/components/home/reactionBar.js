"use client";

import { useState, useTransition } from "react";
import {
  faComment,
  faHeart,
  faShare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useOptimistic } from "react";
import CommentBox from "./commentBox";
import { switchReaction, loadComments } from "@/lib/action";

const ReactionBar = ({ post, user, owner, onReactionUpdate }) => {
  const [showCommentbox, setShowCommentbox] = useState({});
  const [comments, setComments] = useState({});
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const toggleCommentBox = async (postId) => {
    const isOpen = !showCommentbox[postId];
    setShowCommentbox((prev) => ({
      ...prev,
      [postId]: isOpen,
    }));

    if (isOpen && !comments[postId]) {
      startTransition(async () => {
        try {
          const fetchedComments = await loadComments(postId);
          setComments((prev) => ({
            ...prev,
            [postId]: fetchedComments,
          }));
          setCommentCount(fetchedComments.length);
          setError(null);
          if (onReactionUpdate) {
            onReactionUpdate({
              ...post,
              comments: fetchedComments,
              _count: { ...post._count, comments: fetchedComments.length },
            });
          }
        } catch (error) {
          console.error("Failed to load comments:", error.message);
          setError("Failed to load comments. Kuma");
        }
      });
    }
  };

  const handleNewComment = async (postId) => {
    setCommentCount((prev) => prev + 1);

    try {
      const updatedComments = await loadComments(postId);
      setComments((prev) => ({
        ...prev,
        [postId]: updatedComments,
      }));
      setCommentCount(updatedComments.length);
      if (onReactionUpdate) {
        onReactionUpdate({
          ...post,
          comments: updatedComments,
          _count: { ...post._count, comments: updatedComments.length },
        });
      }
    } catch (error) {
      console.error("Failed to refresh comments:", error.message);
      setCommentCount((prev) => prev - 1);
    }
  };

  // Like state
  const [liked, setLiked] = useState({
    isLiked: user?.id
      ? post.likes.some((like) => like.userId === user.id)
      : false,
    likeCount: post._count?.likes || 0,
  });

  // Love state
  const [loved, setLoved] = useState({
    isLoved: user?.id
      ? post.loves.some((love) => love.userId === user.id)
      : false,
    loveCount: post._count?.loves || 0,
  });

  // Optimistic updates for reactions
  const [optimisticReactions, updateOptimisticReactions] = useOptimistic(
    { liked, loved },
    (state, { reactionType }) => {
      if (reactionType === "like") {
        return {
          liked: {
            isLiked: !state.liked.isLiked,
            likeCount: state.liked.isLiked
              ? state.liked.likeCount - 1
              : state.liked.likeCount + 1,
          },
          loved: state.liked.isLiked
            ? state.loved
            : { isLoved: false, loveCount: state.loved.loveCount },
        };
      } else {
        return {
          liked: state.loved.isLoved
            ? state.liked
            : { isLiked: false, likeCount: state.liked.likeCount },
          loved: {
            isLoved: !state.loved.isLoved,
            loveCount: state.loved.isLoved
              ? state.loved.loveCount - 1
              : state.loved.loveCount + 1,
          },
        };
      }
    }
  );

  const likeAction = async () => {
    if (!user?.id) {
      console.error("Please log in to react");
      return;
    }

    startTransition(() => {
      updateOptimisticReactions({ reactionType: "like" });
    });

    try {
      const result = await switchReaction(post.id, user.id, "like");
      if (result.success) {
        const newLikeState = {
          isLiked: !liked.isLiked,
          likeCount: liked.isLiked ? liked.likeCount - 1 : liked.likeCount + 1,
        };
        setLiked(newLikeState);
        const newLoveState = loved.isLoved
          ? { isLoved: false, loveCount: loved.loveCount - 1 }
          : loved;
        setLoved(newLoveState);
        if (onReactionUpdate) {
          onReactionUpdate({
            ...post,
            likes: newLikeState.isLiked
              ? [...post.likes, { userId: user.id, createdAt: new Date() }]
              : post.likes.filter((like) => like.userId !== user.id),
            loves: newLoveState.isLoved
              ? post.loves
              : post.loves.filter((love) => love.userId !== user.id),
            _count: {
              ...post._count,
              likes: newLikeState.likeCount,
              loves: newLoveState.loveCount,
            },
            comments: post.comments,
          });
        }
      }
    } catch (error) {
      console.error("Failed to update like:", error.message);
      setLiked(liked);
      setLoved(loved);
    }
  };

  const loveAction = async () => {
    if (!user?.id) {
      console.error("Please log in to react");
      return;
    }

    startTransition(() => {
      updateOptimisticReactions({ reactionType: "love" });
    });

    try {
      const result = await switchReaction(post.id, user.id, "love");
      if (result.success) {
        const newLoveState = {
          isLoved: !loved.isLoved,
          loveCount: loved.isLoved ? loved.loveCount - 1 : loved.loveCount + 1,
        };
        setLoved(newLoveState);
        const newLikeState = liked.isLiked
          ? { isLiked: false, likeCount: liked.likeCount - 1 }
          : liked;
        setLiked(newLikeState);
        if (onReactionUpdate) {
          onReactionUpdate({
            ...post,
            loves: newLoveState.isLoved
              ? [...post.loves, { userId: user.id, createdAt: new Date() }]
              : post.loves.filter((love) => love.userId !== user.id),
            likes: newLikeState.isLiked
              ? post.likes
              : post.likes.filter((like) => like.userId !== user.id),
            _count: {
              ...post._count,
              likes: newLikeState.likeCount,
              loves: newLoveState.loveCount,
            },
            comments: post.comments,
          });
        }
      }
    } catch (error) {
      console.error("Failed to update love:", error.message);
      setLiked(liked);
      setLoved(loved);
    }
  };

  return (
    <>
      <div className="flex w-full gap-3 md:gap-1 items-around justify-center pb-2">
        <Button
          className={`bg-inherit shadow-none w-fit hover:bg-slate-200 rounded-full ${
            optimisticReactions.liked.isLiked ? "text-blue-600" : "text-black"
          }`}
          onClick={likeAction}
          disabled={isPending || !user?.id}
        >
          <FontAwesomeIcon icon={faThumbsUp} size="sm" />
          <span>{optimisticReactions.liked.likeCount}</span>
          <span className="hidden md:block">Like</span>
        </Button>
        <Separator
          className="h-3 bg-slate-400 my-auto"
          orientation="vertical"
        />
        <Button
          className={`bg-inherit shadow-none w-fit hover:bg-slate-200 rounded-full ${
            optimisticReactions.loved.isLoved ? "text-red-600" : "text-black"
          }`}
          onClick={loveAction}
          disabled={isPending || !user?.id}
        >
          <FontAwesomeIcon icon={faHeart} size="sm" />
          <span>{optimisticReactions.loved.loveCount}</span>
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
          disabled={isPending}
        >
          <FontAwesomeIcon icon={faComment} size="sm" />
          <span>{commentCount}</span>
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
      {showCommentbox[post.id] && (
        <>
          {error && <p className="text-red-500 p-2">{error}</p>}
          <CommentBox
            user={user}
            post={post}
            owner={owner}
            comments={comments[post.id] || []}
            onNewComment={() => handleNewComment(post.id)}
          />
        </>
      )}
    </>
  );
};

export default ReactionBar;
