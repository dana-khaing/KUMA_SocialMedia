import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserCheck } from "@fortawesome/free-solid-svg-icons";
const Dummyfriendrequest = () => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
        <img
          src="/stories1.jpg"
          alt="profile"
          className="w-9 h-9 rounded-full ring-1 ring-[#FF4E01]"
        />
      </div>
      <div className="flex flex-col flex-grow cursor-pointer">
        <span
          className="text-black text-sm line-clamp-1"
          alt="Ei Kay ZIn Soe Moe"
        >
          Ei Kay Zin Soe Moe
        </span>
        <span className="text-gray-500 text-xs line-clamp-1">
          5 mutual friends
        </span>
      </div>
      {/* accept button */}
      <div className="flex items-center flex-grow justify-end gap-2 h-full">
        <button className=" w-[2.15rem] h-[2.15rem] text-white items-center flex justify-center bg-[#FF4E01] rounded-full p-3">
          <FontAwesomeIcon icon={faUserCheck} size="sm" />
        </button>

        <button className="text-black bg-white rounded-full p-1">
          <FontAwesomeIcon icon={faXmark} size="sm" />
        </button>
      </div>
    </div>
  );
};
export default Dummyfriendrequest;
