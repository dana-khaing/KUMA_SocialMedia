"use client";

import { useCallback, useState } from "react";
import Addpost from "./addpost";
import Newfeed from "./newfeed";

export default function HomeFeedClient({ user, posts, owner }) {
  const [postList, setPostList] = useState(posts || []);

  const handleOptimisticPost = useCallback((tempPost) => {
    setPostList((currentPosts) => [tempPost, ...currentPosts]);
  }, []);

  const handlePostConfirmed = useCallback((tempId, realPost) => {
    setPostList((currentPosts) => {
      const withoutDuplicate = currentPosts.filter(
        (post) => post.id !== realPost.id
      );

      return withoutDuplicate.map((post) =>
        post.id === tempId ? realPost : post
      );
    });
  }, []);

  const handlePostFailed = useCallback((tempId) => {
    setPostList((currentPosts) =>
      currentPosts.filter((post) => post.id !== tempId)
    );
  }, []);

  return (
    <>
      <Addpost
        user={user}
        onOptimisticPost={handleOptimisticPost}
        onPostConfirmed={handlePostConfirmed}
        onPostFailed={handlePostFailed}
      />
      <Newfeed user={user} posts={postList} owner={owner} />
    </>
  );
}
