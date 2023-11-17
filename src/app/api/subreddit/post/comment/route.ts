import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    await db.comment.create({
      data: { postId, text, authorId: session?.user.id, replyToId },
    });

    return new Response("Created", { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 422 });
    }

    return new Response("Could not register comment, internal server error", {
      status: 500,
    });
  }
}
