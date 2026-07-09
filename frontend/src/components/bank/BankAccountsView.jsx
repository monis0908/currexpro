import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiArrowDownCircle, FiArrowUpCircle, FiClock } from "react-icons/fi";
import PageHeader from "../common/PageHeader";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import { useCollection } from "../../hooks/useCollection";
import { bankService } from "../../services/bankService";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";

export default function BankAccountsView({ type, title, description }) {
  const { user } = useAuth();
  const toast = useToast();
  const { data: accounts } = useCollection(bankService, [bankService.where("type", "==", type)], [type]);

  const createModal = useDisclosure();
  const moveModal = useDisclosure();
  const historyModal = useDisclosure();
  const [activeAccount, setActiveAccount] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [moveType, setMoveType] = useState("deposit");

  const createForm = useForm();
  const moveForm = useForm();

  const onCreate = async (values) => {
    await bankService.create({ name: values.name, type, balance: Number(values.opening) || 0 });
    toast.success("Account created.");
    createForm.reset();
    createModal.close();
  };

  const openMove = (account, kind) => {
    setActiveAccount(account);
    setMoveType(kind);
    moveForm.reset({ amount: "", note: "" });
    moveModal.open();
  };

  const onMove = async (values) => {
    try {
      await bankService.adjustBalance(activeAccount.id, Number(values.amount), moveType, values.note, user?.uid);
      toast.success(`${moveType === "deposit" ? "Deposit" : "Withdrawal"} recorded.`);
      moveModal.close();
    } catch (err) {
      toast.error(err.message || "Could not complete this transaction.");
    }
  };

  const openHistory = async (account) => {
    setActiveAccount(account);
    const rows = await bankService.getHistory(account.id);
    setHistoryRows(rows);
    historyModal.open();
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={<Button icon={FiPlus} onClick={() => createModal.open()}>Add Account</Button>}
      />

      <Card className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Total {title.toLowerCase()} balance</p>
          <p className="font-display font-tabular text-2xl font-bold text-ink mt-1">
            PKR {totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </Card>

      {accounts.length === 0 ? (
        <Card>
          <p className="text-sm text-muted text-center py-8">No {title.toLowerCase()} accounts yet. Add one to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <Card key={a.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted">{a.name}</p>
                  <p className="font-display font-tabular text-xl font-bold text-ink mt-1">
                   PKR {Number(a.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Badge color="accent">{type}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="mint" icon={FiArrowDownCircle} onClick={() => openMove(a, "deposit")} className="flex-1">
                  Deposit
                </Button>
                <Button size="sm" variant="coral" icon={FiArrowUpCircle} onClick={() => openMove(a, "withdraw")} className="flex-1">
                  Withdraw
                </Button>
                <button onClick={() => openHistory(a)} className="p-2.5 rounded-xl border border-black/10 hover:bg-black/5 text-muted">
                  <FiClock size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title={`Add ${title} Account`}>
        <form onSubmit={createForm.handleSubmit(onCreate)} className="flex flex-col gap-4">
          <Input label="Account Name" placeholder="e.g. Main Vault" {...createForm.register("name", { required: true })} />
          <Input label="Opening Balance" type="number" step="any" placeholder="0.00" {...createForm.register("opening")} />
          <Button type="submit" className="mt-2">Create Account</Button>
        </form>
      </Modal>

      <Modal isOpen={moveModal.isOpen} onClose={moveModal.close} title={`${moveType === "deposit" ? "Deposit to" : "Withdraw from"} ${activeAccount?.name || ""}`}>
        <form onSubmit={moveForm.handleSubmit(onMove)} className="flex flex-col gap-4">
          <Input label="Amount" type="number" step="any" placeholder="0.00" {...moveForm.register("amount", { required: true, min: 0.01 })} />
          <Input label="Note" placeholder="Optional note" {...moveForm.register("note")} />
          <Button type="submit" variant={moveType === "deposit" ? "mint" : "coral"} className="mt-2">
            Confirm {moveType === "deposit" ? "Deposit" : "Withdrawal"}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={historyModal.isOpen} onClose={historyModal.close} title={`${activeAccount?.name || ""} — History`} size="lg">
        {historyRows.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No movements recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-black/5">
            {historyRows.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink capitalize">{h.type}</p>
                  <p className="text-xs text-muted">{h.note || "No note"}</p>
                </div>
                <p className={`font-tabular text-sm font-semibold ${h.type === "deposit" ? "text-mint" : "text-coral"}`}>
                  {h.type === "deposit" ? "+" : "-"} PKR {Number(h.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
