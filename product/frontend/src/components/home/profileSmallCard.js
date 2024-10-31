"use client";
import { useUser } from "@clerk/nextjs";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export const ProfileSmallCard = () => {
  const { user } = useUser();
  const router = useRouter();

  const handleViewProfile = () => {
    router.push(`/profile/${user?.username}`);
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-col cursor-default overflow-hidden pb-4">
      {/* Cover photo */}
      <div className="h-[15rem]">
        <div className="relative w-full mb-12 h-[50%]">
          <img
            src="/stories1.jpg"
            alt="Coverphoto"
            className="rounded-t-2xl fill-transparent w-full h-full object-cover"
          />
          <img
            src={user?.imageUrl || "/default-profile.png"}
            alt="profile"
            className="w-20 h-20 rounded-full ring-4 ring-white -bottom-10 absolute left-1/2 transform -translate-x-1/2"
          />
        </div>
        {/* Full name and username */}
        <div className="flex flex-col items-center justify-center px-4">
          <span className="text-black font-bold">
            {user?.fullName || "Kuma User"}
          </span>
          <span className="text-gray-500">@{user?.username || "username"}</span>
        </div>
        {/* Bio */}
        <div className="flex flex-col items-center justify-center px-4">
          <span className="text-black font-bold">Bio</span>
          <span className="text-gray-500 line-clamp-1">
            {user?.bio || "No bio, Kuma"}
          </span>
        </div>
      </div>
      {/* User's friends, followers, and following */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-black font-bold">Friends</span>
          <span className="text-gray-500">0</span>
        </div>
        <Separator orientation="vertical" className="h-8 bg-[#FF4E01]" />
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-black font-bold">Followers</span>
          <span className="text-gray-500">0</span>
        </div>
        <Separator orientation="vertical" className="h-8 bg-[#FF4E01]" />
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-black font-bold">Following</span>
          <span className="text-gray-500">0</span>
        </div>
      </div>
      {/* View Profile button */}
      <div className="flex items-center justify-center mt-4">
        <Button
          onClick={handleViewProfile}
          className="w-36 rounded-full bg-[#FF4E01] text-white hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white h-fit cursor-pointer gap-2 text-center justify-center"
        >
          <span>View Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileSmallCard;
