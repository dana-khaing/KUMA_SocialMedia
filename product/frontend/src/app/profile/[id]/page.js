import FriendRequest from "@/components/userfriends/friendRequest";
import OnlineFriends from "@/components/userfriends/onlineFriends";
import ProfileBigCard from "@/components/userInfo/profileBigCard";
import UsefulTool from "@/components/home/usefulTool";
import Newfeed from "@/components/home/newfeed";
import UserDetail from "@/components/userInfo/userDetail";
import UserMedia from "@/components/userInfo/userMedia";

const Profilepage = () => {
  return (
    <div className="h-[120vh] w-screen flex items-start justify-center gap-4 py-4">
      {/* left */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <FriendRequest />
        <OnlineFriends />
      </div>
      {/* center */}
      <div className="flex w-full flex-col lg:w-[50%] gap-5 h-[150vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
        <div className="h-fit">
          <ProfileBigCard />
        </div>
        <div className="flex lg:hidden">
          <UserDetail />
        </div>
        <div className="flex lg:hidden">
          <UserMedia />
        </div>
        <div className="flex flex-col gap-5 w-full">
          <Newfeed />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <UserDetail />
        <UserMedia />
        <UsefulTool />
      </div>
    </div>
  );
};

export default Profilepage;
