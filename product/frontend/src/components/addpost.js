import { currentUser } from "@clerk/nextjs/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faSquarePollVertical } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

const Addpost = async () => {
  const user = await currentUser();
  const { imageUrl } = user;

  return (
    <div className="w-full h-fit shrink-0 rounded-2xl flex-col justify-center items-center px-7 py-5 shadow-md overflow-scroll text-sm border-[1px] bg-slate-50">
      {/* avator and textbox */}
      <div className="flex gap-3 ">
        <div className=" flex items-center justify-center w-12">
          <img
            src={imageUrl}
            alt="profile"
            className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 ring-[#FF4E01]"
          />
        </div>
        <div className=" flex-1 flex-col ">
          <textarea
            placeholder=" What's on your mind, Kuma ? "
            className="border-2 drop-shadow-md p-3 px-4 w-full h-12 rounded-full border-[#FF4E01] hover:border-[#FF4E01] focus:border-[#FF4E01] "
          ></textarea>
        </div>
      </div>

      {/* post options */}
      <div className="flex gap-5 items-center justify-end ">
        <div className="flex gap-2 items-center justify-end mt-2">
          <Button className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-10 cursor-pointer gap-2 text-center justify-center">
            <FontAwesomeIcon icon={faCamera} size="lg" />
            <span className="text-black">Photo</span>
          </Button>
          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <Button className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-10 cursor-pointer gap-2 text-center justify-center">
            <FontAwesomeIcon icon={faImage} size="lg" />
            <span className="text-black">Image</span>
          </Button>
          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <Button className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-10 cursor-pointer gap-2 text-center justify-center">
            <FontAwesomeIcon icon={faVideo} size="lg" />
            <span className="text-black">Video</span>
          </Button>
          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <Button className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-10 cursor-pointer gap-2 text-center justify-center">
            <FontAwesomeIcon icon={faSquarePollVertical} size="lg" />
            <span className="text-black">Poll</span>
          </Button>
          <Separator orientation="vertical" className="h-9 bg-[#FF4E01]" />
          <Button className="flex items-center w-24 rounded-full text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white bg-transparent h-10 cursor-pointer gap-2 text-center justify-center">
            <FontAwesomeIcon icon={faCalendar} size="lg" />
            <span className="text-black">Event</span>
          </Button>
          {/* finally post button */}
        </div>
        <div className="flex items-center  justify-center mt-2">
          <Button className=" items-center w-24 rounded-full bg-[#FF4E01] text-white hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white hover:text-base h-10 cursor-pointer gap-2 text-center justify-center">
            <span>Post</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Addpost;
