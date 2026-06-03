import FriendRequest from "@/components/userfriends/friendRequest";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Checkfriends from "@/components/userfriends/checkfriends";

export const Friendlist = () => {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-start justify-center gap-4 p-4 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:px-4">
      {/* left */}
      <div className="hidden min-h-0 grow-0 flex-col gap-5 overflow-y-auto scrollbar-hide lg:flex lg:w-[25%] lg:h-full">
        <div className="shrink-0"><ProfileSmallCard /></div>
        <div className="shrink-0"><UsefulTool /></div>
      </div>
      {/* center */}
      <div className="flex w-screen min-h-0 shrink-0 flex-col gap-5 px-2 lg:h-full lg:w-[50%] lg:overflow-y-auto lg:scrollbar-hide">
        <FriendRequest />
        <Checkfriends />
      </div>
      {/* right */}
      <div className="hidden min-h-0 grow-0 flex-col gap-5 overflow-y-auto scrollbar-hide lg:flex lg:w-[25%] lg:h-full">
        <div className="shrink-0"><Checkfriends /></div>
      </div>
    </div>
  );
};

export default Friendlist;
