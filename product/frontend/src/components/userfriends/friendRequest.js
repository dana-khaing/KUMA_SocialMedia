import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { Separator } from "@radix-ui/react-separator";
import Dummyfriendrequest from "./dummyfriendrequest";

const FriendRequest = () => {
  return (
    <div className=" w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default ">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Friend Request</span>
        <span className="text-[#FF4E01]">See All</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* FriendRequest List */}
      <div className="h-[20rem] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-2">
        {/* Request Card */}
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
          {/* accept button */}
          <div className="flex items-center flex-grow justify-end gap-2 h-full">
            <button className=" w-[2.15rem] h-[2.15rem] text-white items-center flex justify-center bg-[#FF4E01] rounded-full">
              <FontAwesomeIcon
                icon={faUserCheck}
                size="sm"
                className="flex justify-center items-center"
              />
            </button>

            <button className="text-black bg-white rounded-full p-1">
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </button>
          </div>
        </div>
        <Dummyfriendrequest />
        <Dummyfriendrequest />
        <Dummyfriendrequest />
        <Dummyfriendrequest />
        <Dummyfriendrequest />
        <Dummyfriendrequest />
        <Dummyfriendrequest />
        <Dummyfriendrequest />
      </div>
    </div>
  );
};

export default FriendRequest;
