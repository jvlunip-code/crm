import { SectionCards } from '@/components/dashboard/SectionCards';
import { ChartAreaInteractive } from '@/components/dashboard/ChartAreaInteractive';
import { DataTable } from '@/components/dashboard/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

// Sample data for the table with "unread" and "read" status
const data = [
  {
    id: 1,
    header: 'New Customer Registration',
    type: 'Notification',
    status: 'unread',
    target: '24',
    limit: '48',
    reviewer: 'Eddie Lake',
  },
  {
    id: 2,
    header: 'Service Activation Request',
    type: 'Service',
    status: 'unread',
    target: '12',
    limit: '24',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 3,
    header: 'Payment Received',
    type: 'Notification',
    status: 'read',
    target: 'N/A',
    limit: 'N/A',
    reviewer: 'System',
  },
  {
    id: 4,
    header: 'Customer Profile Update',
    type: 'Customer',
    status: 'read',
    target: '1',
    limit: '2',
    reviewer: 'Eddie Lake',
  },
  {
    id: 5,
    header: 'Service Renewal Notice',
    type: 'Service',
    status: 'unread',
    target: '7',
    limit: '14',
    reviewer: 'Assign reviewer',
  },
  {
    id: 6,
    header: 'Support Ticket Created',
    type: 'Notification',
    status: 'unread',
    target: '4',
    limit: '8',
    reviewer: 'Emily Whalen',
  },
  {
    id: 7,
    header: 'Account Deactivation',
    type: 'Customer',
    status: 'read',
    target: '1',
    limit: '3',
    reviewer: 'Eddie Lake',
  },
  {
    id: 8,
    header: 'Service Upgrade Request',
    type: 'Service',
    status: 'unread',
    target: '2',
    limit: '5',
    reviewer: 'Assign reviewer',
  },
  {
    id: 9,
    header: 'Billing Issue Reported',
    type: 'Notification',
    status: 'unread',
    target: '8',
    limit: '16',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 10,
    header: 'New Feature Request',
    type: 'Service',
    status: 'read',
    target: '30',
    limit: '60',
    reviewer: 'Eddie Lake',
  },
  {
    id: 11,
    header: 'Customer Feedback',
    type: 'Customer',
    status: 'read',
    target: '5',
    limit: '10',
    reviewer: 'Assign reviewer',
  },
  {
    id: 12,
    header: 'System Maintenance Alert',
    type: 'Notification',
    status: 'read',
    target: 'N/A',
    limit: 'N/A',
    reviewer: 'System',
  },
  {
    id: 13,
    header: 'Subscription Cancellation',
    type: 'Service',
    status: 'unread',
    target: '1',
    limit: '2',
    reviewer: 'Emily Whalen',
  },
  {
    id: 14,
    header: 'New Lead Added',
    type: 'Customer',
    status: 'unread',
    target: '24',
    limit: '48',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 15,
    header: 'Invoice Generated',
    type: 'Notification',
    status: 'read',
    target: 'N/A',
    limit: 'N/A',
    reviewer: 'System',
  },
];

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Painel"
        description="Visão geral da carteira de clientes, serviços e do que precisa de atenção."
      />
      <div className="@container/main flex flex-col gap-6 py-4">
        <div className="flex flex-col gap-3 px-4 lg:px-6">
          <SectionCards />
          <ChartAreaInteractive />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-4 lg:px-6">
            <h2 className="type-section text-foreground">Secções</h2>
            <StatusBadge tone="warning" dot={false}>
              Dados de demonstração
            </StatusBadge>
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </>
  );
}
