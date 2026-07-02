import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BookingSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(3).max(50),
  email: z.string().max(200).optional().default(""),
  tripType: z.enum(["oneway", "roundtrip"]),
  from: z.string().min(1).max(100),
  to: z.string().min(1).max(100),
  date: z.string().min(1).max(50),
  returnDate: z.string().max(50).optional().default(""),
  passengers: z.string().max(10),
  cabin: z.string().max(50),
  notes: z.string().max(1000).optional().default(""),
});

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => BookingSchema.parse(data))
  .handler(async ({ data }) => {
    const phone = process.env.CALLMEBOT_PHONE;
    const apikey = process.env.CALLMEBOT_APIKEY;

    const lines = [
      "*New Buddha Air Booking*",
      "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      data.email ? `Email: ${data.email}` : null,
      "",
      `Trip: ${data.tripType === "roundtrip" ? "Round-trip" : "One-way"}`,
      `From: ${data.from}`,
      `To: ${data.to}`,
      `Depart: ${data.date}`,
      data.tripType === "roundtrip" && data.returnDate ? `Return: ${data.returnDate}` : null,
      `Passengers: ${data.passengers}`,
      `Cabin: ${data.cabin}`,
      data.notes ? `\nNotes: ${data.notes}` : null,
    ].filter(Boolean).join("\n");

    // CallMeBot free WhatsApp API — sends to owner's number automatically.
    // Configure once: message the CallMeBot WhatsApp bot from your number to get an apikey.
    if (phone && apikey) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(lines)}&apikey=${encodeURIComponent(apikey)}`;
      try {
        await fetch(url, { method: "GET" });
      } catch (err) {
        console.error("CallMeBot send failed", err);
      }
    } else {
      // Fallback: log so the owner can retrieve from server logs until secrets are set.
      console.log("[BOOKING]", lines);
    }

    return { ok: true };
  });
