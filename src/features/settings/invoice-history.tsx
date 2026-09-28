import { Download } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Badge } from "@/kit/ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/kit/ui/table"
import { formatDate } from "@/demo/model"
import { formatBillingAmount, type Invoice } from "@/demo/billing"

export function InvoiceHistory({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="billing-invoices" aria-labelledby="invoices-title">
      <h3 id="invoices-title">Invoices</h3>
      {invoices.length ? (
        <Table>
          <caption className="sr-only">
            Sample invoice history. Amounts in USD.
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Invoice</TableHead>
              <TableHead scope="col" className="text-right">
                Amount
              </TableHead>
              <TableHead scope="col">
                <span className="sr-only">Download</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <strong className="billing-invoice-id">{invoice.id}</strong>
                  <time dateTime={invoice.date}>
                    {formatDate(invoice.date)}
                  </time>
                </TableCell>
                <TableCell className="text-right">
                  <span className="billing-invoice-amount">
                    {formatBillingAmount(invoice.members * invoice.unitAmount)}
                  </span>
                  <Badge variant="secondary">{invoice.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    render={<a href={invoice.file} download />}
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Download ${invoice.id} sample PDF`}
                    title="Download sample PDF"
                  >
                    <Download />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No invoices yet</EmptyTitle>
            <EmptyDescription>
              There are no sample invoices for this workspace.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  )
}
