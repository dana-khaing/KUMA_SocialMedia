import { Separator } from "@radix-ui/react-separator";
import { auth } from "@clerk/nextjs/server";
import { FriendRequestList } from "@/components/userfriends/friendRequestList";
import prisma from "@/lib/client";
const FriendRequest = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const request = await prisma.followRequest.findMany({
    where: {
      receiverId: userId,
    },
    include: {
      // fetching user data to show in the request
      sender: true,
    },
  });

  return (
    <div className=" w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default ">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Follow Request</span>
        <span className="text-[#FF4E01]">See All</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* FriendRequest List */}
      <div className="h-[20rem] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-2">
        {/* Request User */}
        <FriendRequestList request={request} />
        {!request.length && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#FF4E01]">No Request yet, Kuma!!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequest;
