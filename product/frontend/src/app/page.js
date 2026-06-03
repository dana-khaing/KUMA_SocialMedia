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

    const friends = await prisma.friend.findMany({
      where: { userId },
      select: { friendId: true },
    });

    const followingIds = friends.map((f) => f.friendId);

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
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-start justify-center gap-4 p-4 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:px-4">
      <div className="hidden min-h-0 grow-0 flex-col gap-5 overflow-y-auto scrollbar-hide lg:flex lg:w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>

      <div className="flex w-screen min-h-0 shrink-0 flex-col px-2 lg:h-full lg:w-[50%] lg:overflow-y-auto lg:scrollbar-hide">
        <div className="flex w-full flex-col gap-5">
          <Stories user={user} stories={finalStories} />
          <HomeFeedClient user={user} posts={posts} owner={userId} />
        </div>
      </div>

      <div className="hidden min-h-0 grow-0 flex-col gap-5 overflow-y-auto scrollbar-hide lg:flex lg:w-[25%]">
        <FriendRequest />
        <Checkfriends />
      </div>
    </div>
  );
}
