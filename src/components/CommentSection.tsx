import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { VoteType } from "@prisma/client";
import React from "react";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

type CommentSectionProps = {
  postId: string;
};

const CommentSection = async ({ postId }: CommentSectionProps) => {
  const session = await getAuthSession();
  const comments = await db.comment.findMany({
    where: { postId, replyToId: null },
    include: {
      author: true,
      votes: true,
      replies: {
        include: { author: true, votes: true },
      },
    },
  });
  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} />

      <div>
        {comments.map((comment) => {
          let userVote: VoteType | null = null;
          const votesAmt = comment.votes.reduce((acc, curr) => {
            if (curr.userId === session?.user.id) userVote = curr.type;
            if (curr.type === "UP") return acc + 1;
            if (curr.type === "DOWN") return acc - 1;
            return acc;
          }, 0);

          return (
            <div key={comment.id} className="flex flex-col">
              <div className="mb-2">
                <PostComment
                  comment={comment}
                  currentVote={userVote}
                  votesAmt={votesAmt}
                />

                {comment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    let userVote: VoteType | null = null;
                    const votesAmt = reply.votes.reduce((acc, curr) => {
                      if (curr.userId === session?.user.id)
                        userVote = curr.type;
                      if (curr.type === "UP") return acc + 1;
                      if (curr.type === "DOWN") return acc - 1;
                      return acc;
                    }, 0);

                    return (
                      <div
                        key={reply.id}
                        className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                      >
                        <PostComment
                          comment={reply}
                          currentVote={userVote}
                          votesAmt={votesAmt}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentSection;
