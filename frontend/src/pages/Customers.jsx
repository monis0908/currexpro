import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import { useCollection } from "../hooks/useCollection";
import { customerService } from "../services/customerService";
import { transactionService } from "../services/transactionService";
import { useDisclosure } from "../hooks/useDisclosure";
import { useToast } from "../hooks/useToast";
import { formatPKR } from "../utils/formatCurrency";

export default function Customers() {
  const { data: customers } = useCollection(customerService, [], []);
  const { data: allTransactions } = useCollection(transactionService, [], []);
  const { isOpen, open, close } = useDisclosure();
  const { isOpen: historyOpen, open: openHistory, close: closeHistory } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const toast = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const startCreate = () => {
    setEditing(null);
    reset({ name: "", phone: "", email: "", idNumber: "", address: "" });
    open();
  };

  const startEdit = (row) => {
    setEditing(row);
    reset(row);
    open();
  };

  const showHistory = (row) => {
    setHistoryCustomer(row);
    openHistory();
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await customerService.update(editing.id, values);
        toast.success("Customer updated.");
      } else {
        await customerService.create(values);
        toast.success("Customer added.");
      }
      close();
    } catch {
      toast.error("Could not save customer.");
    }
  };

  const remove = async (row) => {
    if (!confirm(`Delete customer "${row.name}"? This cannot be undone.`)) return;
    await customerService.remove(row.id);
    toast.success("Customer deleted.");
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "idNumber", label: "ID Number" },
    {
      key: "actions",
      label: "",
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => showHistory(r)} className="p-2 rounded-lg hover:bg-black/5 text-muted" title="Transaction history">
            <FiClock size={14} />
          </button>
          <button onClick={() => startEdit(r)} className="p-2 rounded-lg hover:bg-black/5 text-accent">
            <FiEdit2 size={14} />
          </button>
          <button onClick={() => remove(r)} className="p-2 rounded-lg hover:bg-black/5 text-coral">
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const historyRows = historyCustomer
    ? allTransactions.filter((t) => t.customerId === historyCustomer.id)
    : [];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage customer records and view their transaction history."
        actions={<Button icon={FiPlus} onClick={startCreate}>Add Customer</Button>}
      />
      <Card>
        <DataTable columns={columns} data={customers} searchPlaceholder="Search by name, phone, email, ID..." emptyTitle="No customers yet" emptyDescription="Add your first customer to get started." />
      </Card>

      <Modal isOpen={isOpen} onClose={close} title={editing ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Full Name" error={errors.name?.message} {...register("name", { required: "Required" })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" {...register("phone")} />
            <Input label="Email" type="email" {...register("email")} />
          </div>
          <Input label="ID Number" {...register("idNumber")} />
          <Input label="Address" {...register("address")} />
          <Button type="submit" className="mt-2">{editing ? "Save Changes" : "Add Customer"}</Button>
        </form>
      </Modal>

      <Modal isOpen={historyOpen} onClose={closeHistory} title={`${historyCustomer?.name || ""} — Transaction History`} size="lg">
        {historyRows.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No transactions recorded for this customer.</p>
        ) : (
          <div className="flex flex-col divide-y divide-black/5">
            {historyRows.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{t.amount} {t.currencyCode} @ {t.rate}</p>
                  <p className="text-xs text-muted">{t.paymentMethod} · {t.notes || "No notes"}</p>
                </div>
                <div className="text-right">
                  <p className="font-tabular text-sm font-semibold">{formatPKR(t.total)}</p>
                  <Badge color={t.type === "buy" ? "mint" : "coral"}>{t.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
