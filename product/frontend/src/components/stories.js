import Image from "next/image";
const Stories = () => {
  return (
    <div className="w-full h-fit flex-shrink-0 rounded-3xl items-center shadow-md overflow-scroll text-xs border-[1px] bg-slate-50 scrollbar-hide">
      <div className="flex gap-8 items-center m-4 w-max">
        <div className="flex flex-col items-center gap-1 cursor-pointer justify-start h-full w-[5rem]">
          {/* use this first one to use the image component from next js */}
          <Image
            src="/stories1.jpg"
            alt="stories"
            width={45}
            height={45}
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
