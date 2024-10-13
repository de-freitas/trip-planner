"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import InviteGuestModal from "@/components/create-trip/invite-guests-modal";
import ConfirmTripModal from "@/components/create-trip/confirm-trip-modal";
import DestinationAndDateStep from "@/components/create-trip/steps/destination-and-date-step";
import InviteGuestsStep from "@/components/create-trip/steps/invite-guests-step";
import { api } from "@/lib/axios";

import logoTripPlanner from "../../public/Logo.svg";
import Image from "next/image";

interface responseTripId {
  tripId: string;
}

export default function CreateTripPage() {
  const router = useRouter();

  const [isGestsInputOpen, setIsGuestsInputOpen] = useState(false);
  const [isGuestsModalOpen, setIsGuestsModalOpen] = useState(false);
  const [emailsToInvite, setEmailsToInvite] = useState([
    "shakira@gmail.com.br",
    "keanu.reeves@gmail.com",
  ]);
  const [isConfirmTripModalOpen, setIsConfirmTripModalOpen] = useState(false);

  const [destination, setDestination] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [eventStartAndEndDates, setEventStartAndEndDates] = useState<
    DateRange | undefined
  >();

  function openGuestsInput() {
    setIsGuestsInputOpen(true);
  }

  function closeGuestsInput() {
    setIsGuestsInputOpen(false);
  }

  function openGuestsModal() {
    setIsGuestsModalOpen(true);
  }

  function closeGuestsModal() {
    setIsGuestsModalOpen(false);
  }

  function openConfirmTripModal() {
    if (emailsToInvite.length === 0) return;
    setIsConfirmTripModalOpen(true);
  }

  function closeConfirmTripModal() {
    setIsConfirmTripModalOpen(false);
  }

  function addNewEmailToInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = data.get("email")?.toString();

    if (!email) return;
    if (emailsToInvite.includes(email))
      return window.alert("e-mail já cadastrado");

    setEmailsToInvite([...emailsToInvite, email]);

    event.currentTarget.reset();
  }

  function removeEmailsFromInvite(emailToRemove: string) {
    const newEmailList = emailsToInvite.filter(
      (invited) => invited !== emailToRemove
    );

    setEmailsToInvite(newEmailList);
  }

  async function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!destination) return;
    if (!eventStartAndEndDates?.from || !eventStartAndEndDates?.to) return;
    if (emailsToInvite.length === 0) return;
    if (!ownerEmail || !ownerEmail) return;

    const response = await api.post(`/trips`, {
      destination: destination,
      starts_at: eventStartAndEndDates?.from,
      ends_at: eventStartAndEndDates?.to,
      emails_to_invite: emailsToInvite,
      owner_name: ownerName,
      owner_email: ownerEmail,
    });

    const { tripId }: responseTripId = response.data;

    router.push(`/trip-details/${tripId}`);
  }

  return (
    <>
      <div className="bg-background bg-no-repeat bg-center h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full px-6 text-center space-y-10">
          <div className="flex flex-col items-center gap-3">
            <Image src={logoTripPlanner} alt="Trip Planner logo" />
            <p className="text-zinc-300 text-lg">
              Convide seus amigos e planeje sua próxima viagem!
            </p>
          </div>

          <div className="space-y-4">
            {
              <DestinationAndDateStep
                closeGuestsInput={closeGuestsInput}
                openGuestsInput={openGuestsInput}
                isGestsInputOpen={isGestsInputOpen}
                setDestination={setDestination}
                eventStartAndEndDates={eventStartAndEndDates}
                setEventStartAndEndDates={setEventStartAndEndDates}
              />
            }

            {isGestsInputOpen && (
              <InviteGuestsStep
                openGuestsModal={openGuestsModal}
                emailsToInvite={emailsToInvite}
                openConfirmTripModal={openConfirmTripModal}
              />
            )}
          </div>

          <p className="text-sm text-zinc-500">
            Ao planejar sua viagem pela plann.er você automaticamente
            <br />
            concorda com nossos{" "}
            <a className="text-zinc-300 underline" href="#">
              termos de uso
            </a>{" "}
            e{" "}
            <a className="text-zinc-300 underline" href="#">
              políticas de privacidade
            </a>
          </p>
        </div>

        {isGuestsModalOpen && (
          <InviteGuestModal
            emailsToInvite={emailsToInvite}
            addNewEmailToInvite={addNewEmailToInvite}
            closeGuestsModal={closeGuestsModal}
            removeEmailsFromInvite={removeEmailsFromInvite}
          />
        )}

        {isConfirmTripModalOpen && (
          <ConfirmTripModal
            closeConfirmTripModal={closeConfirmTripModal}
            createTrip={createTrip}
            setOwnerName={setOwnerName}
            setOwnerEmail={setOwnerEmail}
          />
        )}
      </div>
    </>
  );
}
