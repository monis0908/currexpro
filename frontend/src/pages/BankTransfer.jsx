import BankAccountsView from "../components/bank/BankAccountsView";

export default function BankTransfer() {
  return (
    <BankAccountsView
      type="transfer"
      title="Transfer Accounts"
      description="Manage bank accounts used for wire and transfer settlements."
    />
  );
}
