// Daily cron target (via pg_cron + pg_net) that creates any due recurring invoices.
// Uses the service role key (auto-injected), so it bypasses RLS by design.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { addWeeks, addMonths, addQuarters, addYears, addDays, differenceInCalendarDays, format } from "npm:date-fns@3";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type Frequency = "weekly" | "monthly" | "quarterly" | "yearly";

// Computed fresh from the anchor each time (anchor + k periods), never chained off the last
// generated date, so short months / leap years never cause drift.
const addPeriod = (anchor: Date, frequency: Frequency, k: number): Date => {
  switch (frequency) {
    case "weekly":
      return addWeeks(anchor, k);
    case "monthly":
      return addMonths(anchor, k);
    case "quarterly":
      return addQuarters(anchor, k);
    case "yearly":
      return addYears(anchor, k);
  }
};

// Mirrors src/lib/invoiceNumber.ts — duplicated because this Deno function can't import from src/.
const nextInvoiceNumber = (date: Date, countForDate: number) =>
  `AVTL${format(date, "MMdd")}${String(countForDate + 1).padStart(2, "0")}`;

Deno.serve(async (_req: Request) => {
  const today = format(new Date(), "yyyy-MM-dd");
  let createdCount = 0;
  const dateCounts = new Map<string, number>();

  const countForDate = async (dateStr: string) => {
    if (dateCounts.has(dateStr)) return dateCounts.get(dateStr)!;
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("date", dateStr);
    return count ?? 0;
  };

  const { data: schedules, error: schedulesError } = await supabase
    .from("recurring_schedules")
    .select("id, frequency, anchor_date, source_invoice_id")
    .eq("active", true);

  if (schedulesError) {
    return new Response(JSON.stringify({ error: schedulesError.message }), { status: 500 });
  }

  for (const schedule of schedules ?? []) {
    const { data: source, error: sourceError } = await supabase
      .from("invoices")
      .select("project_id, date, due_date, data")
      .eq("id", schedule.source_invoice_id)
      .single();
    if (sourceError || !source) continue;

    const { count: existingCount } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("recurring_schedule_id", schedule.id);

    const anchor = new Date(schedule.anchor_date);
    const dueDateGapDays = differenceInCalendarDays(new Date(source.due_date), new Date(source.date));

    let k = (existingCount ?? 0) + 1;
    while (true) {
      const candidate = addPeriod(anchor, schedule.frequency as Frequency, k);
      const candidateStr = format(candidate, "yyyy-MM-dd");
      if (candidateStr > today) break;

      // Idempotency: skip if this period was already generated (handles a late/duplicate cron fire).
      const { data: existing } = await supabase
        .from("invoices")
        .select("id")
        .eq("recurring_schedule_id", schedule.id)
        .eq("recurring_period_date", candidateStr)
        .maybeSingle();

      if (!existing) {
        const dueDate = addDays(candidate, dueDateGapDays);
        const countOnDate = await countForDate(candidateStr);
        dateCounts.set(candidateStr, countOnDate + 1);

        const invoiceData = {
          ...(source.data as Record<string, unknown>),
          date: candidateStr,
          dueDate: format(dueDate, "yyyy-MM-dd"),
          invoiceNumber: nextInvoiceNumber(candidate, countOnDate),
        };

        const { error: insertError } = await supabase.from("invoices").insert({
          project_id: source.project_id,
          invoice_number: invoiceData.invoiceNumber,
          date: candidateStr,
          due_date: format(dueDate, "yyyy-MM-dd"),
          data: invoiceData,
          recurring_schedule_id: schedule.id,
          recurring_period_date: candidateStr,
        });

        // 23505 = unique_violation: another run already inserted this period, safe to ignore.
        if (insertError && insertError.code !== "23505") {
          return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
        }
        if (!insertError) createdCount++;
      }

      k++;
    }
  }

  return new Response(JSON.stringify({ created: createdCount }), {
    headers: { "Content-Type": "application/json" },
  });
});
