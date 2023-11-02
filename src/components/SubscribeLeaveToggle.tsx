"use client";

import React, { startTransition } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { SubredditSubscriptionPayload } from "@/lib/validators/subreddit";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import useCustomToast from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

const SubscribeLeaveToggle = ({
  subredditId,
  subredditName,
  isSubscribed,
}: {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
}) => {
  const { loginToast } = useCustomToast();

  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubredditSubscriptionPayload = {
        subredditId: subredditId,
      };

      const { data } = await axios.post("/api/subreddit/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        switch (err.response?.status) {
          case 401:
            return loginToast();
          case 403:
            return toast({
              title: "Cannot subscribe again",
              description: "You are already subscribed to this subreddit.",
              variant: "destructive",
            });
          case 422:
            return toast({
              title: "Invalid subreddit",
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
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Success!",
        description: `You're now subscribed to ${subredditName}.`,
        variant: "default",
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubredditSubscriptionPayload = {
        subredditId: subredditId,
      };
      const { data } = await axios.post(`/api/subreddit/unsubscribe`, payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        switch (err.response?.status) {
          case 401:
            return loginToast();
          case 403:
            return toast({
              title: "Cannot unsubscribe.",
              description: err.response.data,
              variant: "destructive",
            });
          case 422:
            return toast({
              title: "Invalid subreddit",
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
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Success!",
        description: `You're now unsubscribed from ${subredditName}.`,
        variant: "default",
      });
    },
  });

  return (
    <Button
      className="w-full mt-1 mb-4"
      onClick={() => (!isSubscribed ? subscribe() : unsubscribe())}
      isLoading={isSubLoading || isUnsubLoading}
    >
      {isSubscribed ? "Leave community" : "Join to post"}
    </Button>
  );
};

export default SubscribeLeaveToggle;
