import { Webhook } from "svix";
import { headers } from "next/headers";

import prisma from "@/lib/client";
import { notifyUserCreated } from "@/lib/action";

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return new Response("Missing SIGNING_SECRET", { status: 500 });
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  if (eventType === "user.created") {
    try {
      const username =
        data.username ||
        data.email_addresses?.[0]?.email_address?.split("@")[0] ||
        data.first_name ||
        `user_${data.id.slice(-6)}`;

      await prisma.user.create({
        data: {
          id: data.id,
          username,
          avatar:
            data.image_url || data.profile_image_url || "/user-default.png",
          name: data.first_name || "Kuma",
          surname: data.last_name || "",
          cover: "/cover-default.jpg",
          bio: "Hello, I'm new here! Kuma!",
        },
      });

      await notifyUserCreated(data.id);

      return new Response("User has been created!", { status: 200 });
    } catch (err) {
      console.error("Failed to create user:", err);
      return new Response("Failed to create user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    try {
      const username =
        data.username ||
        data.email_addresses?.[0]?.email_address?.split("@")[0] ||
        data.first_name ||
        `user_${data.id.slice(-6)}`;

      await prisma.user.update({
        where: {
          id: data.id,
        },
        data: {
          username,
          avatar:
            data.image_url || data.profile_image_url || "/user-default.png",
          name: data.first_name || "Kuma",
          surname: data.last_name || "",
        },
      });

      return new Response("User has been updated!", { status: 200 });
    } catch (err) {
      console.error("Failed to update user:", err);
      return new Response("Failed to update user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    try {
      await prisma.user.delete({
        where: {
          id: data.id,
        },
      });

      return new Response("User has been deleted!", { status: 200 });
    } catch (err) {
      console.error("Failed to delete user:", err);
      return new Response("Failed to delete user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
