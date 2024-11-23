import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { useClerk } from "@clerk/nextjs";
export const ProfileBigCard = ({ user }) => {
  const { openUserProfile } = useClerk();

  const handleEditProfile = () => {
    openUserProfile();
  };
  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] gap-1 flex-col cursor-default overflow-hidden pb-2 ">
      <div className="h-[15rem]">
        {/* Cover photo */}
        <div className="relative w-full mb-12 h-[75%]">
          <img
            src="/stories1.jpg"
            alt="Coverphoto"
            className="rounded-t-2xl fill-transparent w-full h-full object-cover"
          />
          <img
            src={user?.imageUrl || "user-default.png"}
            alt="profile"
            className="w-28 h-28 rounded-full ring-4 ring-white -bottom-14 absolute left-1/2 transform -translate-x-1/2 bg-white object-cover"
          />
        </div>
      </div>
      {/* Full name and username */}
      <div className="flex flex-col items-center justify-center px-4">
        <span className="text-black text-2xl font-bold">
          {user?.fullName || "Kuma User"}
        </span>
        <span className="text-gray-500">@{user?.username || "username"}</span>
      </div>
      {/* User's friends, followers, and following */}
      <div className="flex justify-center items-center text-base gap-4 my-2">
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
      <div className="flex items-center justify-center my-2">
        <Button
          onClick={handleEditProfile}
          className="w-36 rounded-full bg-[#FF4E01] text-white hover:text-[#FF4E01] hover:drop-shadow-lg hover:bg-white h-fit cursor-pointer gap-2 text-center justify-center"
        >
          <span>Edit Profile</span>
        </Button>
      </div>
    </div>
  );
};
export default ProfileBigCard;
