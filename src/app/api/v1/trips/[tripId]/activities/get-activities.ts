import { prisma } from "@/lib/prisma";
import { differenceInDays, addDays, isSameDay } from "@/lib/date-fns";

export async function getActivities(tripId: string) {
  try {
    const trip = await prisma.trips.findUnique({
      where: { id: tripId },
      include: {
        activities: {
          orderBy: {
            occurs_at: "asc",
          },
        },
      },
    });

    if (!trip) {
      throw new Error(`Trip not found!`);
    }

    const differenceInDaysBetweenTripStartAndEnd = differenceInDays(
      trip?.ends_at,
      trip?.starts_at
    );

    const activities = Array.from({
      length: differenceInDaysBetweenTripStartAndEnd + 1,
    }).map((_, index) => {
      const date = addDays(trip?.starts_at, index);

      return {
        date,
        activities: trip?.activities.filter((activity) => {
          return isSameDay(activity.occurs_at, date);
        }),
      };
    });

    return { activities };
  } catch (error) {
    throw new Error("Failed to fetch activities");
  }
}
