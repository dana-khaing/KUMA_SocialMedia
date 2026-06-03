/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import ReactionBar from "@/components/home/reactionBar";

jest.mock("@/lib/action", () => ({
  loadComments: jest.fn(),
  switchReaction: jest.fn(),
}));

jest.mock("@/components/home/commentBox", () => function CommentBoxMock() {
  return <div>Comment box</div>;
});

describe("ReactionBar", () => {
  it("renders when a post has no likes or loves arrays yet", () => {
    render(
      <ReactionBar
        post={{
          id: 1,
          _count: { likes: 0, loves: 0, comments: 0 },
          comments: [],
        }}
        user={{ id: "user-1" }}
        owner="user-1"
      />
    );

    expect(screen.getByText("Like")).toBeInTheDocument();
    expect(screen.getByText("Love")).toBeInTheDocument();
  });
});
