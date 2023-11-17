import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuthSession();

    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: { author: true, votes: true },
    });

    if (!comment) return new Response("Comment not found", { status: 404 });

    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const existingVote = await db.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
        });
      } else {
        await db.commentVote.update({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
          data: {
            type: voteType,
          },
        });
      }
    } else {
      await db.commentVote.create({
        data: { commentId, userId: session.user.id, type: voteType },
      });
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
