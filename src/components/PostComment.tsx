"use client";

import React, { useState } from "react";
import UserAvatar from "./UserAvatar";
import { Comment, CommentVote, User, VoteType } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

type PostCommentProps = {
  comment: ExtendedComment;
  currentVote: VoteType | null;
  votesAmt: number;
};

const PostComment = ({ comment, currentVote, votesAmt }: PostCommentProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const { mutate: reply, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      setIsReplying(false);
      setInput("");
      router.refresh();
    },
    onError: () => {
      toast({
        title: "Something went wrong...",
        description: "Your comment was not published",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name ?? null,
            image: comment.author.image ?? null,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            {`u/${comment.author.username}`}
          </p>
          <p className="max-h-40 truncate text-sx text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVote={currentVote}
          initialVotesAmt={votesAmt}
        />

        <Button
          onClick={() => {
            if (!session) router.push("/sign-in");

            setIsReplying(true);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                onChange={(ev) => setInput(ev.target.value)}
                value={input}
                rows={1}
                placeholder="What are your thoghts?"
              />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button
                tabIndex={-1}
                variant="subtle"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button
                isLoading={isLoading}
                disabled={input.length === 0}
                onClick={() => {
                  if (!session) router.push("/sign-in");
                  reply({
                    postId: comment.postId,
                    text: input,
                    replyToId: comment.replyToId ?? comment.id,
                  });
                }}
              >
                Post
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
