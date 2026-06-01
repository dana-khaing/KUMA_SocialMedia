import { Webhook } from "svix";
import { headers } from "next/headers";

import prisma from "@/lib/client";
import { notifyUserCreated } from "@/lib/action";

function getUsername(data) {
  return (
    data.username ||
    data.email_addresses?.[0]?.email_address?.split("@")[0] ||
    data.first_name ||
    `user_${data.id.slice(-6)}`
  );
}

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
      await prisma.user.upsert({
        where: { id: data.id },
        update: {
          username: getUsername(data),
          avatar:
            data.image_url || data.profile_image_url || "/user-default.png",
          name: data.first_name || "Kuma",
          surname: data.last_name || "",
        },
        create: {
          id: data.id,
          username: getUsername(data),
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
      console.error("CREATE ERROR:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
      });
    }
  }

  if (eventType === "user.updated") {
    try {
      await prisma.user.upsert({
        where: { id: data.id },
        update: {
          username: getUsername(data),
          avatar:
            data.image_url || data.profile_image_url || "/user-default.png",
          name: data.first_name || "Kuma",
          surname: data.last_name || "",
        },
        create: {
          id: data.id,
          username: getUsername(data),
          avatar:
            data.image_url || data.profile_image_url || "/user-default.png",
          name: data.first_name || "Kuma",
          surname: data.last_name || "",
          cover: "/cover-default.jpg",
          bio: "Hello, I'm new here! Kuma!",
        },
      });

      return new Response("User has been updated!", { status: 200 });
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: data.id },
      });

      if (!existingUser) {
        return new Response("User already deleted", { status: 200 });
      }

      await prisma.user.delete({
        where: { id: data.id },
      });

      return new Response("User has been deleted!", { status: 200 });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
      });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
