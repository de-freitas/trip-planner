import { prisma } from "@/lib/prisma";

export async function getTripDetails(tripId: string) {
  const trip = await prisma.trips.findUnique({
    where: { id: tripId },
  });

  if (!trip) {
    throw new Error(`Trip not found!`);
  }

  return { trip };
}
