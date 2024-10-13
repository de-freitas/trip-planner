import { prisma } from "@/lib/prisma";

interface confirmParticipantResult {
  confirmed: boolean;
  message?: String;
}

export async function confirmParticipant(
  tripId: string,
  participantId: string
): Promise<confirmParticipantResult | undefined> {
  const participant = await prisma.participants.findUnique({
    where: {
      id: participantId,
      trip_id: tripId,
    },
  });

  if (!participant?.id || !participant?.trip_id) {
    return {
      confirmed: false,
      message: `Participant or Trip not found!`,
    };
  }

  if (participant.is_confirmed) return { confirmed: true };

  await prisma.participants.update({
    where: {
      id: participantId,
      trip_id: tripId,
    },
    data: {
      is_confirmed: true,
    },
  });

  return { confirmed: true };
}
