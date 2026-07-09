import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Button from "../components/common/Button";
import { useCollection } from "../hooks/useCollection";
import { transactionService } from "../services/transactionService";
import { useDisclosure } from "../hooks/useDisclosure";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";

export default function Transactions() {
  const { hasRole } = useAuth();
  const { data: transactions } = useCollection(transactionService, [], []);
  const { isOpen, open, close } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const toast = useToast();

  const { register, handleSubmit, reset } = useForm();

  const filtered = useMemo(() => {
    if (typeFilter === "all") return transactions;
    return transactions.filter((t) => t.type === typeFilter);
  }, [transactions, typeFilter]);

  const startEdit = (row) => {
    setEditing(row);
    reset({ amount: row.amount, rate: row.rate, notes: row.notes });
    open();
  };

  const onSubmit = async (values) => {
    const amount = Number(values.amount);
    const rate = Number(values.rate);
    await transactionService.update(editing.id, {
      amount,
      rate,
      total: amount * rate,
      notes: values.notes,
    });
    toast.success("Transaction updated.");
    close();
  };

  const remove = async (row) => {
    if (!confirm("Delete this transaction? This does not reverse account balances automatically.")) return;
    await transactionService.remove(row.id);
    toast.success("Transaction deleted.");
  };

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (r) => (r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "—"),
    },
    { key: "customerName", label: "Customer" },
    { key: "type", label: "Type", render: (r) => <Badge color={r.type === "buy" ? "mint" : "coral"}>{r.type}</Badge> },
    { key: "currencyCode", label: "Currency" },
    { key: "amount", label: "Amount" },
    { key: "rate", label: "Rate" },
    { key: "total", label: "Total", render: (r) => `PKR ${(r.total || 0).toLocaleString()}` },
    { key: "paymentMethod", label: "Method" },
    {
      key: "actions",
      label: "",
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => startEdit(r)} className="p-2 rounded-lg hover:bg-black/5 text-accent">
            <FiEdit2 size={14} />
          </button>
          {hasRole("admin", "manager") && (
            <button onClick={() => remove(r)} className="p-2 rounded-lg hover:bg-black/5 text-coral">
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Search, filter, and manage every recorded deal."
        actions={
          <Select
            className="w-40"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "All types" },
              { value: "buy", label: "Buy only" },
              { value: "sell", label: "Sell only" },
            ]}
          />
        }
      />
      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Search by customer, currency..."
          pageSize={10}
          emptyTitle="No transactions found"
          emptyDescription="Recorded buy and sell deals will appear here."
        />
      </Card>

      <Modal isOpen={isOpen} onClose={close} title="Edit Transaction">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount" type="number" step="any" {...register("amount", { required: true })} />
            <Input label="Rate" type="number" step="any" {...register("rate", { required: true })} />
          </div>
          <Input label="Notes" {...register("notes")} />
          <Button type="submit" className="mt-2">Save Changes</Button>
        </form>
      </Modal>
    </div>
  );
}
