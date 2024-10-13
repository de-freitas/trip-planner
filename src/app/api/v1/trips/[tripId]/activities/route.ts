import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getActivities } from "./get-activities";
import { createActivity } from "./create-activity";
import { prisma } from "@/lib/prisma";
import { isBefore, isAfter } from "@/lib/date-fns";

const tripIdParamSchema = z.string().uuid();

const bodyActivitySchema = z.object({
  title: z.string().min(3),
  occurs_at: z.coerce.date(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    tripIdParamSchema.parse(params.tripId);

    const activities = await getActivities(params.tripId);

    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid tripId format!" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error fetching activities!" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    tripIdParamSchema.parse(params.tripId);

    const requestBody = await request.json();
    const { title, occurs_at } = requestBody;

    bodyActivitySchema.parse(requestBody);

    const trip = await prisma.trips.findUnique({
      where: {
        id: params.tripId,
      },
    });

    console.log(trip?.id);

    if (!trip) {
      return NextResponse.json({ message: `trip not found!` }, { status: 404 });
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { message: `a 'title' is required!` },
        { status: 400 }
      );
    }

    if (isBefore(occurs_at, trip.starts_at)) {
      return NextResponse.json(
        {
          message: `Invalid activity date! 'occurs_at' param is before 'starts_at' from the trip`,
        },
        { status: 400 }
      );
    }

    if (isAfter(occurs_at, trip.ends_at)) {
      return NextResponse.json(
        {
          message: `Invalid activity date! 'occurs_at' param is after 'ends_at' from the trip`,
        },
        { status: 400 }
      );
    }

    const activity = await createActivity(params.tripId, title, occurs_at);

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid tripId format!" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "weird" }, { status: 500 });
  }
}
