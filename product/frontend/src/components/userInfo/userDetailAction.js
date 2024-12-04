"use client";
import { Button } from "../ui/button";
import { useState, useOptimistic } from "react";
import { followAction } from "@/lib/action";

export const UserDetailAction = ({
  userId,
  currentUserId,
  owner,
  isUserBlocked,
  isUserFollowing,
  isUserFollowingSent,
}) => {
  const [userState, setUserState] = useState({
    following: isUserFollowing,
    blocked: isUserBlocked,
    followRequestSent: isUserFollowingSent,
  });

  const follow = async () => {
    switchOptimisticFollow("");
    try {
      await followAction(userId);
      setUserState((prevState) => ({
        ...prevState,
        following: prevState.following && false,
        followRequestSent:
          !prevState.following && !prevState.followRequestSent ? true : false,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const [optimisticFollow, switchOptimisticFollow] = useOptimistic(
    userState,
    (state) => ({
      ...state,
      following: state.following && false,
      followRequestSent:
        !state.following && !state.followRequestSent ? true : false,
    })
  );

  return (
    <div>
      {!owner ? (
        <>
          {/* follow button */}
          <form action={follow}>
            <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
              <Button
                text="Follow"
                className="w-full h-8 bg-[#FF4E01] text-white hover:bg-white hover:text-[#ff4e02]"
              >
                <span>
                  {optimisticFollow.following
                    ? "Following"
                    : optimisticFollow.followRequestSent
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
                <span>
                  {optimisticFollow.blocked ? "Unblock user" : "Block"}
                </span>
              </Button>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
};
export default UserDetailAction;
