import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { faSuitcase } from "@fortawesome/free-solid-svg-icons";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import UserDetailAction from "./userDetailAction";
import UserDetailUpdate from "./userDetailUpdate";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export const UserDetail = async ({ user, owner }) => {
  let isUserBlocked = false;
  let isUserFollowing = false;
  let isUserFollowingSent = false;

  const { userId } = await auth();
  if (userId) {
    const blockRes = await prisma.block.findFirst({
      where: {
        blockerId: userId,
        blockedId: user?.id,
      },
    });
    blockRes ? (isUserBlocked = true) : (isUserBlocked = false);
    const followRes = await prisma.follower.findFirst({
      where: {
        followerId: userId,
        followingId: user?.id,
      },
    });
    followRes ? (isUserFollowing = true) : (isUserFollowing = false);
    const FollowRequestRes = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: user?.id,
      },
    });
    FollowRequestRes
      ? (isUserFollowingSent = true)
      : (isUserFollowingSent = false);
  }

  return (
    <div className=" w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col py-2 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-sm text-[#ff4e02] py-2">User Information </span>
        {owner && <UserDetailUpdate user={user} />}
      </div>
      <div className="flex-col gap-1 px-4 items-center">
        <div className="gap-4 flex items-center justify-start">
          <div className="text-black text-xl font-bold flex-shrink-0">
            {user?.name && user?.surname
              ? user.name + " " + user.surname
              : "Kuma User"}
          </div>
          <div className="text-gray-500 text-sm">
            {" "}
            @{user?.username || "username"}
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faLocationDot}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          {/* <div className="text-gray-500">Living in</div> */}
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.city || <p className="text-gray-300">unknown,kuma</p>}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faGraduationCap}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          {/* <div className="text-gray-500 flex-shrink-0">Graduated from</div> */}
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.school || <p className="text-gray-300">unknown,kuma</p>}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faSuitcase}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          {/* <div className="text-gray-500 flex-shrink-0">Works at</div> */}
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.work || <p className="text-gray-300">unknown,kuma</p>}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faPencil}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              {user?.bio || "No bio yet. Kuma"}
            </span>
          </div>
        </div>
        <div className="w-full h-10 flex gap-2 justify-around items-center">
          <FontAwesomeIcon
            icon={faLink}
            size="sm"
            className="text-[#FF4E01] w-6"
          />
          <div className="flex-grow">
            <span className="text-md line-clamp-1">
              <a
                className="hover:underline"
                href={user?.website || "unknown website,kuma"}
              >
                {user?.website || "unknown website,kuma"}
              </a>
            </span>
          </div>
        </div>
        {/* join in */}
        <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
          <div className="text-gray-500 flex-grow text-end">Joined in</div>
          <div>
            <span className="text-xs line-clamp-1">
              {new Date(user?.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) || "2021-09-01"}
            </span>
          </div>
        </div>

        <UserDetailAction
          userId={user?.id}
          owner={owner}
          currentUserId={userId}
          isUserBlocked={isUserBlocked}
          isUserFollowing={isUserFollowing}
          isUserFollowingSent={isUserFollowingSent}
        />
      </div>
    </div>
  );
};
export default UserDetail;
