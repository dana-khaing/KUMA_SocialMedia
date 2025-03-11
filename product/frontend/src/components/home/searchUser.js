"use client";
import { useState } from "react";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Separator } from "@radix-ui/react-dropdown-menu";
export const SearchUser = () => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div
        onClick={() => setOpen(true)}
        className="w-full flex-grow  h-fit items-center bg-transparent shadow-md text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start"
      >
        <FontAwesomeIcon icon={faSearch} size="md" className="mr-2" />
        Search
      </div>
      {open && (
        <div className=" absolute w-screen h-[162vh] bg-black top-0 backdrop:blur-md left-0 bg-opacity-35 flex items-center justify-center z-50">
          <form className="p-5 bg-white rounded-lg shadow-md flex flex-col bottom-[32rem] gap-4 w-[70%] md:w-[35%] xl:w-[30%] relative">
            <div className="flex justify-around text-base text-[#FF4E01] items-center h-6">
              <span className="flex flex-1 px-5 ">Search</span>
              <span
                className="w-8 h-8 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                onClick={handleClose}
              >
                <FontAwesomeIcon icon={faXmark} size="md" />
              </span>
            </div>
            {/* search box */}
            <div className="w-full justify-center items-center px-5 ">
              <input
                type="text"
                placeholder=" Wanna find someone , Kuma?"
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="flex justify-center items-center text-xs text-gray-500 text-center h-6 bg-gray-300 mx-8 rounded-sm">
              ** you can find someone by name or user ID **
            </div>
            <Separator
              orientation="horizontal"
              className="bg-gray-300 h-[0.05rem] w-[95%] mb-2 mx-auto"
            />
          </form>
        </div>
      )}
    </div>
  );
};
export default SearchUser;
