import { Separator } from "@radix-ui/react-dropdown-menu";
import { CheckfriendsAction } from "./checkfriendsAction";
import { auth } from "@clerk/nextjs/server";

export const Checkfriends = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  // Fetch the current user's following list
  const friendlist = await prisma.follower.findMany({
    where: {
      followerId: userId, // Users the current user follows
    },
    include: {
      following: true, // Include the friend's details
    },
  });

  // Fetch the current user's followers (to compare for mutuals)
  const myFollowers = await prisma.follower.findMany({
    where: {
      followingId: userId, // Users who follow the current user
    },
    select: {
      followerId: true, // Only need the follower IDs
    },
  });
  const myFollowerIds = new Set(myFollowers.map((f) => f.followerId));

  // Calculate mutual friends for each friend
  const friendlistWithMutuals = await Promise.all(
    friendlist.map(async (friend) => {
      const friendFollowers = await prisma.follower.findMany({
        where: {
          followingId: friend.followingId, // Users who follow this friend
        },
        select: {
          followerId: true,
        },
      });
      const friendFollowerIds = new Set(
        friendFollowers.map((f) => f.followerId)
      );

      // Mutual friends are those in both myFollowerIds and friendFollowerIds
      const mutualFriendsCount = [...friendFollowerIds].filter((id) =>
        myFollowerIds.has(id)
      ).length;

      return {
        ...friend,
        mutualFriendsCount,
      };
    })
  );

  return (
    <div className="w-full bg-slate-50 h-[28rem] rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">All Following</span>
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
