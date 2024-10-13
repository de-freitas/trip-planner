import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTripDetails } from "./get-trip-details";

const getTripSchema = z.string().uuid();

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const pathname = request.nextUrl.pathname;
    const tripId = getTripSchema.parse(pathname.split("/api/v1/trips/")[1]);
    const { trip } = await getTripDetails(tripId);

    return NextResponse.json(
      { trip },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
