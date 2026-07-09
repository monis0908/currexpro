import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import { useCollection } from "../hooks/useCollection";
import { activityLogService } from "../services/activityLogService";

export default function SettingsActivityLogs() {
  const { data: logs } = useCollection(
    activityLogService,
    [activityLogService.orderBy("createdAt", "desc"), activityLogService.limit(200)],
    []
  );

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (r) => (r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "—"),
    },
    { key: "userName", label: "User" },
    { key: "action", label: "Action" },
    { key: "details", label: "Details" },
  ];

  return (
    <div>
      <PageHeader title="Activity Logs" description="A complete audit trail of actions taken across the system." />
      <Card>
        <DataTable columns={columns} data={logs} searchPlaceholder="Search activity..." pageSize={12} emptyTitle="No activity yet" emptyDescription="Actions taken by your team will be logged here." />
      </Card>
    </div>
  );
}
