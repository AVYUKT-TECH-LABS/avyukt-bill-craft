import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject, getInvoicesForProject, Project, Invoice } from "@/lib/api";
import { calculateTotal, formatCurrency } from "@/lib/invoiceCalc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const ProjectDetail = () => {
  const { clientId, projectId } = useParams<{ clientId: string; projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([getProject(projectId), getInvoicesForProject(projectId)])
      .then(([p, inv]) => {
        setProject(p);
        setInvoices(inv);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!project) return <p className="text-muted-foreground">Project not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <Link to={`/clients/${clientId}`} className="text-sm text-primary hover:underline">
            Back to client
          </Link>
        </div>
        <Link to={`/invoices/new?projectId=${projectId}`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="text-muted-foreground">No invoices yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/invoices/${invoice.id}`} className="text-primary hover:underline font-medium">
                    {invoice.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>{format(new Date(invoice.date), "MMM dd, yyyy")}</TableCell>
                <TableCell>{format(new Date(invoice.due_date), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(calculateTotal(invoice.data))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ProjectDetail;
