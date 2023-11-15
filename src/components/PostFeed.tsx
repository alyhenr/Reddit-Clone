"use client";

import React, { useRef } from "react";

import { ExtendedPost } from "@/types/db";

import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCOLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { Vote, VoteType } from "@prisma/client";
import { useSession } from "next-auth/react";
import Post from "./Post";

type PostFeedProps = {
  initialPosts: ExtendedPost[];
  subredditName?: string;
};

const PostFeed = ({ initialPosts, subredditName }: PostFeedProps) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCOLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;
  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post: ExtendedPost, idx) => {
        let userVote: VoteType | null = null;
        const votes = post.votes.reduce((acc: number, vote: Vote) => {
          if (vote.userId === session?.user.id) userVote = vote.type;

          if (vote.type === "UP") return acc + 1;
          else if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);

        if (idx === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                subredditName={post.subreddit.name}
                post={post}
                commentAmt={post.comments.length}
                currentVote={userVote}
                votesAmt={votes}
              />
            </li>
          );
        } else {
          return (
            <Post
              subredditName={post.subreddit.name}
              post={post}
              key={post.id}
              commentAmt={post.comments.length}
              currentVote={userVote}
              votesAmt={votes}
            />
          );
        }
      })}
    </ul>
  );
};

export default PostFeed;
