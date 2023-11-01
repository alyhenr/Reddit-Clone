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

    if (!!subscription)
      return new Response("Alreadu subscribed to subreddit", {
        status: 403,
      });

    await db.subscription.create({
      data: { subredditId, userId: session.user.id },
    });

    return new Response(subredditId, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid data", { status: 422 });
    }

    return new Response(
      "Could not subscribe to subredditcreate subreddit, internal server error",
      {
        status: 500,
      }
    );
  }
}
