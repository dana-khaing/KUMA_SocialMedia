import Stories from "@/components/home/stories";
import Addpost from "@/components/home/addpost";
import Newfeed from "@/components/home/newfeed";
import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import { auth } from "@clerk/nextjs/server";
import Checkfriends from "@/components/userfriends/checkfriends";

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

  /// fetch all posts from following
  const posts =
    (await prisma.post.findMany({
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
          select: {
            comments: true,
            likes: true,
            loves: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })) || [];
  /// fetch all stories from following and current user

  const stories = await prisma.story.findMany({
    where: {
      expiresAt: {
        gte: new Date(),
      },
      OR: [{ userId: { in: followingIds } }, { userId: userId }],
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  console.log("stories", stories);
  return (
    <div className="h-[150vh] w-full flex items-start justify-center gap-4 p-4 lg:px-4 scrollbar-hide">
      {/* left */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-screen px-2 flex-col shrink-0 lg:w-[50%] ">
        <div className="flex flex-col gap-5 w-full overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Stories user={user} stories={stories} />
          <Addpost user={user} />
          <Newfeed user={user} posts={posts} owner={userId} />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Birthday />
        <Checkfriends />
      </div>
    </div>
  );
}
