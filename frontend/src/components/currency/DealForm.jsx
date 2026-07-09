import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { FiSave } from "react-icons/fi";

export default function DealForm({ type, customers, currencies, accounts, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: "",
      currencyCode: "",
      amount: "",
      rate: "",
      paymentMethod: "cash",
      accountId: "",
      notes: "",
    },
  });

  const currencyCode = watch("currencyCode");
  const amount = Number(watch("amount")) || 0;
  const rate = Number(watch("rate")) || 0;
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    const currency = currencies.find((c) => c.code === currencyCode);
    if (currency) {
      setValue("rate", type === "buy" ? currency.buyRate : currency.sellRate);
    }
  }, [currencyCode, currencies, setValue, type]);

  const total = useMemo(() => (amount * rate).toFixed(2), [amount, rate]);

  const filteredAccounts = accounts.filter((a) => a.type === paymentMethod);

  const submit = (values) => {
    const customer = customers.find((c) => c.id === values.customerId);
    const currency = currencies.find((c) => c.code === values.currencyCode);
    onSubmit(
      {
        type,
        customerId: values.customerId || null,
        customerName: customer?.name || "Walk-in customer",
        currencyCode: values.currencyCode,
        currencyName: currency?.name || values.currencyCode,
        amount: Number(values.amount),
        rate: Number(values.rate),
        paymentMethod: values.paymentMethod,
        accountId: values.accountId,
        notes: values.notes,
      },
      reset
    );
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Select
        label="Customer"
        placeholder="Walk-in customer"
        options={customers.map((c) => ({ value: c.id, label: c.name }))}
        {...register("customerId")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Currency"
          placeholder="Select currency"
          options={currencies.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
          error={errors.currencyCode?.message}
          {...register("currencyCode", { required: "Select a currency" })}
        />
        <Input
          label="Amount"
          type="number"
          step="any"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount", { required: "Amount is required", min: { value: 0.01, message: "Must be greater than 0" } })}
        />
      </div>

      <Input
        label={`Exchange Rate (${type === "buy" ? "Buy Rate" : "Sell Rate"})`}
        type="number"
        step="any"
        placeholder="0.00"
        error={errors.rate?.message}
        {...register("rate", { required: "Rate is required", min: { value: 0.0001, message: "Must be greater than 0" } })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Payment Method"
          options={[
            { value: "cash", label: "Cash" },
            { value: "transfer", label: "Transfer" },
          ]}
          {...register("paymentMethod")}
        />
        <Select
          label="Account"
          placeholder="Select account"
          options={filteredAccounts.map((a) => ({ value: a.id, label: a.name }))}
          error={errors.accountId?.message}
          {...register("accountId", { required: "Select an account" })}
        />
      </div>

      <Input label="Notes" placeholder="Optional note about this deal" {...register("notes")} />

      <div className="flex items-center justify-between bg-paper rounded-xl px-4 py-3 border border-black/5">
        <span className="text-sm text-muted">Total</span>
        <span className="font-tabular font-display font-bold text-xl text-ink">PKR {total}</span>
      </div>

      <Button type="submit" variant={type === "buy" ? "mint" : "coral"} icon={FiSave} loading={submitting} size="lg">
        {type === "buy" ? "Record Buy Deal" : "Record Sell Deal"}
      </Button>
    </form>
  );
}
