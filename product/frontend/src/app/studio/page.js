import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import OnlineFriends from "@/components/userfriends/onlineFriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Newfeed from "@/components/home/newfeed";

export const Studio = () => {
  return (
    <div className="h-[120vh] w-screen grow-0 flex items-start justify-center gap-4 p-4">
      {/* left */}
      <div className="hidden lg:block flex-col w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-full shrink-0 flex-col lg:w-[50%] gap-5">
        <div className="flex flex-col gap-5 w-[100%] h-[150vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Newfeed />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Birthday />
        <OnlineFriends />
      </div>
    </div>
  );
};
export default Studio;
