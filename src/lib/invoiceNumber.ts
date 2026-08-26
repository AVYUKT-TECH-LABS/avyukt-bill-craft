import { format } from "date-fns";

// AVTL<MMDD><NN> — NN is the count of invoices already issued on that date.
export const nextInvoiceNumber = (date: Date, countForDate: number) =>
  `AVTL${format(date, "MMdd")}${String(countForDate + 1).padStart(2, "0")}`;
