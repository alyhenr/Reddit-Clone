import { VoteType } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  currentVote: VoteType | null;
  createdAt: Date;
};
