import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();

    const { subredditId } = SubredditSubscriptionValidator.parse(body);
    const subscription = await db.subscription.findFirst({
      where: { subredditId, userId: session.user.id },
    });

    const subreddit = await db.subreddit.findFirst({
      where: {
        creatorId: session.user.id,
        id: subredditId,
      },
    });

    if (!!subreddit)
      return new Response(
        "You cannot unsubscribe from your own subreddit, try deleting it",
        { status: 403 }
      );

    if (!subscription)
      return new Response("You're not subscribed to this subreddit", {
        status: 403,
      });

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id,
        },
      },
    });

    return new Response(`Unsubscribed from subreddit id: ${subredditId}`, {
      status: 204,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid data", { status: 422 });
    }

    return new Response(
      "Could not unsubscribe to subreddit, internal server error",
      {
        status: 500,
      }
    );
  }
}
