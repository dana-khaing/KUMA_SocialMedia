"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faImage,
  faVideo,
  faT,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import { useState, useTransition } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { createPost } from "@/lib/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Addpost = ({ user }) => {
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState([]); // Store multiple images
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

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

    startTransition(async () => {
      try {
        const imageUrls = images.map((img) => img.secure_url);
        const result = await createPost({
          userId: user.id,
          desc,
          imageUrls,
        });
        if (result.success) {
          router.refresh();
          setDesc("");
          setImages([]);
          setSuccess("Post created successfully!");
          toast("Post created successfully!");
          setError(null);
          setShowPostModal(false);
        } else {
          throw new Error(result.error || "Failed to create post");
        }
      } catch (err) {
        setError("Failed to create post. Try again.");
        toast("Failed to create post. Try again.");
        setSuccess(null);
        setShowPostModal(false);
      }
    });
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setImages([]); // Clear images on close
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
          <CldUploadWidget
            uploadPreset="kumasocialmedia"
            options={{ multiple: true, maxFiles: 10 }} // Allow multiple uploads
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
                <FontAwesomeIcon icon={faCamera} size="lg" />
                <span>Photo</span>
              </Button>
            )}
          </CldUploadWidget>

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

      {/* Post Confirmation Modal */}
      {showPostModal && (
        <div className="fixed w-screen h-screen bg-black bg-opacity-50 top-0 left-0 flex items-center justify-center z-50">
          <div className="rounded-lg shadow-md w-[90%] sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[25%] p-4 relative bg-white">
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
      )}
    </div>
  );
};

export default Addpost;
