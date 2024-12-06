"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { useState, useOptimistic } from "react";
import { acceptFollowRequest, rejectFollowRequest } from "@/lib/action";
import Link from "next/link";

export const FriendRequestList = ({ request }) => {
  const [requestState, setRequestState] = useState(request);

  //   accept request
  const acceptRequest = async (requestId, userId) => {
    removeOptimisticRequest(requestId);
    try {
      await acceptFollowRequest(userId);
      setRequestState((state) => state.filter((item) => item.id !== requestId));
    } catch (error) {
      console.log(error);
    }
  };

  //   remove request
  const declineRequest = async (requestId, userId) => {
    removeOptimisticRequest(requestId);
    try {
      await rejectFollowRequest(userId);
      setRequestState((state) => state.filter((item) => item.id !== requestId));
    } catch (error) {
      console.log(error);
    }
  };

  const [optimisticRequest, removeOptimisticRequest] = useOptimistic(
    requestState,
    (state, value) => state.filter((item) => item.id !== value)
  );
  return (
    <>
      {optimisticRequest.map((request) => (
        <div
          key={request}
          className="flex items-center hover:bg-slate-200 p-2 rounded-xl "
        >
          {" "}
          <Link
            href={`/profile/${request.sender.id}`}
            key={request}
            className="flex"
          >
            <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
              <img
                src={request.sender.avatar || "/user-default.png"}
                alt="profile"
                className="w-9 h-9 rounded-full ring-1 ring-[#FF4E01]"
              />
            </div>
            <div className="flex flex-col flex-grow cursor-pointer">
              <span className="text-black text-sm line-clamp-1">
                {request.sender?.name && request.sender?.surname
                  ? request.sender.name + " " + request.sender.surname
                  : "Kuma User"}
              </span>
              <span className="text-gray-500 text-xs line-clamp-1">
                0 mutual friends
              </span>
            </div>
          </Link>
          <div className="flex items-center flex-grow justify-end gap-2 h-full">
            {/* accept button */}
            <form action={() => acceptRequest(request.id, request.sender.id)}>
              <button className=" w-[2.15rem] h-[2.15rem] text-white items-center flex justify-center bg-[#FF4E01] rounded-full">
                <FontAwesomeIcon
                  icon={faUserCheck}
                  size="sm"
                  className="flex justify-center items-center"
                />
              </button>
            </form>
            {/* reject button */}
            <form action={() => declineRequest(request.id, request.sender.id)}>
              <button className="text-black bg-transparent  rounded-full p-1">
                <FontAwesomeIcon icon={faXmark} size="sm" />
              </button>
            </form>
          </div>
        </div>
      ))}
    </>
  );
};
export default FriendRequestList;
