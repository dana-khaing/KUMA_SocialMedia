import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import OnlineFriends from "@/components/userfriends/onlineFriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";

import Notification from "@/components/activity/notification";

export const Activity = () => {
  return (
    <div className=" w-screen flex items-start grow-0 justify-center gap-4 p-4">
      {/* left */}
      <div className="hidden lg:block flex-col w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-full h-[120vh] flex-col shrink-0 lg:w-[50%] overflow-y-scroll scrollbar-hide overscroll-x-none gap-5">
        <Birthday />
        <Notification />
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col grow-0 gap-5 w-[25%]">
        <FriendRequest />

        <OnlineFriends />
      </div>
    </div>
  );
};
export default Activity;
