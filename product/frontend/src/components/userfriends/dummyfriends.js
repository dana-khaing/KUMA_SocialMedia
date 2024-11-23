import React from "react";

export const Dummyfriends = () => {
  return (
    <div className="flex gap-2 items-center hover:bg-slate-200 p-2 rounded-xl">
      <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
        <img
          src="/stories1.jpg"
          alt="profile"
          className="w-12 h-12 rounded-full ring-1 ring-[#FF4E01]"
        />
      </div>
      <div className="flex flex-col flex-grow cursor-pointer">
        <span className="text-black text-sm line-clamp-1">Hein Htet Aung</span>
        <span className="text-gray-500 text-xs line-clamp-1">
          2 mutual friends
        </span>
      </div>
    </div>
  );
};
export default Dummyfriends;
