"use client";
import { useState, useTransition, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";
import { formatDistanceToNow } from "date-fns";
import { createComment, switchCommentLike, deleteComment } from "@/lib/action";

const CommentBox = ({ user, post, comments, onNewComment, owner }) => {
  const [newComment, setNewComment] = useState("");
  const [commentLikes, setCommentLikes] = useState({});
  const [deleteCommentId, setDeleteCommentId] = useState(null); // Track comment to delete
  const [isPending, startTransition] = useTransition();

  // Sync commentLikes with comments prop
  useEffect(() => {
    setCommentLikes((prev) => {
      const updatedLikes = { ...prev };
      comments.forEach((comment) => {
        if (!updatedLikes[comment.id]) {
          updatedLikes[comment.id] = {
            isLiked: user?.id
              ? comment.likes.some((like) => like.userId === user.id)
              : false,
            likeCount: comment.likes.length || 0,
          };
        }
      });
      return updatedLikes;
    });
  }, [comments, user?.id]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      const result = await createComment(post.id, user.id, newComment);
      if (result.success) {
        setNewComment("");
        onNewComment();
      }
    } catch (error) {
      console.error("Failed to submit comment:", error.message);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user?.id) {
      console.error("Please log in to like comments");
      return;
    }

    startTransition(() => {
      setCommentLikes((prev) => {
        const current = prev[commentId] || { isLiked: false, likeCount: 0 };
        return {
          ...prev,
          [commentId]: {
            isLiked: !current.isLiked,
            likeCount: current.isLiked
              ? current.likeCount - 1
              : current.likeCount + 1,
          },
        };
      });
    });

    try {
      const result = await switchCommentLike(commentId, user.id);
      if (!result.success) {
        throw new Error("Failed to toggle like");
      }
    } catch (error) {
      console.error("Failed to like comment:", error.message);
      setCommentLikes((prev) => {
        const updatedLikes = { ...prev };
        comments.forEach((comment) => {
          updatedLikes[comment.id] = {
            isLiked: user?.id
              ? comment.likes.some((like) => like.userId === user.id)
              : false,
            likeCount: comment.likes.length || 0,
          };
        });
        return updatedLikes;
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user?.id) {
      console.error("Please log in to delete comments");
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteComment(commentId, user.id);
        if (result.success) {
          setDeleteCommentId(null); // Close popup
          onNewComment(); // Refetch comments to update UI
        } else {
          throw new Error("Failed to delete comment");
        }
      } catch (error) {
        console.error("Failed to delete comment:", error.message);
        setDeleteCommentId(null); // Close popup on error
      }
    });
  };

  const openDeletePopUp = (commentId) => {
    setDeleteCommentId(commentId);
  };

  const closeDeletePopUp = () => {
    setDeleteCommentId(null);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <Separator className="h-[0.1rem] bg-[#FF4E01] w-[90%] mx-auto" />
      <div className="w-full flex flex-col max-h-[30rem] scrollbar-hide overflow-y-scroll items-center p-2 cursor-default">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-row gap-3 py-2 hover:bg-slate-200 w-full px-7 rounded-xl md:px-14"
            >
              <img
                src={comment.user?.avatar || "/user-default.png"}
                alt="profile"
                className="w-8 h-8 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
              />
              <div className="flex-1 flex-col items-center justify-center gap-1">
                <div className="flex flex-row flex-1 items-center gap-5 justify-start">
                  <span className="text-black text-sm">
                    {comment.user.name
                      ? `${comment.user.name} ${comment.user.surname || ""}`
                      : comment.user.username || "Kuma User"}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-slate-400 text-xs flex justify-end flex-1">
                    <button
                      className={`bg-inherit shadow-none hover:bg-slate-200  h-8 w-8 flex justify-center items-center rounded-full ${
                        owner === comment.user.id || owner === post.user.id
                          ? "text-slate-500"
                          : "text-black opacity-50 cursor-not-allowed"
                      }`}
                      onClick={
                        owner === comment.user.id || owner === post.user.id
                          ? () => openDeletePopUp(comment.id)
                          : undefined
                      }
                      disabled={
                        isPending ||
                        !user?.id ||
                        (owner !== comment.user.id && owner !== post.user.id)
                      }
                    >
                      <FontAwesomeIcon icon={faXmark} size="md" />
                    </button>
                  </span>
                </div>
                <div className="text-black px-2 pt-2 w-full rounded-xl">
                  <p className="break-all">{comment.desc}</p>
                </div>
                <Button
                  className={`bg-inherit shadow-none py-0 px-5 hover:bg-slate-200 rounded-full ${
                    commentLikes[comment.id]?.isLiked
                      ? "text-blue-600"
                      : "text-black"
                  }`}
                  onClick={() => handleCommentLike(comment.id)}
                  disabled={isPending || !user?.id}
                >
                  <FontAwesomeIcon icon={faThumbsUp} size="xs" />
                  <span className="text-xs ml-1">
                    {commentLikes[comment.id]?.likeCount || 0}
                  </span>
                  <span className="hidden md:block text-xs ml-1">Like</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 p-2">Be the first to comment, Kuma!</p>
        )}
      </div>
      {/* Delete Confirmation Popup */}
      {deleteCommentId && (
        <div className="fixed top-0 left-0 w-full h-full bg-opacity-40 flex items-center justify-center z-30 backdrop-blur-[1px]">
          <div className="bg-white w-[70%] md:w-[60%] lg:w-[35%] xl:w-[25%] h-[20%] md:h-[15%] rounded-lg flex flex-col gap-3 items-center justify-center p-5">
            <p className="text-black">
              Are you sure to delete this comment, Kuma?
            </p>
            <div className="flex gap-5">
              <Button
                className="bg-[#FF4E02] text-white hover:bg-[#e64400]"
                onClick={closeDeletePopUp}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#FF4E02] text-white hover:bg-[#e64400]"
                onClick={() => handleDeleteComment(deleteCommentId)}
                disabled={isPending || !user?.id}
              >
                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Separator
        className="h-[0.05rem] w-[90%] mx-auto bg-[#FF4E01] my-auto"
        orientation="horizontal"
      />
      <form
        action={handleCommentSubmit}
        className="flex w-full gap-3 justify-center items-center mt-4 px-4"
      >
        <img
          src={user?.avatar || "/user-default.png"}
          alt="profile"
          className="w-8 h-8 flex-shrink-0 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01] object-cover"
        />
        <input
          type="text"
          placeholder="Write a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full h-10 p-2 px-4 rounded-full border-2 bg-slate-100 text-black"
          disabled={isPending || !user?.id}
        />
        <Button
          className="flex items-center shadow-md justify-center bg-transparent h-10 cursor-pointer hover:bg-[#FF4E02] hover:text-white rounded-full text-black"
          disabled={isPending || !user?.id || !newComment.trim()}
        >
          {isPending ? "Posting..." : "Comment"}
        </Button>
      </form>
    </div>
  );
};

export default CommentBox;
