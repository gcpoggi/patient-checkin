import { resetStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export function POST() {
  resetStore();
  return Response.json({ ok: true });
}
