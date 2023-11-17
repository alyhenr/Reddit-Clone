"use client";

import React, { useState } from "react";
import useCustomToast from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { Button } from "./ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CommentVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type CommentVotesProps = {
  commentId: string;
  initialVotesAmt: number;
  initialVote?: VoteType | null;
};

const CommentVotes = ({
  initialVote,
  initialVotesAmt,
  commentId,
}: CommentVotesProps) => {
  const { loginToast } = useCustomToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState<VoteType | null>(
    initialVote ?? null
  );
  const prevVote = usePrevious<VoteType | null>(currentVote);

  const { mutate: registerVote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
    },
    onError(err, voteType: VoteType) {
      setVotesAmt((prev) => prev + (voteType === "UP" ? 1 : -1));

      setCurrentVote(prevVote ?? null);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
      }

      return toast({
        title: "Somethin went wrong...",
        description: "Your vote was not registered.",
        variant: "destructive",
      });
    },
    onMutate: (voteType: VoteType) => {
      if (currentVote === voteType) {
        setCurrentVote(null);
        setVotesAmt((prev) => prev + (voteType === "UP" ? -1 : 1));
      } else {
        if (currentVote === null) {
          setVotesAmt((prev) => prev + (voteType === "UP" ? 1 : -1));
        } else {
          setVotesAmt((prev) => prev + (voteType === "UP" ? 2 : -2));
        }

        setCurrentVote(voteType);
      }
    },
  });

  return (
    <div className="flex gap-1 mt-2">
      <Button
        onClick={() => registerVote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>

      <Button
        onClick={() => registerVote("DOWN")}
        size="sm"
        variant="ghost"
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVotes;
