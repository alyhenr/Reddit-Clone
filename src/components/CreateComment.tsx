"use client";

import React, { useState } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import useCustomToast from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type CreateCommentProps = {
  postId: string;
  replyToId?: string;
};

const CreateComment = ({ postId, replyToId }: CreateCommentProps) => {
  const [input, setInput] = useState<string>("");

  const { loginToast } = useCustomToast();

  const router = useRouter();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        switch (err.response?.status) {
          case 401:
            return loginToast();
          case 422:
            return toast({
              title: "Invalid comment content",
              description: "Subscripiton data invalid.",
              variant: "destructive",
            });
          default:
            return toast({
              title: "Something went wrong.",
              description: "Please try again in a few seconds.",
              variant: "destructive",
            });
        }
      }
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
    },
  });

  return (
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

      <div className="mt-2 flex justify-end">
        <Button
          isLoading={isLoading}
          disabled={input.length === 0}
          onClick={() => comment({ postId, text: input, replyToId })}
        >
          Post
        </Button>
      </div>
    </div>
  );
};

export default CreateComment;
