import { NextResponse } from "next/server";
import { z } from "zod";
import { isAfter, isBefore, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { createTrip } from "./create-trip";

const createTripSchema = z.object({
  destination: z.string().min(3),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date(),
  owner_name: z.string(),
  owner_email: z.string().email(),
  emails_to_invite: z.array(z.string().email()),
});

export async function POST(request: Request, response: NextResponse) {
  try {
    const body = createTripSchema.parse(await request.json());

    if (
      isBefore(
        body.starts_at,
        format(new Date(), "yyyy-MM-dd", { locale: ptBR })
      )
    ) {
      NextResponse.json({ error: `Invalid trip start date.` }, { status: 400 });
    }

    if (isAfter(body.starts_at, body.ends_at)) {
      NextResponse.json({ error: `Invalid trip end date` }, { status: 400 });
    }

    const { tripId } = await createTrip(body);

    return NextResponse.json({ tripId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
