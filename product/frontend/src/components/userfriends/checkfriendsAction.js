import Link from "next/link";

export const CheckfriendsAction = ({ friendlist }) => {
  return (
    <>
      {friendlist.map((friend) => (
        <Link
          href={`/profile/${friend.followingId}`}
          key={friend.id}
          className="flex gap-2 items-center hover:bg-slate-200 p-2 rounded-xl"
        >
          <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
            <img
              src={friend.following.avatar || "/user-default.png"}
              alt="profile"
              className="w-10 h-10 rounded-full ring-1 ring-[#FF4E01]"
            />
          </div>
          <div className="flex flex-col flex-grow cursor-pointer">
            <span className="text-black text-sm line-clamp-1">
              {friend.following?.name && friend.following?.surname
                ? friend.following.name + " " + friend.following.surname
                : "Kuma User"}
            </span>
            <span className="text-gray-500 text-xs line-clamp-1">
              {friend.mutualFriendsCount} mutual friend
              {friend.mutualFriendsCount !== 0 &&
              friend.mutualFriendsCount !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </Link>
      ))}
    </>
  );
};
export default CheckfriendsAction;
