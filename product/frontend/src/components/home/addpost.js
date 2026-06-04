"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faImage,
  faVideo,
  faT,
  faXmark,
  faTag,
  faChartBar,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import { useState, useTransition } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { createPost, searchAction } from "@/lib/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ModalPortal from "../ui/modalPortal";
import CameraCapture from "./cameraCapture";

const createOptimisticPost = ({ desc, imageUrls, taggedUsers = [], pollData, user }) => {
  const timestamp = Date.now();
  const tempId = `temp-post-${timestamp}`;
  const validPollOptions = pollData?.options?.filter((o) => o.trim()) ?? [];

  return {
    id: tempId,
    desc: desc.trim(),
    createdAt: new Date().toISOString(),
    isOptimistic: true,
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      avatar: user.avatar,
    },
    images: imageUrls.map((url, index) => ({
      id: `temp-image-${timestamp}-${index}`,
      url,
      postId: tempId,
    })),
    tags: taggedUsers.map((u) => ({ user: u })),
    poll:
      pollData && validPollOptions.length >= 2
        ? {
            id: `temp-poll-${timestamp}`,
            question: pollData.question?.trim() || null,
            isOptimistic: true,
            options: validPollOptions.map((text, i) => ({
              id: `temp-opt-${timestamp}-${i}`,
              text,
              votes: [],
            })),
            votes: [],
          }
        : null,
    likes: [],
    loves: [],
    comments: [],
    _count: { likes: 0, loves: 0, comments: 0 },
  };
};

