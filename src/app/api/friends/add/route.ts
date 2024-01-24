import { fetchRedis } from "@/helper/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend-vali";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // const RESTResponse = await fetch(
    //   `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    //     },
    //     cache: "no-store",
    //   }
    // );

    // const data = (await RESTResponse.json()) as { result: string | null };

    // const idToAdd = data.result;

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as unknown as string;

    if (!idToAdd) {
      return new Response("This Person Does not exist!", { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response("You Cannot Add yourself as a friend", {
        status: 400,
      });
    }

    //if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_request`,
      session.user.id
    )) as unknown as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    //if user is already friend
    const isAlreadyFriend = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_request`,
      idToAdd
    )) as unknown as 0 | 1;

    if (isAlreadyFriend) {
      return new Response("Already friends with this user", { status: 400 });
    }

    // valid request, send fr (the user which is loged in will be putted in the incoming fr list of idTOAdd one person)
    db.sadd(`user:${idToAdd}:incoming_friend_request`, session.user.id);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request PlayLoad", { status: 422 });
    }
    return new Response("Invalid HAI", { status: 400 });
  }
}
