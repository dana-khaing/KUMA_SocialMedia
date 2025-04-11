import FriendRequest from "@/components/userfriends/friendRequest";
import Checkfriends from "@/components/userfriends/checkfriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Newfeed from "@/components/home/newfeed";
import { auth } from "@clerk/nextjs/server";

export const Studio = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Fetch users blocked by the current user
  const blockedByMe = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });
  const blockedByMeIds = blockedByMe.map((b) => b.blockedId);

  // Fetch users who blocked the current user
  const blockedMe = await prisma.block.findMany({
    where: { blockedId: userId },
    select: { blockerId: true },
  });
  const blockedMeIds = blockedMe.map((b) => b.blockerId);

  // Combine all blocked user IDs (both directions)
  const allBlockedIds = [...new Set([...blockedByMeIds, ...blockedMeIds])];

  // Fetch my posts (not affected by blocks, but included for completeness)
  const myPosts = await prisma.post.findMany({
    where: { userId: userId },
    include: { user: true, likes: true, loves: true, comments: true },
  });

  // Fetch following IDs
  const following = await prisma.follower.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  // Fetch follower IDs
  const followers = await prisma.follower.findMany({
    where: { followingId: userId },
    select: { followerId: true },
  });
  const followerIds = followers.map((f) => f.followerId);

  // Combine all relevant user IDs (self, following, followers)
  const allUserIds = [...new Set([userId, ...followingIds, ...followerIds])];

  // Fetch all posts, excluding blocked users
  const allPosts = await prisma.post.findMany({
    where: {
      userId: {
        in: allUserIds,
        notIn: allBlockedIds, // Exclude blocked users
      },
    },
    include: { user: true, likes: true, loves: true, comments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="h-screen w-full flex items-start justify-center gap-4 p-4">
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      <div className="flex w-screen px-2 flex-col lg:w-[50%] shrink-0 gap-5 overflow-y-scroll scrollbar-hide overscroll-x-none">
        <div className="flex flex-col gap-5 h-screen overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Newfeed posts={allPosts} user={user} owner={userId} />
        </div>
      </div>
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Checkfriends />
      </div>
    </div>
  );
};

export default Studio;
