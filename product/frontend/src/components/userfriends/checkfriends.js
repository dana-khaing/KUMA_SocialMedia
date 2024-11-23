import { Separator } from "@radix-ui/react-dropdown-menu";
import Dummyfriends from "./dummyfriends";
export const Checkfriends = () => {
  return (
    <div className=" w-full h-[55rem] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default ">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">All Friends</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* Friend List */}
      <div className="h-[50rem] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-4">
        {/* Friend Card */}
        <div className="flex gap-2 items-center hover:bg-slate-200 p-2 rounded-xl">
          <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
            <img
              src="/stories1.jpg"
              alt="profile"
              className="w-12 h-12 rounded-full ring-1 ring-[#FF4E01]"
            />
          </div>
          <div className="flex flex-col flex-grow cursor-pointer">
            <span className="text-black text-sm line-clamp-1">
              Hein Htet Aung
            </span>
            <span className="text-gray-500 text-xs line-clamp-1">
              2 mutual friends
            </span>
          </div>
        </div>
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
        <Dummyfriends />
      </div>
    </div>
  );
};
export default Checkfriends;
