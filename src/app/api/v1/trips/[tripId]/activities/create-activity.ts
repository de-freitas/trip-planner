import { prisma } from "@/lib/prisma";
import { z } from "zod";

const occursAtSchema = z.coerce.date();

export async function createActivity(
  tripId: string,
  title: string,
  occurs_at: Date
) {
  try {
    occurs_at = new Date(occurs_at);
    const activity = await prisma.activities.create({
      data: {
        title,
        occurs_at,
        trip_id: tripId,
      },
    });

    return { activityId: activity.id };
  } catch (error) {
    console.error("Error creating activity:", error); // Isso ajuda a ver o erro real no console
    throw new Error("Error creating activity");
  }
}
