import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { nodemailer, getMailClient } from "@/lib/mail";

import { capitalizeMonthsFull } from "@/utils/formatMonthsToCapitalize";

interface createTripProps {
  destination: string;
  starts_at: Date;
  ends_at: Date;
  owner_name: string;
  owner_email: string;
  emails_to_invite: string[];
}
export async function createTrip({
  destination,
  starts_at,
  ends_at,
  owner_name,
  owner_email,
  emails_to_invite,
}: createTripProps) {
  const trip = await prisma.trips.create({
    data: {
      destination,
      starts_at,
      ends_at,
      participants: {
        createMany: {
          data: [
            {
              email: owner_email,
              name: owner_name,
              is_owner: true,
              is_confirmed: true,
            },
            ...emails_to_invite.map((email) => {
              return { email };
            }),
          ],
        },
      },
    },
  });

  const formattedStartDateToBR = format(starts_at, "PPP", { locale: ptBR });
  const formattedEndDateToBR = format(ends_at, "PPP", { locale: ptBR });

  const formattedStartDate = capitalizeMonthsFull(formattedStartDateToBR);
  const formattedEndDate = capitalizeMonthsFull(formattedEndDateToBR);

  const confirmationLink = `${process.env.API_BASE_URL}/trips/${trip.id}/confirm`;

  const mail = await getMailClient();
  const message = await mail.sendMail({
    from: {
      name: "Equipe Plann.er",
      address: "oi@planner.com.br",
    },
    to: {
      name: owner_name,
      address: owner_email,
    },
    subject: `Confirme sua viagem para ${destination}`,
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
                <p>
                  Você solicitou a criação de uma viagem para <strong>${destination}</strong>, nas datas de
                  <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.
                </p>
                <p></p>
                <p>Para confirmar sua viagem, clique no link abaixo:</p>
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
  return { tripId: trip.id };
}
