import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import DataTable from "../components/common/DataTable";
import Loader from "../components/common/Loader";
import { useDisclosure } from "../hooks/useDisclosure";
import { useToast } from "../hooks/useToast";
import apiClient from "../services/apiClient";

export default function SettingsUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close } = useDisclosure();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/users");
      setUsers(data.data || []);
    } catch {
      toast.error("Could not load users. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    try {
      await apiClient.post("/users", values);
      toast.success("User created.");
      reset();
      close();
      load();
    } catch (err) {
      // Surfaces the backend's specific message when available —
      // e.g. "This username is already taken. Please choose another."
      toast.error(err.response?.data?.message || "Could not create user.");
    }
  };

  const remove = async (row) => {
    if (!confirm(`Remove ${row.name}'s access?`)) return;
    try {
      await apiClient.delete(`/users/${row.uid}`);
      toast.success("User removed.");
      load();
    } catch {
      toast.error("Could not remove user.");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (r) => <Badge color="accent">{r.role}</Badge> },
    {
      key: "actions",
      label: "",
      sortable: false,
      render: (r) => (
        <button onClick={() => remove(r)} className="p-2 rounded-lg hover:bg-black/5 text-coral">
          <FiTrash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage staff accounts and role-based access."
        actions={<Button icon={FiPlus} onClick={open}>Add User</Button>}
      />
      <Card>
        {loading ? <Loader label="Loading users..." /> : (
          <DataTable columns={columns} data={users} searchPlaceholder="Search users..." emptyTitle="No users yet" emptyDescription="Add your team members to grant them access." />
        )}
      </Card>

      <Modal isOpen={isOpen} onClose={close} title="Add User">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Full Name" error={errors.name?.message} {...register("name", { required: "Required" })} />
          <Input
            label="Username"
            placeholder="ali.raza"
            error={errors.username?.message}
            {...register("username", {
              required: "Username is required",
              pattern: {
                value: /^[a-zA-Z0-9._-]{3,20}$/,
                message: "3-20 characters: letters, numbers, dot, dash, underscore only",
              },
            })}
          />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Required" })} />
          <Input label="Temporary Password" type="password" error={errors.password?.message} {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 characters" } })} />
          <Select
            label="Role"
            options={[
              { value: "admin", label: "Admin" },
              { value: "manager", label: "Manager" },
              { value: "cashier", label: "Cashier" },
            ]}
            {...register("role", { required: true })}
          />
          <Button type="submit" className="mt-2">Create User</Button>
        </form>
      </Modal>
    </div>
  );
}