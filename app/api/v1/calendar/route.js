import { ok, withDB } from "@/lib/crud";
import { eventEnd, eventStart } from "@/lib/events";
import Challenge from "@/models/Challenge";
import Event from "@/models/Event";

export const dynamic = "force-dynamic";

// Public: club events + challenge windows for the calendar page
export const GET = withDB(async () => {
  const [events, challenges] = await Promise.all([
    Event.find().select("title location eventType status startTime endTime registrationEnabled").lean(),
    Challenge.find({ published: true }).select("title kind difficulty points startsAt endsAt").lean(),
  ]);
  const items = [
    ...events.map((e) => ({
      id: String(e._id), type: "event", title: e.title, subtitle: `${e.eventType} · ${e.location}`,
      start: eventStart(e), end: eventEnd(e), href: `/events/${e._id}`, status: e.status, registration: !!e.registrationEnabled,
    })),
    ...challenges.map((c) => ({
      id: String(c._id), type: "challenge", title: c.title, subtitle: `${c.kind} challenge · ${c.difficulty} · ${c.points} pts`,
      start: c.startsAt, end: c.endsAt, href: `/challenges/${c._id}`,
    })),
  ].filter((i) => i.start);
  return ok({ items });
});
