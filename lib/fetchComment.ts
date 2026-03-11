import type { NextApiRequest, NextApiResponse } from "next";
import type { Comment } from "../interfaces";
import redis from "./redis";
import clearUrl from "./clearUrl";

export default async function fetchComment(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const referer = req.headers.referer || "";
  const url = clearUrl(referer);

  if (!url) {
    return res.status(200).json([]);
  }

  if (!redis) {
    return res.status(500).json({ message: "Failed to connect to redis." });
  }

  try {
    // get data
    const rawComments = await redis.lrange(url, 0, -1);

    // string data to object
    const comments = rawComments.map((c) => {
      const comment: Comment = JSON.parse(c);
      if (comment.user) delete comment.user.email;
      return comment;
    });

    return res.status(200).json(comments);
  } catch (error: any) {
  console.error("🔥 ERROR DI SERVER:");
  console.error("Pesan:", error.message);
  console.error("Stack:", error.stack);
  
  return res.status(500).json({ 
    message: "Internal Server Error",
    detail: error.message // Ini akan muncul di tab Response browser kamu
  });
}
}
