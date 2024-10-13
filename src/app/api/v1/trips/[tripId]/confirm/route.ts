import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { confirmTrip } from "./confirm-trip";

const getTripSchema = z.string().uuid();

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;
    console.log(params.tripId);
    getTripSchema.parse(tripId);

    const result = await confirmTrip(tripId);
    console.log(result?.confirmed);

    if (result?.confirmed) {
      return NextResponse.redirect(
        `${process.env.APPLICATION_BASE_URL}/trip-details/${tripId}`
      );
    } else {
      return NextResponse.json(
        { error: "Trip not confirmed" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
