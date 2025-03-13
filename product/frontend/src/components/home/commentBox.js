import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
const CommentBox = ({ user }) => {
  console.log(user);
  return (
    <div className="flex flex-col justify-center items-center ">
      {/* show comments */}
      <div className="w-full flex flex-col gap-2 items-center p-2 cursor-default">
        {/* to map */}
        <div className="hover:bg-gray-200 flex flex-row gap-3 w-full py-2 px-7 rounded-xl md:px-14">
          <img
            src="/user-default.png"
            alt="profile"
            className="w-8 h-8  rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
          />
          <div className="flex-1 flex-col items-center justify-center p-2">
            <div className="flex flex-row flex-1 items-center gap-5 justify-start ">
              <span className="text-black text-sm ">Hein Htet Aung</span>
              <span className="text-slate-400 text-xs ">2 hours ago</span>
            </div>
            {/* test box and reaction */}
            <div className="text-black px-3 pt-3 w-full text-sm hover:bg-gray-200 rounded-xl">
              This is a
              comment.sodfhishfgihdfsgoifhgoafhrsgsfdlkjhanasdjkfhnajshdfioiashfio
            </div>
            <div>
              <Button className="bg-inherit text-black shadow-none cursor-default hover:bg-slate-200 rounded-full">
                <FontAwesomeIcon icon={faThumbsUp} size="xs" />
                <span className="hidden md:block text-xs">Like</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="hover:bg-gray-200 flex flex-row gap-3 w-full py-3 px-7 rounded-xl md:px-14">
          <img
            src="/user-default.png"
            alt="profile"
            className="w-8 h-8  rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01]"
          />
          <div className="flex-1 flex-col items-center justify-center p-2">
            <div className="flex flex-row flex-1 items-center gap-5 justify-start ">
              <span className="text-black text-sm ">Hein Htet Aung</span>
              <span className="text-slate-400 text-xs ">2 hours ago</span>
            </div>
            {/* test box and reaction */}
            <div className="text-black px-3 pt-3 w-full text-sm hover:bg-gray-200 rounded-xl">
              This is a
              comment.sodfhishfgihdfsgoifhgoafhrsgsfdlkjhanasdjkfhnajshdfioiashfio
            </div>
            <div>
              <Button className="bg-inherit text-black shadow-none cursor-default hover:bg-slate-200 rounded-full">
                <FontAwesomeIcon icon={faThumbsUp} size="xs" />
                <span className="hidden md:block text-xs">Like</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Separator
        className="h-[0.05rem] w-[90%] mx-auto bg-[#FF4E01] my-auto"
        orientation="horizontal"
      />
      <div className="flex w-full gap-3 justify-center items-center mt-4 px-4">
        <img
          src={user?.avatar || "/user-default.png"}
          alt="profile"
          className="w-8 h-8 flex-shrink-0 rounded-full cursor-pointer ring-1 hover:ring-2 ring-[#FF4E01] object-cover justify-center items-center"
        />

        <input
          type="text"
          placeholder="Write a comment"
          className="w-full h-10 p-2 px-4 rounded-full border-2 bg-slate-100 text-black"
        />
        <Button className="flex items-center shadow-md justify-center bg-transparent  h-10 cursor-pointer hover:bg-[#FF4E02] hover:text-white rounded-full text-black">
          Comment
        </Button>
      </div>
    </div>
  );
};
export default CommentBox;
