"use client";

import { useState, useTransition, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button.jsx";
import ReactionBar from "./reactionBar";
import { deletePost } from "@/lib/action";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";
import PostPopup from "./postPopup";
import { useRouter } from "next/navigation";
import { subscribeToPostEvents } from "@/lib/pusherClient";
import ModalPortal from "../ui/modalPortal";

function normalizePost(post) {
  return {
    ...post,
    likes: Array.isArray(post?.likes) ? post.likes : [],
    loves: Array.isArray(post?.loves) ? post.loves : [],
    comments: Array.isArray(post?.comments) ? post.comments : [],
    images: Array.isArray(post?.images) ? post.images : [],
    _count: {
      likes: post?._count?.likes ?? 0,
      loves: post?._count?.loves ?? 0,
      comments: post?._count?.comments ?? 0,
      ...post?._count,
    },
  };
}

function applyReactionEvent(post, event) {
  if (post.id !== event.postId) {
    return post;
  }

  const likes = Array.isArray(post.likes) ? post.likes : [];
  const loves = Array.isArray(post.loves) ? post.loves : [];
  const withoutUserLike = likes.filter((like) => like.userId !== event.userId);
  const withoutUserLove = loves.filter((love) => love.userId !== event.userId);

  return {
    ...post,
    likes:
      event.reactionType === "like" && event.action === "added"
        ? [...withoutUserLike, { userId: event.userId }]
        : withoutUserLike,
    loves:
      event.reactionType === "love" && event.action === "added"
        ? [...withoutUserLove, { userId: event.userId }]
        : withoutUserLove,
    _count: {
      ...post._count,
      likes: event.counts?.likes ?? post._count?.likes ?? 0,
      loves: event.counts?.loves ?? post._count?.loves ?? 0,
    },
  };
}

function applyCommentEvent(post, event) {
  if (post.id !== event.postId || !event.comment) {
    return post;
  }

  const comments = Array.isArray(post.comments) ? post.comments : [];
  const nextComments = comments.some((comment) => comment.id === event.comment.id)
    ? comments
    : [...comments, event.comment];

  return {
    ...post,
    comments: nextComments,
    _count: {
      ...post._count,
      comments: event.commentCount ?? nextComments.length,
    },
  };
}

function PostImagePreview({ images, onOpen }) {
  const visibleImages = images.slice(0, 4);
  const hasMoreImages = images.length > visibleImages.length;
  const singleImage = images.length === 1;

  return (
    <div
      className={`grid gap-3 ${
        singleImage ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {visibleImages.map((image, index) => (
        <button
          key={image.id || index}
          type="button"
          onClick={onOpen}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100"
        >
          <img
            src={image.url}
            alt={`post-${index}`}
            className={`w-full object-contain ${
              singleImage ? "max-h-[36rem]" : "max-h-[24rem]"
            }`}
          />
          {hasMoreImages && index === visibleImages.length - 1 && (
            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-xl font-semibold text-white">
              +{images.length - visibleImages.length}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

const Newfeed = ({ user, posts = [], owner, autoOpenCommentId }) => {
  const [expanded, setExpanded] = useState({});
  const [deletePostId, setDeletePostId] = useState(null);
  const [postList, setPostList] = useState(posts);
  const [isPending, startTransition] = useTransition();
  const [selectedPost, setSelectedPost] = useState(null);
  const [openCommentBoxes, setOpenCommentBoxes] = useState({});
  const router = useRouter();

  useEffect(() => {
    setPostList((posts || []).map(normalizePost));
  }, [posts]);

  useEffect(() => {
    return subscribeToPostEvents({
      onReactionUpdated: (event) => {
        setPostList((currentPosts) =>
          currentPosts.map((post) => normalizePost(applyReactionEvent(post, event)))
        );
        setSelectedPost((currentPost) =>
          currentPost
            ? normalizePost(applyReactionEvent(currentPost, event))
            : currentPost
        );
      },
      onCommentCreated: (event) => {
        setPostList((currentPosts) =>
          currentPosts.map((post) => normalizePost(applyCommentEvent(post, event)))
        );
        setSelectedPost((currentPost) =>
          currentPost
            ? normalizePost(applyCommentEvent(currentPost, event))
            : currentPost
        );
      },
    });
  }, []);

  useEffect(() => {
    if (autoOpenCommentId != null) {
      setOpenCommentBoxes({ [autoOpenCommentId]: true });
    }
  }, [autoOpenCommentId]);

  useEffect(() => {
    postList
      .filter((post) => !post.isOptimistic)
      .slice(0, 10)
      .forEach((post) => {
        router.prefetch(`/post/${post.id}`);
      });
  }, [postList, router]);

  const prefetchPost = (post) => {
    if (!post.isOptimistic) {
      router.prefetch(`/post/${post.id}`);
    }
  };

  const openDeletePopUp = (postId) => {
    setDeletePostId(postId);
  };

  const closeDeletePopUp = () => {
    setDeletePostId(null);
  };

  const handleDeletePost = async (postId) => {
    if (!user?.id) {
      toast("Please log in to delete posts.");
      return;
    }

    const parsedPostId = Number(postId);
    if (isNaN(parsedPostId)) {
      toast("Invalid post ID.");
      return;
    }

    startTransition(() => {
      setPostList((prev) => prev.filter((post) => post.id !== parsedPostId));
    });

    try {
      const result = await deletePost(parsedPostId, user.id);
      if (result.success) {
        toast("Post deleted successfully!");
        closeDeletePopUp();
      } else {
        throw new Error(result.message || "Delete action failed");
      }
    } catch (error) {
      toast("Failed to delete post. Try again.");
      setPostList(posts);
      closeDeletePopUp();
    }
  };

  const formatPostTimestamp = (createdAt) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const daysDifference = differenceInDays(now, postDate);

    if (daysDifference > 7) {
      return format(postDate, "d MMMM yyyy");
    } else {
      return formatDistanceToNow(postDate, { addSuffix: true });
    }
  };

  const toggleExpand = (postId) => {
    setExpanded((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const openPostPopup = (post) => {
    setSelectedPost(post);
  };

  const closePostPopup = () => {
    setSelectedPost(null);
  };

  const handleCommentBoxToggle = (postId, isOpen) => {
    setOpenCommentBoxes((prev) => ({
      ...prev,
      [postId]: isOpen,
    }));
  };

  const handleReactionUpdate = (updatedPost) => {
    const normalizedUpdatedPost = normalizePost(updatedPost);

    setPostList((prev) =>
      prev.map((post) =>
        post.id === normalizedUpdatedPost.id
          ? {
              ...post,
              likes: normalizedUpdatedPost.likes,
              loves: normalizedUpdatedPost.loves,
              comments: normalizedUpdatedPost.comments,
              _count: {
                ...post._count,
                likes: normalizedUpdatedPost._count.likes,
                loves: normalizedUpdatedPost._count.loves,
                comments: normalizedUpdatedPost._count.comments,
              },
            }
          : post
      )
    );
    setSelectedPost((currentPost) =>
      currentPost?.id === normalizedUpdatedPost.id
        ? normalizePost({ ...currentPost, ...normalizedUpdatedPost })
        : currentPost
    );
  };

  return (
    <div className="w-full h-fit">
      <div className="flex flex-col justify-center items-center gap-5">
        {postList.length > 0 ? (
          postList.map((rawPost) => {
            const post = normalizePost(rawPost);

            return (
            <div
              key={`${post.id}-${post._count.likes}-${post._count.loves}-${post._count.comments}`}
              onMouseEnter={() => prefetchPost(post)}
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
                    className="h-10 w-10 cursor-pointer rounded-full object-cover ring-1 ring-[#FF4E01] hover:ring-2"
                  />
                </Link>
                <div className="flex-1 flex-col items-center justify-center">
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="text-black font-semibold"
                  >
                    {post.user.name && post.user.surname
                      ? `${post.user.name} ${post.user.surname}`
                      : post.user.username || "Kuma User"}
                  </Link>
                  <div className="text-slate-400">
                    <FontAwesomeIcon icon={faClock} size="sm" />
                    <span>{" " + formatPostTimestamp(post.createdAt)}</span>
                    {post.isOptimistic && (
                      <span className="ml-2 text-[#FF4E02] font-medium">
                        Posting...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 items-center">
                  <button
                    className={`bg-inherit flex justify-center items-center w-10 h-10 shadow-none hover:bg-slate-200 rounded-full ${
                      owner === post.user.id && !post.isOptimistic
                        ? "text-black"
                        : "text-black opacity-50 cursor-not-allowed"
                    }`}
                    onClick={
                      owner === post.user.id && !post.isOptimistic
                        ? () => openDeletePopUp(post.id)
                        : undefined
                    }
                    disabled={
                      isPending ||
                      !user?.id ||
                      owner !== post.user.id ||
                      post.isOptimistic
                    }
                  >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                  </button>
                </div>
              </div>

              <div className="p-2">
                <p
                  className={`p-2 ${
                    expanded[post.id] ? "" : "line-clamp-2"
                  } text-justify align-super`}
                >
                  {post.desc}
                </p>
                {post.desc?.length > 100 && (
                  <button
                    onClick={() => toggleExpand(post.id)}
                    className="text-[#FF4E02] mb-5 text-left"
                  >
                    {expanded[post.id] ? "See less" : "See more"}
                  </button>
                )}
                {post.images && post.images.length > 0 && (
                  <PostImagePreview
                    images={post.images}
                    onOpen={() => openPostPopup(post)}
                  />
                )}
              </div>
              {post.isOptimistic ? (
                <div className="px-2 py-3 text-xs text-slate-500">
                  Reactions and comments will be available after the post is
                  saved.
                </div>
              ) : (
                <ReactionBar
                  post={post}
                  user={user}
                  owner={owner}
                  onReactionUpdate={handleReactionUpdate}
                  isCommentOpen={openCommentBoxes[post.id] || false}
                  onCommentBoxToggle={(isOpen) =>
                    handleCommentBoxToggle(post.id, isOpen)
                  }
                />
              )}

              {deletePostId === post.id && (
                <ModalPortal>
                <div
                  onClick={closeDeletePopUp}
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex min-h-36 w-[90%] flex-col items-center justify-center gap-3 rounded-lg border-b-[2px] border-t-[2px] border-[#FF4E02] bg-white p-5 md:w-[60%] lg:w-[35%] xl:w-[25%]"
                  >
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
                </ModalPortal>
              )}
            </div>
          );
          })
        ) : (
          <p className="text-[#FF4E01] font-bold p-20 h-20">
            No posts to show, KUMA!!
          </p>
        )}
      </div>

      {selectedPost && (
        <PostPopup
          post={selectedPost}
          user={user}
          owner={owner}
          onClose={closePostPopup}
          onReactionUpdate={handleReactionUpdate}
        />
      )}
    </div>
  );
};

export default Newfeed;
