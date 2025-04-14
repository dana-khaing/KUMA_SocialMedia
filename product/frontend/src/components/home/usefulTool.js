import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faRss } from "@fortawesome/free-solid-svg-icons";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { faStreetView } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import SettingAction from "./settingAction";
import SearchUser from "./searchUser";
export const UsefulTool = () => {
  return (
    <div className=" w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-col cursor-default flex items-start justify-center py-4 ">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">UseFul Tools</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* setting Button */}
      <div className="w-full flex flex-col gap-1 px-4 ">
        <div className="w-full flex-grow  h-fit items-center bg-transparent shadow-md text-base text-[#FF4E02] hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <SearchUser />
        </div>

        <Link
          href={"/"}
          className=" flex-grow  h-fit items-center bg-transparent text-base shadow-md w-full text-[#FF4E02]  hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start"
        >
          <FontAwesomeIcon icon={faHome} size="md" className="  mr-2" />
          Home
        </Link>
        <Link
          href={"/friendlist"}
          className=" flex-grow  h-fit items-center bg-transparent text-base shadow-md w-full text-[#FF4E02]  hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start"
        >
          <FontAwesomeIcon icon={faUserCheck} size="md" className="mr-2" />
          Friends
        </Link>

        <Link
          href={"/studio"}
          className=" flex-grow  h-fit items-center bg-transparent text-base shadow-md w-full text-[#FF4E02]  hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start"
        >
          <FontAwesomeIcon icon={faRss} size="md" className="mr-2" />
          New Feed
        </Link>
        <Link
          href={"/activity"}
          className=" flex-grow  h-fit items-center bg-transparent text-base shadow-md w-full text-[#FF4E02]  hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start"
        >
          <FontAwesomeIcon icon={faStreetView} size="md" className="mr-2" />
          Activity
        </Link>
        <SettingAction />
      </div>
    </div>
  );
};
export default UsefulTool;
