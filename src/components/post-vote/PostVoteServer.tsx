import { getAuthSession } from "@/lib/auth";
import { Post, Vote, VoteType } from "@prisma/client";
import React from "react";
import PostVoteClient from "./PostVoteClient";

type PostVoteServerProps = {
  postId: string;
  initialVoteAmt?: number;
  initialVote?: VoteType | null;
  getData: () => Promise<(Post & { votes: Vote[] }) | null>;
};

const PostVoteServer = async ({
  postId,
  initialVoteAmt,
  initialVote,
  getData,
}: PostVoteServerProps) => {
  const session = await getAuthSession();

  let _votesAmt: number = 0;
  let _currentVote: VoteType | null = null;
  if (getData) {
    const posts = await getData();

    _votesAmt =
      posts?.votes.reduce((acc, curr) => {
        if (curr.userId === session?.user.id) _currentVote = curr.type;
        if (curr.type === "UP") return acc + 1;
        if (curr.type === "DOWN") return acc - 1;
        return acc;
      }, 0) ?? 0;
  } else {
    _votesAmt = initialVoteAmt ?? 0;
    _currentVote = initialVote ?? null;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVote={_currentVote}
      initialVotesAmt={_votesAmt}
    />
  );
};

export default PostVoteServer;
