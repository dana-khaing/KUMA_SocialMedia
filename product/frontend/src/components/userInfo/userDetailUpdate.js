"use client";
import { useState } from "react";
import {
  faEllipsisVertical,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../ui/button";
import { CldUploadWidget } from "next-cloudinary";
import { updateProfile } from "@/lib/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UserDetailUpdate = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      router.refresh();
    }, 500);
  };

  return (
    <div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="text-[#FF4E01] w-8 h-8 hover:bg-gray-200 rounded-full">
          <FontAwesomeIcon icon={faEllipsisVertical} size="sm" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className=" bg-white rounded-2xl shadow-lg p-[0.1rem] mr-12 mb-2">
            <DropdownMenu.Item className="px-4 py-2 text-sm text-[#FF4E01] hover:bg-gray-50 rounded-2xl cursor-pointer ">
              <span onClick={() => setOpen(true)}>Edit</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>{" "}
      {open && (
        <div className=" absolute w-screen h-[150vh] bg-black top-0 backdrop-blur-md left-0 bg-opacity-35 flex items-center justify-center z-40">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const data = new FormData(e.target);
              const result = await updateProfile(data, cover?.secure_url);
              if (result.success) {
                toast("Profile updated successfully!");
              } else {
                toast("Failed to update profile.");
              }
              handleClose();
            }}
            className="p-5 bg-white md:bottom-[17rem] rounded-lg shadow-md flex flex-col gap-4 w-[70%] md:w-[45%] xl:w-[30%] relative"
          >
            <div className="flex justify-around items-center h-8">
              <span className="text-base text-[#FF4E01] flex flex-1 items-center justify-between px-4">
                Edit Profile Information
              </span>
              <span
                className="text-[#FF4E01] w-8 h-8 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                onClick={handleClose}
              >
                <FontAwesomeIcon icon={faXmark} size="md" />
              </span>
            </div>
            <div className="flex justify-center items-center">
              <img
                src={user?.avatar || "/user-default.png"}
                alt="profile"
                className="w-20 h-20 rounded-full ring-2 ring-[#FF4E01] transform bg-white"
              />
            </div>
            <div className="flex text-[#FF4E01] justify-center items-center font-bold text-lg">
              @{user?.username || "username"}
            </div>
            {/* Update field */}
            {/* Cover Photo */}
            <CldUploadWidget
              uploadPreset="kumasocialmedia"
              onSuccess={(result) => {
                setCover(result.info);
                document
                  .getElementById("upload-status")
                  .classList.add("bg-green-300");
              }}
              onError={(error) => {
                console.log("Upload error:", error);
              }}
            >
              {({ open: openUploadWidget }) => {
                return (
                  <div
                    onClick={() => openUploadWidget()}
                    className="flex flex-row items-center gap-2 px-5 sm:px-2"
                  >
                    <label htmlFor="cover" className="text-[#FF4E01]">
                      Cover Photo
                    </label>
                    <span
                      id="upload-status"
                      className=" text-sm flex flex-1 items-center justify-center text-[#FF4E01] border-[1px] border-gray-300 rounded-lg p-2 cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={faUpload}
                        size="sm"
                        className="px-2"
                      />
                      Upload
                    </span>
                  </div>
                );
              }}
            </CldUploadWidget>
            <div className="flex flex-col gap-2 px-5 sm:px-2">
              <label htmlFor="name" className="text-[#FF4E01]">
                First Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder={user?.name || "First Name"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>
            {/* for last name */}
            <div className="flex flex-col gap-2 px-5 sm:px-2">
              <label htmlFor="surname" className="text-[#FF4E01]">
                Last Name
              </label>
              <input
                type="text"
                name="surname"
                id="surname"
                placeholder={user?.surname || "Last Name"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>
            {/* for city */}
            <div className="flex flex-col gap-2 px-5 sm:px-2">
              <label htmlFor="city" className="text-[#FF4E01]">
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                placeholder={user?.city || "Where do you live, Kuma?"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>
            {/* for school */}
            <div className="flex flex-col gap-2 px-5 sm:px-2">
              <label htmlFor="school" className="text-[#FF4E01]">
                School
              </label>
              <input
                type="text"
                name="school"
                id="school"
                placeholder={user?.school || "Where did you graduate, Kuma?"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>
            {/* for work */}
            <div className="flex flex-col gap-2 px-5 sm:px-2">
              <label htmlFor="work" className="text-[#FF4E01]">
                Work
              </label>
              <input
                type="text"
                name="work"
                id="work"
                placeholder={user?.work || "Where do you work, Kuma?"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>
            {/* for website */}
            <div className="flex flex-col gap-2 px-5 sm:px-2">
              <label htmlFor="website" className="text-[#FF4E01]">
                Website
              </label>
              <input
                type="text"
                name="website"
                id="website"
                placeholder={user?.website || "Your website"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>
            {/* for bio */}
            <div className="flex flex-col gap-2 px-5 sm:px-2">
              <label htmlFor="bio" className="text-[#FF4E01]">
                Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                placeholder={user?.bio || "Bio"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>

            <div className="flex h-8 justify-center items-center">
              <Button
                className="flex items-center w-32 absolute rounded-full bg-[#FF4E01] text-white hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white h-fit cursor-pointer gap-2 text-center justify-center"
                type="submit"
              >
                Update Info
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default UserDetailUpdate;
