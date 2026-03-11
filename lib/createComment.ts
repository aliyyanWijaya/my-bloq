import type { NextApiRequest, NextApiResponse } from "next";
import type { Comment } from "../interfaces";
import redis from "./redis";
import { nanoid } from "nanoid";
import getUser from "./getUser";
import clearUrl from "./clearUrl";

export default async function createComments(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const url = clearUrl(req.headers.referer);
  const { text } = req.body;
  const { authorization } = req.headers;

  if (!text || !authorization) {
    return res.status(400).json({ message: "Missing parameter." });
  }

  if (!redis) {
    return res
      .status(400)
      .json({ message: "Failed to connect to redis client." });
  }

  try {
    // verify user token
    const user = await getUser(authorization);
    if (!user) return res.status(400).json({ message: "Need authorization." });

    const { name, picture, sub, email } = user;

    console.log("LOG: Mencoba menulis ke URL Redis:", url);

    if (!url) {
       return res.status(400).json({ message: "Referer URL is missing." });
    }

    const comment: Comment = {
      id: nanoid(),
      created_at: Date.now(),
      url,
      text,
      user: { name, picture, sub, email },
    };

    // write data
    await redis.lpush(url, JSON.stringify(comment));

    return res.status(200).json(comment);
  } catch (err: any) {
    console.error("❌ ERROR DETAIL:", err.message);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}
