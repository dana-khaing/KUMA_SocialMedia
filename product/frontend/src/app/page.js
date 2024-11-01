import Stories from "@/components/home/stories";
import Addpost from "@/components/home/addpost";
import Newfeed from "@/components/home/newfeed";
import FriendRequest from "@/components/home/friendRequest";
import Birthday from "@/components/home/birthday";
import OnlineFriends from "@/components/home/onlineFriends";
import ProfileSmallCard from "@/components/home/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
export default function Home() {
  return (
    <div className="h-[120vh] w-screen flex items-start justify-center gap-4 px-2">
      {/* left */}
      <div className="hidden lg:block flex-col w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-full flex-col lg:w-[50%] gap-5  px-0 ">
        <Stories />
        <div className="flex flex-col gap-5 w-[100%] h-[125vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Addpost />
          <Newfeed />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Birthday />
        <OnlineFriends />
      </div>
    </div>
  );
}
