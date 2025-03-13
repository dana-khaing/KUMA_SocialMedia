import Stories from "@/components/home/stories";
import Addpost from "@/components/home/addpost";
import Newfeed from "@/components/home/newfeed";
import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import OnlineFriends from "@/components/userfriends/onlineFriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  /// get following ids
  const followings = await prisma.follower.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  /// map following followingId
  const followingIds = followings.map((following) => following.followingId);
  console.log(followingIds);

  /// fetch all posts from following
  const posts = await prisma.post.findMany({
    where: {
      userId: {
        in: followingIds,
      },
    },
    include: {
      user: true,
      likes: {
        select: {
          userId: true,
        },
      },
      loves: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="h-screen w-full flex items-start justify-center gap-4 p-4 lg:px-4 scrollbar-hide">
      {/* left */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-screen px-2 flex-col shrink-0  lg:w-[50%]">
        <div className="flex flex-col gap-5 w-[100%] h-[120vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Stories />
          <Addpost user={user} />
          <Newfeed />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Birthday />
        <OnlineFriends />
      </div>
    </div>
  );
}
