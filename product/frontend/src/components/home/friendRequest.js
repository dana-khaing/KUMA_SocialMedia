import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

const FriendRequest = () => {
  return (
    <div className="h-[25%] w-full overflow-y-scroll scrollbar-hide bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-black">Friend Request</span>
        <span className="text-[#FF4E01]">See All</span>
      </div>
      {/* FriendRequest List */}
      <div className="flex flex-col gap-4 ">
        {/* Request Card */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white items-center justify-center">
            <img
              src="/stories1.jpg"
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-black text-sm line-clamp-1">Htet Aung</span>
            <span className="text-gray-500 text-xs line-clamp-1">
              2 mutual friends
            </span>
          </div>
          {/* accept button */}
          <div className="flex items-center flex-grow justify-end gap-2 h-full">
            <button className="text-white bg-[#FF4E01] py-2 px-3 rounded-full p-1">
              Comfirm
            </button>

            <button className="text-black bg-white rounded-full p-1">
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequest;
