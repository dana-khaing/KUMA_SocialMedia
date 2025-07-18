import { Webhook } from "svix";
import { headers } from "next/headers";

import prisma from "@/lib/client";
import { notifyUserCreated } from "@/lib/action";

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;
  //console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  // console.log("Webhook payload:", body);
  if (eventType === "user.created") {
    try {
      await prisma.user.create({
        data: {
          id: evt.data.id,
          username: evt.data.username,
          avatar: evt.data.image_url || "/user-default.png",
          name: evt.data.first_name,
          surname: evt.data.last_name,
          cover: "/cover-default.jpg",
          bio: "Hello, I'm new here! Kuma!",
        },
      });
      await notifyUserCreated(evt.data.id);
      return new Response("User has been created!.", { status: 200 });
    } catch (err) {
      console.log(err);
      return new console.error("Failed to create user!", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    try {
      await prisma.user.update({
        where: {
          id: evt.data.id,
        },
        data: {
          name: JSON.parse(body).data.first_name,
          surname: JSON.parse(body).data.last_name,
          username: JSON.parse(body).data.username,
          avatar: JSON.parse(body).data.image_url || "/user-default.png",
        },
      });

      return new Response("User has been updated!.", { status: 200 });
    } catch (err) {
      console.error("Failed to update user!", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    try {
      await prisma.user.delete({
        where: {
          id: evt.data.id,
        },
      });
      return new Response("User has been deleted!.", { status: 200 });
    } catch (err) {
      console.error("Failed to delete user!", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
