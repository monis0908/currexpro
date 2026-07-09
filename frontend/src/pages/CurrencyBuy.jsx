import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import DealForm from "../components/currency/DealForm";
import { useCollection } from "../hooks/useCollection";
import { customerService } from "../services/customerService";
import { currencyService } from "../services/currencyService";
import { bankService } from "../services/bankService";
import { transactionService } from "../services/transactionService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { formatPKR } from "../utils/formatCurrency";


const COLUMNS = [
  { key: "customerName", label: "Customer" },
  { key: "currencyCode", label: "Currency" },
  { key: "amount", label: "Amount" },
  { key: "rate", label: "Rate" },
  { key: "total", label: "Total", render: (r) => formatPKR(r.total) },
  { key: "paymentMethod", label: "Method", render: (r) => <Badge color="accent">{r.paymentMethod}</Badge> },
];

export default function CurrencyBuy() {
  const { user } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { data: customers } = useCollection(customerService, [], []);
  const { data: currencies } = useCollection(currencyService, [], []);
  const { data: accounts } = useCollection(bankService, [], []);
  const { data: transactions } = useCollection(
    transactionService,
    [transactionService.where("type", "==", "buy")],
    []
  );

  const handleSubmit = async (payload, reset) => {
    setSubmitting(true);
    try {
      await transactionService.recordDeal(payload, user);
      toast.success("Buy deal recorded successfully.");
      reset();
    } catch (err) {
      toast.error(err.message || "Could not record the deal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Buy Currency" description="Record a currency purchase from a customer." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <DealForm
            type="buy"
            customers={customers}
            currencies={currencies}
            accounts={accounts}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold text-ink mb-4">Recent buy deals</h3>
          <DataTable columns={COLUMNS} data={transactions} emptyTitle="No buy deals yet" emptyDescription="Deals you record will appear here." />
        </Card>
      </div>
    </div>
  );
}
