import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { faSuitcase } from "@fortawesome/free-solid-svg-icons";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export const UserDetail = ({ user, owner }) => {
  return (
    <div className=" w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col py-2 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-sm text-[#ff4e02] py-2">User Information </span>
        <button className="text-[#FF4E01] w-8 h-8 hover:bg-gray-200 rounded-full">
          <FontAwesomeIcon icon={faEllipsisVertical} size="sm" />
        </button>
      </div>

      <div className="flex-col gap-1 px-4 items-center">
        <div className="gap-4 flex items-center justify-start">
          <div className="text-black text-xl font-bold">
            {user?.name && user?.surname
              ? user.name + " " + user.surname
              : "Kuma User"}
          </div>
          <div className="text-gray-500 text-sm">
            {" "}
            @{user?.username || "username"}
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faLocationDot}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          <div className="text-gray-500">Living in</div>
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.city || "unknown,kuma"}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faGraduationCap}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          <div className="text-gray-500 flex-shrink-0">Graduated from</div>
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.school || "unknown,kuma"}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faSuitcase}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          <div className="text-gray-500">Works at</div>
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.work || "unknown,kuma"}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faPencil}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.bio || "No bio yet. Kuma"}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faLink}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              <a
                className="hover:underline"
                href={user?.website || "https://kuma.com"}
              >
                {user?.website || "https://kuma.com"}
              </a>
            </span>
          </div>
        </div>
        {/* join in */}
        <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
          <div className="text-gray-500 flex-grow text-end">Joined in</div>
          <div>
            <span className="text-xs line-clamp-1">
              {new Date(user?.createdAt).toLocaleDateString() || "2021-09-01"}
            </span>
          </div>
        </div>

        {owner ? (
          <>
            {/* follow button */}
            <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
              <Button
                text="Follow"
                className="w-full h-8 bg-[#FF4E01] text-white hover:bg-white hover:text-[#ff4e02]"
              >
                <span>Follow</span>
              </Button>
            </div>
            {/* ban button */}
            <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
              <Button
                text="Block"
                className="w-full h-8 bg-[#FF4E01] text-white hover:bg-white hover:text-[#ff4e02]"
              >
                <span>Block</span>
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
export default UserDetail;
