import Stories from "@/components/home/stories";
import Addpost from "@/components/home/addpost";
import Newfeed from "@/components/home/newfeed";
import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import Checkfriends from "@/components/userfriends/checkfriends";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Get following IDs
  const followings = await prisma.follower.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = followings.map((following) => following.followingId);

  // Fetch posts from following users
  const posts =
    (await prisma.post.findMany({
      where: { userId: { in: followingIds } },
      include: {
        user: true,
        likes: { select: { userId: true } },
        loves: { select: { userId: true } },
        images: true,
        comments: true,
        _count: { select: { comments: true, likes: true, loves: true } },
      },
      orderBy: { createdAt: "desc" },
    })) || [];

  // Fetch stories from following users and current user
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gte: new Date() },
      OR: [{ userId }, { userId: { in: followingIds } }],
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  // Group stories by user
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

  // Separate owner's stories and sort others by oldest story
  const ownerStories = groupedStories.filter(
    (group) => group.user.id === userId
  );
  const otherStories = groupedStories.filter(
    (group) => group.user.id !== userId
  );

  // Sort other stories by the oldest story in each group
  otherStories.sort((a, b) => {
    const aOldest = Math.min(
      ...a.stories.map((s) => new Date(s.createdAt).getTime())
    );
    const bOldest = Math.min(
      ...b.stories.map((s) => new Date(s.createdAt).getTime())
    );
    return aOldest - bOldest; // Ascending order (oldest first)
  });

  // Combine owner's stories first, then sorted others
  const finalStories = [...ownerStories, ...otherStories];

  return (
    <div className="h-[150vh] w-full flex items-start justify-center gap-4 p-4 lg:px-4 scrollbar-hide">
      {/* Left Sidebar */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <ProfileSmallCard />
        <UsefulTool />
      </div>
      {/* Center Content */}
      <div className="flex w-screen px-2 flex-col shrink-0 lg:w-[50%]">
        <div className="flex flex-col gap-5 w-full overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Stories user={user} stories={finalStories} />
          <Addpost user={user} />
          <Newfeed user={user} posts={posts} owner={userId} />
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="hidden lg:flex grow-0 flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Birthday />
        <Checkfriends />
      </div>
    </div>
  );
}
