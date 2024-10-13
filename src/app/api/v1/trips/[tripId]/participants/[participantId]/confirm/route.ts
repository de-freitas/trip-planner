import { NextRequest, NextResponse } from "next/server";
import { confirmParticipant } from "./confirm-participant";

export async function GET(
  request: NextRequest,
  { params }: { params: { participantId: string; tripId: string } }
) {
  try {
    const participantId = params.participantId;
    const tripId = params.tripId;

    if (!participantId)
      return NextResponse.json(
        { message: `Missing participantId!` },
        { status: 404 }
      );

    if (!tripId)
      return NextResponse.json({ message: `Missing tripId!` }, { status: 404 });

    const result = await confirmParticipant(tripId, participantId);

    if (result?.confirmed) {
      return NextResponse.redirect(
        `${process.env.APPLICATION_BASE_URL}/trip-details/${tripId}`
      );
    } else {
      return NextResponse.json(
        { message: `${result?.message}` },
        { status: 400 }
      );
    }
  } catch (error) {
    NextResponse.json({ message: `${error}` }, { status: 400 });
  }
}
