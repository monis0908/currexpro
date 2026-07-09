import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import { useCollection } from "../hooks/useCollection";
import { currencyService } from "../services/currencyService";
import { useDisclosure } from "../hooks/useDisclosure";
import { useToast } from "../hooks/useToast";

export default function CurrencyRates() {
  const { data: rates, loading } = useCollection(currencyService, [], []);
  const { isOpen, open, close } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const startCreate = () => {
    setEditing(null);
    reset({ code: "", name: "", buyRate: "", sellRate: "", active: true });
    open();
  };

  const startEdit = (row) => {
    setEditing(row);
    reset(row);
    open();
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        code: values.code.toUpperCase(),
        name: values.name,
        buyRate: Number(values.buyRate),
        sellRate: Number(values.sellRate),
        active: true,
      };
      if (editing) {
        await currencyService.update(editing.id, payload);
        toast.success("Rate updated.");
      } else {
        await currencyService.create(payload);
        toast.success("Currency added.");
      }
      close();
    } catch (err) {
      toast.error("Could not save the currency rate.");
    }
  };

  const remove = async (row) => {
    if (!confirm(`Remove ${row.code} from the rate list?`)) return;
    await currencyService.remove(row.id);
    toast.success("Currency removed.");
  };

  const columns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "buyRate", label: "Buy Rate", render: (r) => `PKR ${Number(r.buyRate).toFixed(4)}` },
    { key: "sellRate", label: "Sell Rate", render: (r) => `PKR ${Number(r.sellRate).toFixed(4)}` },
    { key: "active", label: "Status", render: (r) => <Badge color={r.active ? "mint" : "slate"}>{r.active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      label: "",
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-1">
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

  return (
    <div>
      <PageHeader
        title="Currency Rates"
        description="Manage the buy and sell rates offered to customers."
        actions={<Button icon={FiPlus} onClick={startCreate}>Add Currency</Button>}
      />
      <Card>
        <DataTable columns={columns} data={rates} emptyTitle="No currencies configured" emptyDescription="Add a currency to start quoting rates." />
      </Card>

      <Modal isOpen={isOpen} onClose={close} title={editing ? "Edit Rate" : "Add Currency"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Currency Code" placeholder="USD" error={errors.code?.message} {...register("code", { required: "Required" })} />
            <Input label="Currency Name" placeholder="US Dollar" error={errors.name?.message} {...register("name", { required: "Required" })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Buy Rate" type="number" step="any" error={errors.buyRate?.message} {...register("buyRate", { required: "Required" })} />
            <Input label="Sell Rate" type="number" step="any" error={errors.sellRate?.message} {...register("sellRate", { required: "Required" })} />
          </div>
          <Button type="submit" className="mt-2">{editing ? "Save Changes" : "Add Currency"}</Button>
        </form>
      </Modal>
    </div>
  );
}
