import { VOTES_STANDARD_CACHE } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuthSession();

    const post = await db.post.findUnique({
      where: { id: postId },
      include: { author: true, votes: true },
    });

    if (!post) return new Response("Post not found", { status: 404 });

    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const existingVote = await db.vote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId,
            },
          },
        });
      } else {
        await db.vote.update({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId,
            },
          },
          data: {
            type: voteType,
          },
        });
      }
    } else {
      await db.vote.create({
        data: { postId, userId: session.user.id, type: voteType },
      });
    }

    //Calculate votes amount (up -> +1, down -> -1) to check engagement, if it's above a to be defined parameter, it's worth to cache it
    const votesAmt = post.votes.reduce((acc, curr) => {
      if (curr.type === "UP") return acc + 1;
      if (curr.type === "DOWN") return acc - 1;
      return acc;
    }, 0);

    if (votesAmt >= VOTES_STANDARD_CACHE) {
      const cachePayload: CachedPost = {
        id: post.id,
        authorName: session.user.username ?? "",
        content: JSON.stringify(post.content),
        createdAt: post.createdAt,
        currentVote: voteType,
        title: post.title,
      };

      await redis.hset(`post:${postId}`, cachePayload);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid POST request data", { status: 422 });
    }

    return new Response(
      "Could not register your vote, Internal server error.",
      {
        status: 500,
      }
    );
  }
}
