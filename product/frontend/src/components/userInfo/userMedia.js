"use client";

import { useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";
import { use } from "react";
import { useEffect } from "react";

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

const UserMedia = ({ user, postWithMedia = [] }) => {
  // Gallery: Show up to 7 images
  const galleryImages = postWithMedia
    .flatMap((post) => post.images)
    .slice(0, 7);

  // Popup: All images from all posts
  const allImages = postWithMedia.flatMap((post) => post.images);
  console.log("allImages", allImages);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className="w-full h-[20rem] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col py-2 cursor-default">
        <div className="flex items-center px-4">
          <div className="text-sm text-[#ff4e02] py-2">Gallery</div>
        </div>
        <Separator
          orientation="horizontal"
          className="bg-[#FF4E01] h-[0.05rem] w-[95%] mx-auto"
        />
        <div className="grid grid-cols-4 grid-rows-2 gap-2 px-4 py-4">
          {galleryImages.length > 0 ? (
            galleryImages.map((image) => (
              <img
                key={image.id}
                src={image.url}
                className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
              />
            ))
          ) : (
            <div className="text-[#ff4e02] text-center w-full col-span-4 row-span-2 flex items-center justify-center">
              No media to show
            </div>
          )}
          {galleryImages.length === 7 && (
            <div
              onClick={handleImageClick}
              className="h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out flex justify-center items-center"
            >
              <FontAwesomeIcon
                icon={faEllipsis}
                size="2x"
                className="text-[#FF4E01]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Popup View */}
      {isPopupOpen && allImages.length > 0 && (
        <div className="fixed w-screen h-screen bg-black bg-opacity-50 top-0 left-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-md border-t-[2px] border-b-[2px] border-[#FF4E02] mx-auto flex flex-col gap-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[45%] xl:w-[30%] relative">
            <div className="p-5 flex flex-col gap-4">
              {/* User Details */}
              <div className="flex">
                <div className="flex flex-1 items-center gap-3">
                  <Link href={`/profile/${user.id}`}>
                    <img
                      src={user.avatar || "/user-default.png"}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <Link href={`/profile/${user.id}`}>
                      <span className="text-gray-800 text-md font-semibold">
                        {user.name && user.surname
                          ? `${user.name} ${user.surname}`
                          : user.username}
                      </span>
                    </Link>
                  </div>
                </div>
                <div
                  className="flex-0 w-10 h-10 hover:bg-gray-200 hover:text-black text-gray-600 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={handleClosePopup}
                >
                  <FontAwesomeIcon icon={faXmark} size="md" />
                </div>
              </div>

              {/* Image Carousel */}
              <div className="w-full h-[500px] overflow-hidden rounded-lg">
                <Carousel className="w-full" initialindex={selectedImageIndex}>
                  <CarouselContent>
                    {allImages.map((image, index) => (
                      <CarouselItem key={image.id || index}>
                        <div className="flex flex-col justify-center items-center pb-3 h-full">
                          {/* <div className="text-slate-400 text-sm">
                            <FontAwesomeIcon icon={faClock} size="sm" />
                            <span>
                              {" " +
                                formatPostTimestamp(
                                  image.createdAt || new Date()
                                )}
                            </span>
                          </div> */}
                          <img
                            src={image.url}
                            alt={`Gallery image ${index + 1}`}
                            className="max-h-[500px] max-w-full rounded-lg object-contain"
                          />{" "}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserMedia;
