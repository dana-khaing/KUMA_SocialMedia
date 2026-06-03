"use client";
import { Button } from "../ui/button.jsx";
import { useState, useOptimistic } from "react";
import { sendFriendRequest, unfriendAction, acceptFriendRequest, rejectFriendRequest, blockAction } from "@/lib/action";
import { toast } from "sonner";

export const UserDetailAction = ({
  userId,
  currentUserId,
  owner,
  isUserBlocked,
  isUserFriend,
  isRequestSent,
  isRequestReceived,
}) => {
  const [userState, setUserState] = useState({
    friend: isUserFriend,
    blocked: isUserBlocked,
    requestSent: isRequestSent,
    requestReceived: isRequestReceived,
  });

  const [optimisticState, updateOptimistic] = useOptimistic(
    userState,
    (state, action) => {
      switch (action) {
        case "add":
          return { ...state, requestSent: true };
        case "cancel":
          return { ...state, requestSent: false };
        case "accept":
          return { ...state, friend: true, requestReceived: false };
        case "decline":
          return { ...state, requestReceived: false };
        case "unfriend":
          return { ...state, friend: false };
        case "block":
          return { ...state, blocked: !state.blocked, friend: false, requestSent: false, requestReceived: false };
        default:
          return state;
      }
    }
  );

  const handleAddOrCancel = async () => {
    const action = optimisticState.requestSent ? "cancel" : "add";
    updateOptimistic(action);
    try {
      await sendFriendRequest(userId);
      setUserState((s) => ({ ...s, requestSent: !s.requestSent }));
      toast(optimisticState.requestSent ? "Friend request cancelled." : "Friend request sent!");
    } catch (e) {
      console.log(e);
    }
  };

  const handleAccept = async () => {
    updateOptimistic("accept");
    try {
      await acceptFriendRequest(userId);
      setUserState((s) => ({ ...s, friend: true, requestReceived: false }));
      toast("Friend request accepted!");
    } catch (e) {
      console.log(e);
    }
  };

  const handleDecline = async () => {
    updateOptimistic("decline");
    try {
      await rejectFriendRequest(userId);
      setUserState((s) => ({ ...s, requestReceived: false }));
      toast("Friend request declined.");
    } catch (e) {
      console.log(e);
    }
  };

  const handleUnfriend = async () => {
    updateOptimistic("unfriend");
    try {
      await unfriendAction(userId);
      setUserState((s) => ({ ...s, friend: false }));
      toast("Unfriended.");
    } catch (e) {
      console.log(e);
    }
  };

  const handleBlock = async () => {
    updateOptimistic("block");
    try {
      await blockAction(userId);
      setUserState((s) => ({ ...s, blocked: !s.blocked, friend: false, requestSent: false, requestReceived: false }));
      toast(optimisticState.blocked ? "User unblocked." : "User blocked.");
    } catch (e) {
      console.log(e);
    }
  };

  if (owner) return null;

  return (
    <div className="flex flex-col gap-1 mt-1">
      {optimisticState.friend ? (
        <div className="flex gap-2">
          <Button className="flex-1 h-8 bg-[#FF4E01] text-white hover:bg-white hover:text-[#ff4e02] pointer-events-none">
            Friends
          </Button>
          <form action={handleUnfriend}>
            <Button className="h-8 bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
              Unfriend
            </Button>
          </form>
        </div>
      ) : optimisticState.requestReceived ? (
        <div className="flex gap-2">
          <form action={handleAccept}>
            <Button className="flex-1 h-8 bg-[#FF4E01] text-white hover:bg-white hover:text-[#ff4e02]">
              Accept
            </Button>
          </form>
          <form action={handleDecline}>
            <Button className="h-8 bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-100">
              Decline
            </Button>
          </form>
        </div>
      ) : (
        <form action={handleAddOrCancel}>
          <Button className="w-full h-8 bg-[#FF4E01] text-white hover:bg-white hover:text-[#ff4e02]">
            {optimisticState.requestSent ? "Request Sent" : "Add Friend"}
          </Button>
        </form>
      )}

      <form action={handleBlock}>
        <Button className="w-full bg-transparent h-8 hover:bg-transparent hover:cursor-pointer text-rose-600">
          {optimisticState.blocked ? "Unblock" : "Block"}
        </Button>
      </form>
    </div>
  );
};

export default UserDetailAction;
