import { NextRequest, NextResponse } from "next/server";
import { getParticipants } from "./get-participants";

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  if (!params.tripId) {
    return NextResponse.json({ error: "tripId is required" }, { status: 400 });
  }
  try {
    const participants = await getParticipants(params.tripId);

    if (participants.length === 0) {
      return NextResponse.json(
        { message: "No participants found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ participants });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
