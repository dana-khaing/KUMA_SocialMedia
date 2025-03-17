import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
const Stories = () => {
  return (
    <div className="w-[95%] mx-auto h-fit rounded-2xl overflow-x-auto overflow-scroll items-center py-4 px-5 shadow-md text-xs border-[1px] bg-slate-50 scrollbar-hide">
      {/* stories warp */}
      <div className="flex gap-1 md:gap-4 items-center w-max">
        {/* Add stories for the user */}
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <div className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] flex items-center justify-center">
            <Button className="w-[4rem] h-[4rem] rounded-full bg-white text-black hover:bg-slate-300">
              <FontAwesomeIcon
                icon={faPlus}
                size="lg"
                className="text-[#FF4E02]"
              />
            </Button>
          </div>
          <span className="text-black">Your Stories</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          {/* use this first one to use the image component from next js */}
          <Image
            src="/stories1.jpg"
            alt="stories"
            width={45}
            height={45}
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Ei</span>
        </div>
        {/* DumbData */}
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          <img
            src="/stories1.jpg"
            className="w-[4.5rem] h-[4.5rem] rounded-full ring-2 hover:ring-4 ring-[#FF4E01] m-1"
          />
          <span className="text-black">Dana</span>
        </div>
      </div>
    </div>
  );
};

export default Stories;
