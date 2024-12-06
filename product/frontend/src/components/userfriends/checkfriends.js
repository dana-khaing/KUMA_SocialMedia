import { Separator } from "@radix-ui/react-dropdown-menu";
import { CheckfriendsAction } from "./checkfriendsAction";
import { auth } from "@clerk/nextjs/server";
export const Checkfriends = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const friendlist = await prisma.follower.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: true,
    },
  });
  return (
    <div className=" w-full h-[55rem] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default ">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">All Friends</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* Friend List */}
      <div className="h-[50rem] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-4">
        {/* Friend Card */}
        <CheckfriendsAction friendlist={friendlist} />
      </div>
    </div>
  );
};
export default Checkfriends;
