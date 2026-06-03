import { Separator } from "@radix-ui/react-dropdown-menu";
import { CheckfriendsAction } from "./checkfriendsAction";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export const Checkfriends = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const friendlist = await prisma.friend.findMany({
    where: { userId },
    include: { friend: true },
  });

  const myFriendIds = new Set(friendlist.map((f) => f.friendId));

  const friendlistWithMutuals = await Promise.all(
    friendlist.map(async (f) => {
      const theirFriends = await prisma.friend.findMany({
        where: { userId: f.friendId },
        select: { friendId: true },
      });
      const mutualFriendsCount = theirFriends.filter((tf) =>
        myFriendIds.has(tf.friendId)
      ).length;
      return { ...f, followingId: f.friendId, following: f.friend, mutualFriendsCount };
    }),
  );

  return (
    <div className="w-full bg-slate-50 h-[28rem] rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">All Friends</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* Friend List */}
      <div className="max-h-[25rem] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-4">
        <CheckfriendsAction friendlist={friendlistWithMutuals} />
      </div>
    </div>
  );
};

export default Checkfriends;
