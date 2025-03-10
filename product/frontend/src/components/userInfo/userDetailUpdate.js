"use client";
import { useState } from "react";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../ui/button";
const UserDetailUpdate = ({ user, owner }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
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
        <div className=" absolute w-screen h-screen top-0 left-0 bg-black bg-opacity-65 flex items-center justify-center z-50">
          <form
            action=""
            className="p-5 bg-white rounded-lg shadow-md flex flex-col gap-4 w-full md:w-[35%] xl:w-[30%] relative"
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
            <div className="flex flex-col gap-2 p-5">
              <label htmlFor="firstname" className="text-[#FF4E01]">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                placeholder={user?.name || "First Name"}
                className="border-[1px] border-gray-300 rounded-lg p-2 px-4"
              />
            </div>
            <div className="flex h-8 justify-center items-center">
              <Button
                className="flex items-center w-32 absolute rounded-full bg-[#FF4E01] text-white hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white h-fit cursor-pointer gap-2 text-center justify-center"
                onClick={handleClose}
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
