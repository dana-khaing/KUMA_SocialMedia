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
import { useState, useTransition } from "react";
import CommentBox from "./commentBox";
import { useOptimistic } from "react";
import { switchReaction, loadComments } from "@/lib/action";

const ReactionBar = ({ post, user, owner }) => {
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
          setCommentCount(fetchedComments.length); // Sync count with fetched comments
          setError(null);
        } catch (error) {
          console.error("Failed to load comments:", error.message);
          setError("Failed to load comments. Kuma");
        }
      });
    }
  };

  const handleNewComment = async (postId) => {
    // Optimistically increment comment count
    setCommentCount((prev) => prev + 1);

    try {
      const updatedComments = await loadComments(postId);
      setComments((prev) => ({
        ...prev,
        [postId]: updatedComments,
      }));
      setCommentCount(updatedComments.length); // Sync with server
    } catch (error) {
      console.error("Failed to refresh comments:", error.message);
      setCommentCount((prev) => prev - 1); // Revert on failure
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

  // Optimistic updates for both reactions
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
        setLiked((prev) => ({
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        }));
        if (loved.isLoved) {
          setLoved((prev) => ({
            ...prev,
            isLoved: false,
            loveCount: prev.loveCount - 1,
          }));
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
        setLoved((prev) => ({
          isLoved: !prev.isLoved,
          loveCount: prev.isLoved ? prev.loveCount - 1 : prev.loveCount + 1,
        }));
        if (liked.isLiked) {
          setLiked((prev) => ({
            ...prev,
            isLiked: false,
            likeCount: prev.likeCount - 1,
          }));
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
      <div className="flex w-full gap-5 md:gap-1 items-around justify-center pb-2">
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
          <span>{commentCount}</span> {/* Use dynamic count */}
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
