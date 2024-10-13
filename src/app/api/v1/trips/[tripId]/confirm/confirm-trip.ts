import { getMailClient, nodemailer } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { capitalizeMonthsFull } from "@/utils/formatMonthsToCapitalize";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type confirmTripResult = {
  confirmed: boolean;
};

export async function confirmTrip(
  tripId: string
): Promise<confirmTripResult | undefined> {
  const trip = await prisma.trips.findUnique({
    where: { id: tripId },
    include: {
      participants: {
        where: { is_owner: false },
      },
    },
  });

  const tripOwner = await prisma.participants.findFirst({
    select: { name: true },
    where: {
      trip_id: tripId,
      is_owner: true,
    },
  });

  if (!trip) return;

  if (trip.is_confirmed) {
    return {
      confirmed: true,
    };
  }

  await prisma.trips.update({
    where: { id: tripId },
    data: { is_confirmed: true },
  });

  const formattedStartDateToBR = format(
    trip.starts_at,
    "d ' de ' MMMM ' de '  yyyy",
    { locale: ptBR }
  );
  const formattedEndDateToBR = format(
    trip.ends_at,
    "d ' de ' MMMM ' de '  yyyy",
    { locale: ptBR }
  );

  const formattedStartDate = capitalizeMonthsFull(formattedStartDateToBR);
  const formattedEndDate = capitalizeMonthsFull(formattedEndDateToBR);

  const mail = await getMailClient();

  await Promise.all([
    trip.participants.map(async (participant) => {
      const confirmationLink = `${process.env.API_BASE_URL}/trips/${tripId}/participants/${participant.id}/confirm`;

      const message = await mail.sendMail({
        from: {
          name: "Equipe Plann.er",
          address: "oi@planner.com.br",
        },
        to: participant.email,
        subject: `Confirme sua viagem para ${trip.destination}`,
        html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
                    <p>
                      Você foi convidado(a) por <strong>${tripOwner?.name}</strong> para participar de uma viagem para <strong>${trip.destination}</strong>, nas datas de
                      <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.
                    </p>
                    <p></p>
                    <p>Para confirmar sua presença, clique no link abaixo:</p>
                    <p></p>
                    <p>
                      <a href=${confirmationLink}>Confirmar viagem</a>
                    </p>
    
                    <p></p>
                    <p>Caso você não saiba do que se trata esse e-mail, apenas ignore.</p>
                  </div>
                  `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));
    }),
  ]);

  return {
    confirmed: true,
  };
}
