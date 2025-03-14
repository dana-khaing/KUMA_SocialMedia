import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Checkfriends from "@/components/userfriends/checkfriends";

export const Friendlist = () => {
  return (
    <div className="h-screen w-full flex items-start justify-center gap-4 p-4">
      {/* left */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-screen px-2 shrink-0 flex-col lg:w-[50%] gap-5">
        <div className="flex flex-col gap-5 w-[100%] h-screen overflow-y-scroll scrollbar-hide overscroll-x-none">
          <FriendRequest />
          <Checkfriends />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <Birthday />
      </div>
    </div>
  );
};
export default Friendlist;
