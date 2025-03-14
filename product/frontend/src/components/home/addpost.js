"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faImage,
  faVideo,
  faSquarePollVertical,
  faCalendar,
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
  const [image, setImage] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // soft refresh page by router refresh
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError("Please log in to post");
      return;
    }
    if (!desc.trim() && !image) {
      setError("Please add text or an image to post");
      return;
    }

    startTransition(async () => {
      try {
        const imageUrl = image?.secure_url;
        const result = await createPost({
          userId: user.id,
          desc,
          imageUrl: imageUrl,
        });
        if (result.success) {
          router.refresh();
          setDesc("");
          setImage(null);
          setSuccess("Post created successfully!");
          toast("Post created successfully!");
          setError(null);
        }
      } catch (err) {
        setError("Failed to create post. Try again.");
        toast("Failed to create post. Try again.");
        setSuccess(null);
      }
    });
  };

  return (
    <div className="w-[95%] mx-auto h-fit flex-shrink-0 rounded-2xl flex-col justify-center items-center py-4 px-5 shadow-md text-sm border-[1px] bg-slate-50">
      <form onSubmit={handleSubmit}>
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
              className="border-2 drop-shadow-md p-3 px-4 w-full h-12 rounded-full border-[#FF4E01] hover:border-[#FF4E01] focus:border-[#FF4E01] overflow-x-hidden whitespace-nowrap line-clamp-1"
              disabled={isPending}
            ></textarea>
          </div>
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              className="items-center w-fit rounded-full bg-[#FF4E01] text-white hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white h-fit cursor-pointer gap-2 text-center justify-center"
              disabled={isPending || (!desc.trim() && !image)}
            >
              {isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>

        <div className="w-full h-10 flex gap-2 items-center justify-start md:justify-center mt-2 overflow-x-auto flex-nowrap scrollbar-hide">
          <CldUploadWidget
            uploadPreset="kumasocialmedia"
            onSuccess={(result) => {
              console.log("Success:", result);
              setImage(result.info);
            }}
            onError={(error) => {
              console.log("Error:", error);
              setError("Upload failed. Check console for details.");
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
            onSuccess={(result) => {
              console.log("Success:", result);
              setImage(result.info);
            }}
            onError={(error) => {
              console.log("Error:", error);
              setError("Upload failed. Check console for details.");
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

          <CldUploadWidget
            uploadPreset="kumasocialmedia"
            onSuccess={(result) => {
              console.log("Success:", result);
              setImage(result.info);
            }}
            onError={(error) => {
              console.log("Error:", error);
              setError("Upload failed. Check console for details.");
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
            className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-fit cursor-pointer gap-2 text-center justify-center"
            disabled={isPending}
          >
            <FontAwesomeIcon icon={faSquarePollVertical} size="lg" />
            <span>Poll</span>
          </Button>
          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <Button
            type="button"
            className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-fit cursor-pointer gap-2 text-center justify-center"
            disabled={isPending}
          >
            <FontAwesomeIcon icon={faCalendar} size="lg" />
            <span>Event</span>
          </Button>
        </div>
      </form>
      {image && (
        <div className="mt-2">
          <img
            src={image.secure_url}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default Addpost;
