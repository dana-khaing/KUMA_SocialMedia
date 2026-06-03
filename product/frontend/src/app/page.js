import Stories from "@/components/home/stories";
import HomeFeedClient from "@/components/home/homeFeedClient";
import FriendRequest from "@/components/userfriends/friendRequest";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Checkfriends from "@/components/userfriends/checkfriends";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import BetaDatabaseFallback from "@/components/common/betaDatabaseFallback";
import { isDatabaseUnavailableError } from "@/lib/databaseStatus";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) return null;

  let user;
  let posts;
  let finalStories;

  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          username: `user_${userId.slice(-6)}`,
          name: "Kuma",
          surname: "User",
          avatar: "/user-default.png",
          cover: "/cover-default.jpg",
          bio: "Hello, I'm new here! Kuma!",
        },
      });
    }

    const followings = await prisma.follower.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = followings.map((following) => following.followingId);

    posts =
      (await prisma.post.findMany({
        where: {
          OR: [{ userId }, { userId: { in: followingIds } }],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              username: true,
              avatar: true,
            },
          },
          likes: {
            select: {
              userId: true,
              createdAt: true,
            },
          },
          loves: {
            select: {
              userId: true,
              createdAt: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  surname: true,
                  username: true,
                  avatar: true,
                },
              },
              likes: {
                select: {
                  userId: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          images: true,
          _count: {
            select: { likes: true, loves: true, comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })) || [];

    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gte: new Date() },
        OR: [{ userId }, { userId: { in: followingIds } }],
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const groupedStories = stories.reduce((acc, story) => {
      const { user, ...storyData } = story;
      const existingUser = acc.find((group) => group.user.id === user.id);

      if (existingUser) {
        existingUser.stories.push(storyData);
      } else {
        acc.push({ user, stories: [storyData] });
      }

      return acc;
    }, []);

    const ownerStories = groupedStories.filter(
      (group) => group.user.id === userId,
    );

    const otherStories = groupedStories.filter(
      (group) => group.user.id !== userId,
    );

    otherStories.sort((a, b) => {
      const aOldest = Math.min(
        ...a.stories.map((s) => new Date(s.createdAt).getTime()),
      );
      const bOldest = Math.min(
        ...b.stories.map((s) => new Date(s.createdAt).getTime()),
      );

      return aOldest - bOldest;
    });

    finalStories = [...ownerStories, ...otherStories];
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return <BetaDatabaseFallback />;
    }

    throw error;
  }

  return (
    <div className="h-[150vh] w-full flex items-start justify-center gap-4 p-4 lg:px-4 scrollbar-hide">
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>

      <div className="flex w-screen px-2 flex-col shrink-0 lg:w-[50%]">
        <div className="flex flex-col gap-5 w-full overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Stories user={user} stories={finalStories} />
          <HomeFeedClient user={user} posts={posts} owner={userId} />
        </div>
      </div>

      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Checkfriends />
      </div>
    </div>
  );
}
