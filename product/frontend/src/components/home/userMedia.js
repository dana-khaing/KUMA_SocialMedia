import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
export const UserMedia = () => {
  return (
    <div className=" w-full h-[20rem] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col py-2 cursor-default">
      <div className="flex items-center px-4  ">
        <div className="text-sm text-[#ff4e02] py-2">Gallery </div>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mx-auto"
      />
      {/* use grid of 4 /4 to show photo */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 px-4 py-4">
        {" "}
        <img
          src="/1.jpg"
          alt="user"
          className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />
        <img
          src="/1.jpg"
          alt="user"
          className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />{" "}
        <img
          src="/1.jpg"
          alt="user"
          className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />{" "}
        <img
          src="/1.jpg"
          alt="user"
          className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />{" "}
        <img
          src="/1.jpg"
          alt="user"
          className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />{" "}
        <img
          src="/1.jpg"
          alt="user"
          className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />{" "}
        <img
          src="/1.jpg"
          alt="user"
          className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />{" "}
        <div className=" h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out justify-center items-center flex">
          <FontAwesomeIcon icon={faPlus} size="2x" className="text-[#FF4E01]" />
        </div>
      </div>
    </div>
  );
};
export default UserMedia;
