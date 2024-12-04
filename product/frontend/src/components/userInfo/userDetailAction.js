"use client";
import { Button } from "../ui/button";
export const UserDetailAction = ({
  userId,
  currentUserId,
  owner,
  isUserBlocked,
  isUserFollowing,
  isUserFollowingSent,
}) => {
  return (
    <div>
      {owner ? (
        <>
          {/* follow button */}
          <form>
            <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
              <Button
                text="Follow"
                className="w-full h-8 bg-[#FF4E01] text-white hover:bg-white hover:text-[#ff4e02]"
              >
                <span>
                  {isUserFollowing
                    ? "Following"
                    : isUserFollowingSent
                    ? "Friend Request Sent"
                    : "Follow"}
                </span>
              </Button>
            </div>
          </form>
          {/* ban button */}
          <form>
            <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
              <Button className=" bg-transparent h-8 hover:bg-transparent hover:cursor-pointer text-rose-600">
                <span>{isUserBlocked ? "Unblock user" : "Block"}</span>
              </Button>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
};
export default UserDetailAction;
