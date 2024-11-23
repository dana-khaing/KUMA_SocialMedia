import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faRss } from "@fortawesome/free-solid-svg-icons";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { faStreetView } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
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
      <div className="w-full flex flex-col gap-1 px-4">
        <Button className=" flex-grow  h-fit items-center bg-transparent text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <FontAwesomeIcon icon={faSearch} size="lg" className="mr-2" />
          Search
        </Button>
        <Button className=" flex-grow  h-fit items-center bg-transparent text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <FontAwesomeIcon icon={faRss} size="lg" className="mr-2" />
          New Feed
        </Button>
        <Button className=" flex-grow  h-fit items-center bg-transparent text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <FontAwesomeIcon icon={faUserCheck} size="lg" className="mr-2" />
          Friends
        </Button>
        <Button className=" flex-grow  h-fit items-center bg-transparent text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <FontAwesomeIcon icon={faUserGroup} size="lg" className="mr-2" />
          Group
        </Button>
        <Button className=" flex-grow  h-fit items-center bg-transparent text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <FontAwesomeIcon icon={faVideo} size="lg" className="mr-2" />
          Watch
        </Button>
        <Button className=" flex-grow  h-fit items-center bg-transparent text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <FontAwesomeIcon icon={faStreetView} size="lg" className="mr-2" />
          Activity
        </Button>
        <Button className=" flex-grow  h-fit items-center bg-transparent text-base text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start">
          <FontAwesomeIcon icon={faCog} size="lg" className="mr-2" />
          Setting
        </Button>
      </div>
    </div>
  );
};
export default UsefulTool;
