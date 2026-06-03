import { Separator } from "@radix-ui/react-separator";
import { auth } from "@clerk/nextjs/server";
import FriendRequestPanel from "@/components/userfriends/friendRequestPanel";
import prisma from "@/lib/client";

const FriendRequest = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const requests = await prisma.followRequest.findMany({
    where: { receiverId: userId },
    include: { sender: true },
  });

  return (
    <div className="w-full h-[25rem] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Friend Requests</span>
        <span className="text-[#FF4E01]">See All</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      <div className="h-[20rem] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-2">
        <FriendRequestPanel initialRequests={requests} />
        {!requests.length && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#FF4E01]">No requests yet, Kuma!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequest;
