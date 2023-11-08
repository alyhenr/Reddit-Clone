import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();

    const { subredditId, title, content } = PostValidator.parse(body);
    const subscription = await db.subscription.findFirst({
      where: { subredditId, userId: session.user.id },
    });

    if (!subscription)
      return new Response(
        "You need to be subscribed to subreddit to post in it",
        {
          status: 403,
        }
      );

    const post = await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subredditId,
      },
    });

    return new Response(post.id, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid data", { status: 422 });
    }

    return new Response("Could not publish your post, internal server error", {
      status: 500,
    });
  }
}
