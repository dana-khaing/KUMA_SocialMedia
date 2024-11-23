import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import DummyOnlineFriends from "./dummyOnlineFriends";
const OnlineFriends = () => {
  return (
    <div className=" w-full flex-grow bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Online Friends</span>
        <FontAwesomeIcon icon={faSearch} size="sm" className="text-[#FF4E01]" />
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* online friends list */}
      <div className="h-[30rem] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-2">
        {/* online friend card */}
        <div className="flex items-center hover:bg-slate-200 p-2 rounded-xl">
          <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
            <img
              src="/stories1.jpg"
              alt="profile"
              className="w-9 h-9 rounded-full ring-1 ring-[#FF4E01]"
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
          {/* active status */}
          <div className=" p-3 flex gap-2 justify-end items-center">
            <div className="w-2 h-2 bg-[#00FF00] rounded-full"></div>
            <span className="text-[#00FF00]">Online</span>
          </div>
        </div>
        <DummyOnlineFriends />
        <DummyOnlineFriends />
        <DummyOnlineFriends />
        <DummyOnlineFriends />
        <DummyOnlineFriends />
        <DummyOnlineFriends />
        <DummyOnlineFriends />
        <DummyOnlineFriends />
        <Separator
          orientation="horizontal"
          className="bg-[#FF4E01] h-[0.05rem] w-[95%] mx-auto"
        />
        {/* Offline friends (after looping the onine friends with extra space, offline friend will took over) */}
        <div className="flex items-center hover:bg-slate-200 p-2 rounded-xl">
          <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
            <img
              src="/stories1.jpg"
              alt="profile"
              className="w-9 h-9 rounded-full ring-1 ring-[#FF4E01]"
            />
          </div>
          <div className="flex flex-col flex-grow cursor-pointer">
            <span className="text-black text-sm line-clamp-1">
              Lewis Hamilton
            </span>
            <span className="text-gray-500 text-xs line-clamp-1">
              2 mutual friends
            </span>
          </div>
          {/* active status */}
          <div className=" p-3 flex gap-2 justify-end items-center">
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            <span className="text-slate-600">Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OnlineFriends;
