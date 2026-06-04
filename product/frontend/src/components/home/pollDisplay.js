"use client";

import { useState } from "react";
import { castPollVote } from "@/lib/action";
import { useRouter } from "next/navigation";

const PollDisplay = ({ poll, currentUserId }) => {
  const [localPoll, setLocalPoll] = useState(poll);
  const [voting, setVoting] = useState(false);
  const router = useRouter();

  const totalVotes = localPoll.options.reduce(
    (sum, opt) => sum + opt.votes.length,
    0
  );

  const userVote = localPoll.votes?.find((v) => v.userId === currentUserId);
  const hasVoted = !!userVote;
  const votedOptionId = userVote?.pollOptionId;

  const handleVote = async (optionId) => {
    if (voting || hasVoted || localPoll.isOptimistic) return;
    setVoting(true);

    // Optimistic update
    const updatedOptions = localPoll.options.map((opt) => ({
      ...opt,
      votes:
        opt.id === optionId
          ? [...opt.votes, { userId: currentUserId }]
          : opt.votes,
    }));
    setLocalPoll({
      ...localPoll,
      options: updatedOptions,
      votes: [
        ...(localPoll.votes ?? []),
        { userId: currentUserId, pollOptionId: optionId },
      ],
    });

    try {
      const result = await castPollVote(localPoll.id, optionId, currentUserId);
      if (result.success && result.poll) {
        setLocalPoll(result.poll);
        router.refresh();
      }
    } catch {
      setLocalPoll(poll);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
      {localPoll.question && (
        <p className="px-4 pt-3 pb-1 text-sm font-semibold text-gray-800">
          {localPoll.question}
        </p>
      )}

      <div className="flex flex-col gap-2 px-4 py-3">
        {localPoll.options.map((option) => {
          const voteCount = option.votes.length;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isVoted = option.id === votedOptionId;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || voting || localPoll.isOptimistic}
              className={`relative w-full text-left rounded-xl overflow-hidden border transition-all
                ${isVoted ? "border-[#FF4E01]" : "border-gray-200"}
                ${!hasVoted && !localPoll.isOptimistic ? "hover:border-[#FF4E01]/60 cursor-pointer" : "cursor-default"}
              `}
            >
              {/* percentage fill */}
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isVoted ? "bg-orange-100" : "bg-gray-100"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between px-3 py-2.5">
                <span
                  className={`text-sm font-medium ${
                    isVoted ? "text-[#FF4E01]" : "text-gray-700"
                  }`}
                >
                  {option.text}
                </span>
                {hasVoted && (
                  <span
                    className={`text-xs font-semibold ${
                      isVoted ? "text-[#FF4E01]" : "text-gray-500"
                    }`}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="px-4 pb-3 text-xs text-gray-400">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        {localPoll.isOptimistic && " · preview"}
        {hasVoted && " · voted"}
      </p>
    </div>
  );
};

export default PollDisplay;
