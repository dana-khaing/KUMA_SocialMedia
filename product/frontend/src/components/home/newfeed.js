"use client";
import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactionBar from "./reactionBar";
import { faClock, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button.jsx";
import { deletePost } from "@/lib/action";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";

const Newfeed = ({ user, posts = [], owner }) => {
  const [expanded, setExpanded] = useState(false); // For expanding post description
  const [deletePostId, setDeletePostId] = useState(null); // Track post ID for deletion popup
  const [postList, setPostList] = useState(posts);
  const [isPending, startTransition] = useTransition();

  // Open delete confirmation popup for a specific post
  const openDeletePopUp = (postId) => {
    setDeletePostId(postId);
  };

  // Close delete confirmation popup
  const closeDeletePopUp = () => {
    setDeletePostId(null);
  };

  // Function to delete a post
  const handleDeletePost = async (postId) => {
    if (!user?.id) {
      console.error("Please log in to delete posts");
      return;
    }

    const parsedPostId = Number(postId); // Ensure integer
    if (isNaN(parsedPostId)) {
      console.error("Invalid post ID:", postId);
      return;
    }

    // Optimistically remove the post from the UI
    startTransition(() => {
      setPostList((prev) => prev.filter((post) => post.id !== parsedPostId));
    });

    try {
      const result = await deletePost(parsedPostId, user.id);
      if (result.success) {
        toast("Post deleted successfully!");
        closeDeletePopUp(); // Close popup on success
      } else {
        throw new Error(result.message || "Delete action failed");
      }
    } catch (error) {
      toast("Failed to delete post. Try again.");
      console.error("Failed to delete post:", error.message);
      setPostList(posts); // Revert on failure
      closeDeletePopUp(); // Close popup even on failure
    }
  };

  // Helper function to format the post timestamp
  const formatPostTimestamp = (createdAt) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const daysDifference = differenceInDays(now, postDate);

    if (daysDifference > 7) {
      // If more than 7 days, show "day month year" (e.g., "15 October 2024")
      return format(postDate, "d MMMM yyyy");
    } else {
      // Otherwise, show relative time (e.g., "2 days ago")
      return formatDistanceToNow(postDate, { addSuffix: true });
    }
  };
  return (
    <div className="w-full h-[180vh]">
      <div className="flex flex-col justify-center items-center gap-5">
        {postList.length > 0 ? (
          postList.map((post) => (
            <div
              key={post.id}
              className="h-fit rounded-2xl shadow-md border-t-[2px] border-b-[2px] w-[95%] mx-auto px-5 border-[#FF4E02] md:px-7 py-4 md:py-5 text-sm"
            >
              <div className="flex gap-3">
                <Link
                  href={`/profile/${post.user.id}`}
                  className="flex items-center justify-center w-12"
                >
                  <img
                    src={post.user?.avatar || "/user-default.png"}
                    alt="profile"
                    className="w-10 h-10 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
                  />
                </Link>
                <div className="flex-1 flex-col items-center justify-center">
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="text-black font-semibold"
                  >
                    {post.user.name + " " + post.user.surname ||
                      post.user.username ||
                      "Kuma User"}
                  </Link>
                  <div className="text-slate-400">
                    <FontAwesomeIcon icon={faClock} size="sm" />
                    <span>{" " + formatPostTimestamp(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 items-center">
                  <button
                    className={`bg-inherit flex justify-center items-center w-10 h-10 shadow-none hover:bg-slate-200 rounded-full ${
                      owner === post.user.id
                        ? "text-black"
                        : "text-black opacity-50 cursor-not-allowed"
                    }`}
                    onClick={
                      owner === post.user.id
                        ? () => openDeletePopUp(post.id)
                        : undefined
                    }
                    disabled={isPending || !user?.id || owner !== post.user.id}
                  >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                  </button>
                </div>
              </div>

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
                {post.image && (
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full h-full object-contain rounded-xl"
                  />
                )}
              </div>
              <ReactionBar post={post} user={user} owner={owner} />

              {/* Delete Confirmation Popup */}
              {deletePostId === post.id && (
                <div className="fixed top-0 left-0 w-full h-full bg-opacity-40 flex items-center justify-center z-30 backdrop-blur-[1px]">
                  <div className="bg-white w-[70%] md:w-[60%] lg:w-[35%] xl:w-[25%] h-[20%] md:h-[15%] rounded-lg flex flex-col gap-3 items-center justify-center p-5">
                    <p className="text-black">
                      Are you sure to delete this post, Kuma?
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
                        onClick={() => handleDeletePost(post.id)}
                        disabled={isPending || !user?.id}
                      >
                        {isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