const Addpost = ({
  user,
  onOptimisticPost,
  onPostConfirmed,
  onPostFailed,
}) => {
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState([]); // Store multiple images
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagQuery, setTagQuery] = useState("");
  const [tagResults, setTagResults] = useState([]);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const router = useRouter();

  const handleConfirmPost = async () => {
    if (!user?.id) {
      setError("Please log in to post");
      setShowPostModal(false);
      return;
    }
    if (!desc.trim() && images.length === 0) {
      setError("Please add text or at least one image to post");
      setShowPostModal(false);
      return;
    }

    const optimisticDesc = desc.trim();
    const imageUrls = images.map((img) => img.secure_url);
    const taggedUserIds = taggedUsers.map((u) => u.id);
    const validOptions = pollOptions.filter((o) => o.trim());
    const pollData =
      showPollBuilder && validOptions.length >= 2
        ? { question: pollQuestion, options: validOptions }
        : null;

    const tempPost = createOptimisticPost({
      desc: optimisticDesc,
      imageUrls,
      taggedUsers,
      pollData,
      user,
    });

    onOptimisticPost?.(tempPost);
    setDesc("");
    setImages([]);
    setTaggedUsers([]);
    setTagQuery("");
    setTagResults([]);
    setShowTagSearch(false);
    setShowPollBuilder(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setError(null);
    setSuccess(null);
    setShowPostModal(false);

    startTransition(async () => {
      try {
        const result = await createPost({
          userId: user.id,
          desc: optimisticDesc,
          imageUrls,
          taggedUserIds,
          pollData,
        });
        if (result.success) {
          onPostConfirmed?.(tempPost.id, result.post);
          router.refresh();
          setSuccess("Post created successfully!");
          toast("Post created successfully!");
          setError(null);
        } else {
          throw new Error(result.error || "Failed to create post");
        }
      } catch (err) {
        onPostFailed?.(tempPost.id);
        setError("Failed to create post. Try again.");
        toast("Failed to create post. Try again.");
        setSuccess(null);
      }
    });
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setImages([]);
    setTaggedUsers([]);
    setTagQuery("");
    setTagResults([]);
    setShowTagSearch(false);
    setShowPollBuilder(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const handleImageUpload = (result) => {
    if (result.info && result.info.secure_url) {
      setImages((prev) => [...prev, result.info]);
      setShowPostModal(true);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (images.length === 1) setShowPostModal(false);
  };

  const handleCameraCapture = (cloudinaryData) => {
    setImages((prev) => [...prev, cloudinaryData]);
    setShowPostModal(true);
  };

  const handleTagSearch = async (value) => {
    setTagQuery(value);
    if (value.trim().length < 2) {
      setTagResults([]);
      return;
    }
    try {
      const results = await searchAction(value.trim());
      setTagResults(
        results.filter(
          (u) => u.id !== user.id && !taggedUsers.some((t) => t.id === u.id)
        )
      );
    } catch {
      setTagResults([]);
    }
  };

  const addTag = (tagUser) => {
    setTaggedUsers((prev) => [...prev, tagUser]);
    setTagQuery("");
    setTagResults([]);
  };

  const removeTag = (userId) => {
    setTaggedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="w-[95%] mx-auto h-fit flex-shrink-0 rounded-2xl flex-col justify-center items-center py-4 px-5 shadow-md text-sm border-[1px] bg-slate-50">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex gap-3">
          <div className="flex items-center justify-center w-12">
            <img
              src={user?.avatar || "/user-default.png"}
              alt="profile"
              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 ring-[#FF4E01] object-cover"
            />
          </div>
          <div className="flex-1 flex-col">
            <textarea
              placeholder="What's on your mind, Kuma?"
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
              name="desc"
              className="resize-none border-2 drop-shadow-md p-3 px-4 w-full h-12 rounded-full border-[#FF4E01] hover:border-[#FF4E01] focus:border-[#FF4E01] overflow-x-hidden whitespace-nowrap line-clamp-1"
              disabled={isPending}
            ></textarea>
          </div>
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              className="items-center w-fit rounded-full bg-[#FF4E01] text-white hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white h-fit cursor-pointer gap-2 text-center justify-center"
              disabled={isPending || (!desc.trim() && images.length === 0)}
              onClick={() => {
                if (desc.trim() && images.length === 0) {
                  handleConfirmPost();
                } else {
                  setShowPostModal(true);
                }
              }}
            >
              {isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>

        <div className="w-full h-10 flex gap-2 items-center justify-start md:justify-center mt-2 overflow-x-auto flex-nowrap scrollbar-hide">
          <Button
            type="button"
            onClick={() => setShowCameraModal(true)}
            className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-fit cursor-pointer gap-2 text-center justify-center"
            disabled={isPending}
          >
            <FontAwesomeIcon icon={faCamera} size="lg" />
            <span>Photo</span>
          </Button>

          <Separator orientation="vertical" className="bg-[#FF4E01]" />

          <CldUploadWidget
            uploadPreset="kumasocialmedia"
            options={{ multiple: true, maxFiles: 10 }}
            onSuccess={handleImageUpload}
            onError={(error) => {
              console.log("Error:", error);
              setError("Upload failed. Check console for details.");
              toast("Upload failed. Check console for details.");
            }}
            onClose={() => console.log("Widget closed")}
          >
            {({ open, isLoading }) => (
              <Button
                type="button"
                onClick={() => open()}
                className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-fit cursor-pointer gap-2 text-center justify-center"
                disabled={isLoading || isPending}
              >
                <FontAwesomeIcon icon={faImage} size="lg" />
                <span>Image</span>
              </Button>
            )}
          </CldUploadWidget>

          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <Button
            onClick={() => setShowPostModal(true)}
            type="button"
            className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-fit cursor-pointer gap-2 text-center justify-center"
            disabled={isPending}
          >
            <FontAwesomeIcon icon={faT} size="lg" />
            <span>Text</span>
          </Button>
          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <CldUploadWidget
            uploadPreset="kumasocialmedia"
            options={{ multiple: true, maxFiles: 10 }}
            onSuccess={handleImageUpload}
            onError={(error) => {
              console.log("Error:", error);
              setError("Upload failed. Check console for details.");
              toast("Upload failed. Check console for details.");
            }}
            onClose={() => console.log("Widget closed")}
          >
            {({ open, isLoading }) => (
              <Button
                type="button"
                onClick={() => open()}
                className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-fit cursor-pointer gap-2 text-center justify-center"
                disabled={isLoading || isPending}
              >
                <FontAwesomeIcon icon={faVideo} size="lg" />
                <span>Video</span>
              </Button>
            )}
          </CldUploadWidget>

          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <Button
            type="button"
            onClick={() => {
              setShowPollBuilder(true);
              setShowPostModal(true);
            }}
            className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-fit cursor-pointer gap-2 text-center justify-center"
            disabled={isPending}
          >
            <FontAwesomeIcon icon={faChartBar} size="lg" />
            <span>Poll</span>
          </Button>
        </div>
      </form>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* Post Confirmation Modal */}
      {showPostModal && (
        <ModalPortal>
          <div
            onClick={handleClosePostModal}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* ── Header ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-base font-semibold text-gray-800">Create Post</h2>
                <button
                  onClick={handleClosePostModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* ── Scrollable body ─────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto">
                {/* User row */}
                <div className="flex items-center gap-3 px-5 pt-4">
                  <img
                    src={user?.avatar || "/user-default.png"}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <p className="text-sm font-semibold text-gray-800">
                    {[user?.name, user?.surname].filter(Boolean).join(" ") || "User"}
                  </p>
                </div>

                {/* Textarea */}
                <textarea
                  placeholder="What's on your mind, Kuma?"
                  onChange={(e) => setDesc(e.target.value)}
                  value={desc}
                  name="desc"
                  rows={4}
                  className="w-full px-5 pt-3 pb-2 resize-none text-gray-800 placeholder-gray-400 text-base focus:outline-none"
                  disabled={isPending}
                  autoFocus
                />

                {/* Tagged user chips */}
                {taggedUsers.length > 0 && (
                  <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                    {taggedUsers.map((u) => (
                      <span
                        key={u.id}
                        className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-[#FF4E01] px-2.5 py-1 rounded-full text-xs font-medium"
                      >
                        <img
                          src={u.avatar || "/user-default.png"}
                          alt={u.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        {u.name}
                        <button
                          type="button"
                          onClick={() => removeTag(u.id)}
                          className="ml-0.5 hover:text-red-500 transition-colors"
                        >
                          <FontAwesomeIcon icon={faXmark} size="xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag search (inline, shown when tag icon is active) */}
                {showTagSearch && (
                  <div className="px-5 pb-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by name or username…"
                        value={tagQuery}
                        onChange={(e) => handleTagSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#FF4E01]"
                        autoFocus
                      />
                      {tagResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-44 overflow-y-auto mt-1">
                          {tagResults.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => addTag(u)}
                              className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-orange-50 w-full text-left"
                            >
                              <img
                                src={u.avatar || "/user-default.png"}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-gray-800 truncate">
                                  {u.name} {u.surname}
                                </span>
                                <span className="text-xs text-gray-400">@{u.username}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Poll builder */}
                {showPollBuilder && (
                  <div className="px-5 pb-3 flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question… (optional)"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#FF4E01]"
                    />
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const next = [...pollOptions];
                            next[i] = e.target.value;
                            setPollOptions(next);
                          }}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#FF4E01]"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPollOptions((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <FontAwesomeIcon icon={faXmark} size="xs" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions((prev) => [...prev, ""])}
                        className="flex items-center gap-1.5 text-[#FF4E01] text-sm w-fit px-3 py-1.5 rounded-xl border border-dashed border-[#FF4E01]/40 hover:bg-orange-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faPlus} size="xs" />
                        <span>Add option</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Image previews */}
                {images.length > 0 && (
                  <div
                    className={`px-5 pb-4 grid gap-2 ${
                      images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                    }`}
                  >
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl overflow-hidden bg-gray-100"
                      >
                        <img
                          src={image.secure_url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-auto object-contain"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          disabled={isPending}
                          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                        >
                          <FontAwesomeIcon icon={faXmark} size="xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Footer ─────────────────────────────────────────────── */}
              <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 mr-1">Add:</span>

                  {/* Add more images */}
                  <CldUploadWidget
                    uploadPreset="kumasocialmedia"
                    options={{ multiple: true, maxFiles: 10 }}
                    onSuccess={handleImageUpload}
                    onError={() => toast("Upload failed.")}
                  >
                    {({ open, isLoading }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        disabled={isLoading || isPending}
                        title="Add image"
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#FF4E01] transition-colors"
                      >
                        <FontAwesomeIcon icon={faImage} />
                      </button>
                    )}
                  </CldUploadWidget>

                  {/* Tag people toggle */}
                  <button
                    type="button"
                    onClick={() => setShowTagSearch((v) => !v)}
                    title="Tag people"
                    className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${
                      showTagSearch || taggedUsers.length > 0
                        ? "text-[#FF4E01]"
                        : "text-gray-500 hover:text-[#FF4E01]"
                    }`}
                  >
                    <FontAwesomeIcon icon={faTag} />
                  </button>

                  {/* Poll toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPollBuilder((v) => !v)}
                    title="Create poll"
                    className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${
                      showPollBuilder
                        ? "text-[#FF4E01]"
                        : "text-gray-500 hover:text-[#FF4E01]"
                    }`}
                  >
                    <FontAwesomeIcon icon={faChartBar} />
                  </button>
                </div>

                <Button
                  onClick={handleConfirmPost}
                  disabled={isPending || (!desc.trim() && images.length === 0)}
                  className="bg-[#FF4E02] text-white hover:bg-[#e04300] px-5 py-2 rounded-full text-sm font-medium shadow-md"
                >
                  {isPending ? "Posting…" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default Addpost;
