import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, deleteDoc, collection, getDocs, runTransaction } from "firebase/firestore";
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
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";

// Same Firebase config used by the main app — needed to spin up a
// temporary secondary app instance so creating a new user doesn't
// sign the admin out of their own session.
const firebaseConfig = {
  apiKey: "AIzaSyCg-KEabCiM7_Mj8mVaMebFrSiXGVgA_yg",
  authDomain: "currexpro.firebaseapp.com",
  projectId: "currexpro",
  storageBucket: "currexpro.firebasestorage.app",
  messagingSenderId: "272532141115",
  appId: "1:272532141115:web:ffbc125e67fa1dae90181e",
};

export default function SettingsUsers() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close } = useDisclosure();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const rows = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      setUsers(rows);
    } catch {
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    if (!isAdmin) {
      toast.error("Only admins can add users.");
      return;
    }

    const username = values.username.trim().toLowerCase();
    const usernameRef = doc(db, "usernames", username);

    // Spin up a throwaway secondary Firebase app so creating the new
    // account doesn't touch (or sign out) the currently logged-in admin.
    const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      // Reserve the username first, so two admins can't race on the same one.
      await runTransaction(db, async (tx) => {
        const existing = await tx.get(usernameRef);
        if (existing.exists()) {
          throw new Error("This username is already taken. Please choose another.");
        }
        tx.set(usernameRef, { email: values.email, uid: "pending" });
      });

      const cred = await createUserWithEmailAndPassword(secondaryAuth, values.email, values.password);

      await setDoc(doc(db, "users", cred.user.uid), {
        name: values.name,
        username,
        email: values.email,
        role: values.role,
        active: true,
      });

      // Finalize the username -> uid mapping now that we have the real uid.
      await setDoc(usernameRef, { email: values.email, uid: cred.user.uid });

      toast.success("User created.");
      reset();
      close();
      load();
    } catch (err) {
      // Roll back the username reservation if anything failed.
      try {
        await deleteDoc(usernameRef);
      } catch {
        /* ignore rollback errors */
      }
      toast.error(err.message || "Could not create user.");
    } finally {
      await deleteApp(secondaryApp);
    }
  };

  const remove = async (row) => {
    if (!isAdmin) {
      toast.error("Only admins can remove users.");
      return;
    }
    if (!confirm(`Remove ${row.name}'s access? Their profile will be deleted, but you'll need to remove the login account separately from Firebase Console.`)) return;
    try {
      await deleteDoc(doc(db, "users", row.uid));
      if (row.username) {
        await deleteDoc(doc(db, "usernames", row.username));
      }
      toast.success("User profile removed.");
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
    ...(isAdmin
      ? [
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
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage staff accounts and role-based access."
        actions={isAdmin ? <Button icon={FiPlus} onClick={open}>Add User</Button> : null}
      />
      <Card>
        {loading ? <Loader label="Loading users..." /> : (
          <DataTable columns={columns} data={users} searchPlaceholder="Search users..." emptyTitle="No users yet" emptyDescription="Add your team members to grant them access." />
        )}
      </Card>

      {isAdmin && (
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
      )}
    </div>
  );
}