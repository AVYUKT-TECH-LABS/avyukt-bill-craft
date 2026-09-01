import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllInvoices, Invoice } from "@/lib/api";
import { calculateTotal, formatCurrency } from "@/lib/invoiceCalc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameMonth, isSameYear } from "date-fns";

const Dashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllInvoices()
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");

  const unpaid = invoices.filter((i) => i.status === "sent");
  const overdue = unpaid.filter((i) => i.due_date < today);
  const outstanding = unpaid.reduce((sum, i) => sum + calculateTotal(i.data), 0);
  const overdueTotal = overdue.reduce((sum, i) => sum + calculateTotal(i.data), 0);
  const revenueThisMonth = invoices
    .filter((i) => i.status === "paid" && i.paid_at && isSameMonth(new Date(i.paid_at), now) && isSameYear(new Date(i.paid_at), now))
    .reduce((sum, i) => sum + calculateTotal(i.data), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(outstanding)}</p>
            <p className="text-xs text-muted-foreground">{unpaid.length} unpaid invoice(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(overdueTotal)}</p>
            <p className="text-xs text-muted-foreground">{overdue.length} overdue invoice(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(revenueThisMonth)}</p>
          </CardContent>
        </Card>
      </div>

      {overdue.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Overdue Invoices</h2>
          <div className="space-y-2">
            {overdue.map((invoice) => (
              <Link
                key={invoice.id}
                to={`/invoices/${invoice.id}`}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">Due {format(new Date(invoice.due_date), "MMM dd, yyyy")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{formatCurrency(calculateTotal(invoice.data))}</span>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
