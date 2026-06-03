import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { authorizePusherChannel } from "@/lib/pusherServer";

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id");
  const channelName = formData.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const authorization = authorizePusherChannel({
    socketId,
    channelName,
    userId,
  });

  if (!authorization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(authorization);
}
