import React from "react";
import { db } from "@/lib/db";
import { INFINITE_SCOLLING_PAGINATION_RESULTS } from "@/config";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
  const session = await getAuthSession();

  const subscriptions = (
    await db.subscription.findMany({
      where: { userId: session?.user.id },
    })
  ).map((subscription) => subscription.subredditId);

  const posts = await db.post.findMany({
    where: {
      subredditId: { in: subscriptions },
    },
    orderBy: { createdAt: "desc" },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCOLLING_PAGINATION_RESULTS,
  });

  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
