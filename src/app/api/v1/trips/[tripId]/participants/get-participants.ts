import { prisma } from "@/lib/prisma";

export async function getParticipants(tripId: string) {
  const participants = await prisma.participants.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      is_confirmed: true,
    },
    where: { trip_id: tripId },
  });

  return participants;
}
