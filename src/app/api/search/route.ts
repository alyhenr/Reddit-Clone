import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const community = url.searchParams.get("q");

  if (!community)
    return new Response("Invalid community name", { status: 400 });

  const results = await db.subreddit.findMany({
    where: {
      name: {
        startsWith: community,
      },
    },
    include: {
      _count: true,
    },
    take: 5,
  });
  return new Response(JSON.stringify(results), { status: 200 });
}
