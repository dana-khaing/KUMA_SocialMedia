"use client";
import Stories from "@/components/home/stories";
import Addpost from "@/components/home/addpost";
import Newfeed from "@/components/home/newfeed";
import FriendRequest from "@/components/userfriends/friendRequest";
import Birthday from "@/components/userfriends/birthday";
import OnlineFriends from "@/components/userfriends/onlineFriends";
import ProfileSmallCard from "@/components/userInfo/profileSmallCard";
import UsefulTool from "@/components/home/usefulTool";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSignOut } from "@clerk/nextjs";
export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && (!isSignedIn || !user)) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || !isSignedIn || !user) {
    return null; // Avoid rendering content before redirect
  }
  return (
    <div className="h-[120vh] w-screen flex items-start justify-center gap-4 py-4">
      {/* left */}
      <div className="hidden lg:block flex-col w-[25%]">
        <ProfileSmallCard user={user} />
        <UsefulTool />
      </div>
      {/* center */}
      <div className="flex w-full flex-col lg:w-[50%] gap-5">
        <div className="flex flex-col gap-5 w-[100%] h-[150vh] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Stories />
          <Addpost user={user} />
          <Newfeed user={user} />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col gap-5 w-[25%]">
        <FriendRequest />
        <Birthday />
        <OnlineFriends />
      </div>
    </div>
  );
}
