"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faImage,
  faVideo,
  faT,
  faXmark,
  faTag,
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

const createOptimisticPost = ({ desc, imageUrls, taggedUsers = [], user }) => {
  const timestamp = Date.now();
  const tempId = `temp-post-${timestamp}`;

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
    likes: [],
    loves: [],
    comments: [],
    _count: {
      likes: 0,
      loves: 0,
      comments: 0,
    },
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
    const tempPost = createOptimisticPost({
      desc: optimisticDesc,
      imageUrls,
      taggedUsers,
      user,
    });

    onOptimisticPost?.(tempPost);
    setDesc("");
    setImages([]);
    setTaggedUsers([]);
    setTagQuery("");
    setTagResults([]);
    setShowTagSearch(false);
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-[90%] overflow-y-auto rounded-lg bg-white p-4 shadow-md sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[25%]"
          >
            <div className="flex flex-col gap-4">
              {/* User Info and Description */}
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || "/user-default.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-gray-800 text-md font-semibold">
                    {user?.name + " " + user?.surname || "User"}
                  </span>
                </div>
              </div>
              <div className="flex-1 flex-col">
                <textarea
                  placeholder="What's on your mind, Kuma?"
                  onChange={(e) => setDesc(e.target.value)}
                  value={desc}
                  name="desc"
                  className="w-full h-20 p-3 px-4 resize-none scrollbar-hide rounded-lg border-2 border-[#FF4E01] hover:border-[#FF4E01] focus:border-[#FF4E01]"
                  disabled={isPending}
                ></textarea>
              </div>
              {/* Tag People */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagSearch((v) => !v)}
                  className="flex items-center gap-2 text-[#FF4E01] text-sm w-fit"
                >
                  <FontAwesomeIcon icon={faTag} size="sm" />
                  <span>{taggedUsers.length > 0 ? "Edit tags" : "Tag people"}</span>
                </button>

                {showTagSearch && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or username…"
                      value={tagQuery}
                      onChange={(e) => handleTagSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF4E01]"
                      autoFocus
                    />
                    {tagResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                        {tagResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => addTag(u)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 w-full text-left"
                          >
                            <img
                              src={u.avatar || "/user-default.png"}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                            <span className="text-sm font-medium">{u.name} {u.surname}</span>
                            <span className="text-xs text-gray-400 ml-auto">@{u.username}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {taggedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.secure_url}
                        alt={`Preview ${index + 1}`}
                        className="rounded-lg object-cover w-full h-32"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        disabled={isPending}
                      >
                        <FontAwesomeIcon icon={faXmark} size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Post Button */}
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleConfirmPost}
                  className="bg-[#FF4E02] text-white hover:bg-[#e04300] px-4 py-2 rounded-lg shadow-md"
                  disabled={isPending}
                >
                  {isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
            <div
              className="absolute top-2 right-2 w-8 h-8 hover:bg-gray-200 hover:text-black text-gray-600 rounded-full flex items-center justify-center cursor-pointer"
              onClick={handleClosePostModal}
            >
              <FontAwesomeIcon icon={faXmark} size="md" />
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default Addpost;
