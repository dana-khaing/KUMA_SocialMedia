"use client";
import { Button } from "../ui/button.jsx";
import { useState, useOptimistic } from "react";
import { followAction, blockAction } from "@/lib/action";

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

  //   Follow action
  const follow = async () => {
    switchOptimisticState("follow");
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
  // i am going to use just one optimistic hook to handle the state of the user
  const [optimisticState, switchOptimisticState] = useOptimistic(
    userState,
    (state, value) =>
      value === "follow"
        ? {
            ...state,
            following: state.following && false,
            followRequestSent:
              !state.following && !state.followRequestSent ? true : false,
          }
        : { ...state, blocked: !state.blocked }
  );
  //  Block action
  const block = async () => {
    switchOptimisticState("block");
    try {
      await blockAction(userId);
      setUserState((prevState) => ({
        ...prevState,
        blocked: !prevState.blocked,
      }));
    } catch (error) {
      console.log(error);
    }
  };
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
                  {optimisticState.following
                    ? "Following"
                    : optimisticState.followRequestSent
                    ? "Friend Request Sent"
                    : "Follow"}
                </span>
              </Button>
            </div>
          </form>
          {/* ban button */}
          <form action={block}>
            <div className="w-full h-10 flex gap-2 justify-end items-center text-end">
              <Button className=" bg-transparent h-8 hover:bg-transparent hover:cursor-pointer text-rose-600">
                <span>
                  {optimisticState.blocked ? "Unblock user" : "Block"}
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
