/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Addpost from "@/components/home/addpost";
import Newfeed from "@/components/home/newfeed";
import { createPost } from "@/lib/action";

const mockPrefetch = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    prefetch: mockPrefetch,
    refresh: mockRefresh,
  }),
}));

jest.mock("next-cloudinary", () => ({
  CldUploadWidget: ({ children }) =>
    children({ open: jest.fn(), isLoading: false }),
}));

jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

jest.mock("@fortawesome/free-solid-svg-icons", () => ({
  faCamera: {},
  faClock: {},
  faImage: {},
  faT: {},
  faVideo: {},
  faXmark: {},
}));

jest.mock("@/components/ui/resizable", () => ({
  ResizableHandle: ({ children }) => <div>{children}</div>,
  ResizablePanel: ({ children }) => <div>{children}</div>,
  ResizablePanelGroup: ({ children }) => <div>{children}</div>,
}));

jest.mock("@/lib/action", () => ({
  createPost: jest.fn(),
  deletePost: jest.fn(),
}));

jest.mock("@/components/home/reactionBar", () => function ReactionBarMock() {
  return <div>Reaction bar</div>;
});

jest.mock("@/components/home/postPopup", () => function PostPopupMock() {
  return <div>Post popup</div>;
});

const user = {
  id: "user-1",
  name: "Dana",
  surname: "Khaing",
  username: "dana",
  avatar: "/avatar.png",
};

const realPost = {
  id: 10,
  desc: "Confirmed post",
  createdAt: "2026-05-31T10:00:00.000Z",
  user,
  images: [],
  likes: [],
  loves: [],
  comments: [],
  _count: { likes: 0, loves: 0, comments: 0 },
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe("optimistic posting and post preloading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a temporary post before createPost resolves and confirms it", async () => {
    const postRequest = deferred();
    const onOptimisticPost = jest.fn();
    const onPostConfirmed = jest.fn();
    const onPostFailed = jest.fn();
    createPost.mockReturnValue(postRequest.promise);

    render(
      <Addpost
        user={user}
        onOptimisticPost={onOptimisticPost}
        onPostConfirmed={onPostConfirmed}
        onPostFailed={onPostFailed}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("What's on your mind, Kuma?"), {
      target: { value: "Hello optimistic Kuma" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    expect(onOptimisticPost).toHaveBeenCalledWith(
      expect.objectContaining({
        desc: "Hello optimistic Kuma",
        isOptimistic: true,
        user: expect.objectContaining({ id: "user-1" }),
      })
    );
    expect(onPostConfirmed).not.toHaveBeenCalled();

    const tempId = onOptimisticPost.mock.calls[0][0].id;
    postRequest.resolve({ success: true, post: realPost });

    await waitFor(() => {
      expect(onPostConfirmed).toHaveBeenCalledWith(tempId, realPost);
      expect(mockRefresh).toHaveBeenCalled();
    });
    expect(onPostFailed).not.toHaveBeenCalled();
  });

  it("removes the temporary post when createPost fails", async () => {
    const postRequest = deferred();
    const onOptimisticPost = jest.fn();
    const onPostFailed = jest.fn();
    createPost.mockReturnValue(postRequest.promise);

    render(
      <Addpost
        user={user}
        onOptimisticPost={onOptimisticPost}
        onPostFailed={onPostFailed}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("What's on your mind, Kuma?"), {
      target: { value: "This will fail" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    const tempId = onOptimisticPost.mock.calls[0][0].id;
    postRequest.reject(new Error("DB down"));

    await waitFor(() => {
      expect(onPostFailed).toHaveBeenCalledWith(tempId);
    });
  });

  it("renders optimistic posts safely and prefetches only real posts", async () => {
    render(
      <Newfeed
        user={user}
        owner="user-1"
        posts={[
          {
            ...realPost,
            id: "temp-post-1",
            desc: "Temporary post",
            isOptimistic: true,
          },
          realPost,
        ]}
      />
    );

    expect(screen.getByText("Temporary post")).toBeInTheDocument();
    expect(screen.getByText("Posting...")).toBeInTheDocument();
    expect(
      screen.getByText(/Reactions and comments will be available/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockPrefetch).toHaveBeenCalledWith("/post/10");
    });
    expect(mockPrefetch).not.toHaveBeenCalledWith("/post/temp-post-1");
  });
});
