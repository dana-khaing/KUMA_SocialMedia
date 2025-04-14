"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faClock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";

const PostPopup = ({ post, user, owner, onClose }) => {
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

  return (
    <div className="fixed w-screen h-screen bg-black bg-opacity-50 top-0 left-0 flex items-center justify-center z-50">
      <div className=" bg-white rounded-xl shadow-md border-t-[2px] border-b-[2px]   border-[#FF4E02] mx-auto flex flex-col gap-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[45%] xl:w-[30%] relative">
        <div className="p-5 flex flex-col gap-4">
          {/* Post Details */}
          <div className="flex">
            <div className="flex flex-1 items-center gap-3">
              <Link href={`/profile/${post.user.id}`}>
                <img
                  src={post.user?.avatar || "/user-default.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div className="flex flex-col">
                <Link href={`/profile/${post.user.id}`}>
                  <span className="text-gray-800 text-md font-semibold">
                    {post.user.name + " " + post.user.surname ||
                      post.user.username}
                  </span>
                </Link>
                <div className="text-slate-400 text-sm">
                  <FontAwesomeIcon icon={faClock} size="sm" />
                  <span>{" " + formatPostTimestamp(post.createdAt)}</span>
                </div>
              </div>
            </div>
            <div
              className=" flex-0 w-10 h-10 hover:bg-gray-200 hover:text-black text-gray-600 rounded-full flex items-center justify-center cursor-pointer"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} size="md" />
            </div>
          </div>
          <p className="text-justify py-2 px-5">{post.desc}</p>

          {/* Image Carousel */}
          <div className="w-full h-[500px] overflow-hidden rounded-lg">
            <Carousel className="w-full">
              <CarouselContent loop={true}>
                {post.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="flex justify-center items-center pb-3 h-full">
                      <img
                        src={image.url}
                        alt={`Post image ${index + 1}`}
                        className="max-h-[500px] max-w-full rounded-lg object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPopup;
