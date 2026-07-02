import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { submitBooking } from "@/lib/booking.functions";

const DESTINATIONS = [
  "Kathmandu", "Pokhara", "Lumbini", "Bhairahawa",
  "Bhadrapur", "Biratnagar", "Janakpur", "Bharatpur",
  "Dhangadhi", "Nepalgunj", "Tumlingtar", "Kolkata",
];



const WHATSAPP_NUMBER = "9779829317970"; // +977 98 2931 7970

type Props = { children: React.ReactNode };

export default function BookingDialog({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    from: "Kathmandu",
    to: "Pokhara",
    date: "",
    returnDate: "",
    passengers: "1",
    tripType: "oneway",
    cabin: "Economy",
    notes: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) {
      toast.error("Please fill name, phone and departure date.");
      return;
    }
    if (form.from === form.to) {
      toast.error("Origin and destination must differ.");
      return;
    }

    const msg = [
      "*New Buddha Air Booking Request*",
      "",
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      form.email ? `*Email:* ${form.email}` : null,
      "",
      `*Trip:* ${form.tripType === "roundtrip" ? "Round-trip" : "One-way"}`,
      `*From:* ${form.from}`,
      `*To:* ${form.to}`,
      `*Depart:* ${form.date}`,
      form.tripType === "roundtrip" && form.returnDate
        ? `*Return:* ${form.returnDate}`
        : null,
      `*Passengers:* ${form.passengers}`,
      `*Cabin:* ${form.cabin}`,
      form.notes ? `\n*Notes:* ${form.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp to send your request…");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/15 bg-neutral-950/95 text-white backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Book your flight</DialogTitle>
          <DialogDescription className="text-white/60">
            Your request is sent directly via WhatsApp to our reservations desk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Trip type">
              <Select value={form.tripType} onValueChange={(v) => set("tripType", v)}>
                <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="oneway">One-way</SelectItem>
                  <SelectItem value="roundtrip">Round-trip</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cabin">
              <Select value={form.cabin} onValueChange={(v) => set("cabin", v)}>
                <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Economy">Economy</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Mountain Flight">Mountain Flight</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <Select value={form.from} onValueChange={(v) => set("from", v)}>
                <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {DESTINATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="To">
              <Select value={form.to} onValueChange={(v) => set("to", v)}>
                <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {DESTINATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Depart">
              <Input
                type="date"
                required
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="bg-white/5"
              />
            </Field>
            <Field label="Return">
              <Input
                type="date"
                disabled={form.tripType !== "roundtrip"}
                value={form.returnDate}
                onChange={(e) => set("returnDate", e.target.value)}
                className="bg-white/5 disabled:opacity-40"
              />
            </Field>
          </div>

          <Field label="Passengers">
            <Input
              type="number"
              min={1}
              max={9}
              value={form.passengers}
              onChange={(e) => set("passengers", e.target.value)}
              className="bg-white/5"
            />
          </Field>

          <Field label="Full name">
            <Input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="bg-white/5"
              placeholder="As on your passport / ID"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <Input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="bg-white/5"
                placeholder="+977…"
              />
            </Field>
            <Field label="Email (optional)">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="bg-white/5"
              />
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-white/5 px-3 py-2 text-sm"
              placeholder="Meal preference, mobility needs…"
            />
          </Field>

          <DialogFooter className="pt-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber-400 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-amber-300"
            >
              Book Now
            </button>
          </DialogFooter>

        </form>

      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[0.65rem] uppercase tracking-[0.25em] text-white/60">{label}</Label>
      {children}
    </div>
  );
}
