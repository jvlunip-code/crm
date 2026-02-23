import { SectionCards } from '@/components/dashboard/SectionCards'
import { ChartAreaInteractive } from '@/components/dashboard/ChartAreaInteractive'
import { DataTable } from '@/components/dashboard/DataTable'

// Sample data for the table with "unread" and "read" status
const data = [
  {
    id: 1,
    header: "New Customer Registration",
    type: "Notification",
    status: "unread",
    target: "24",
    limit: "48",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Service Activation Request",
    type: "Service",
    status: "unread",
    target: "12",
    limit: "24",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 3,
    header: "Payment Received",
    type: "Notification",
    status: "read",
    target: "N/A",
    limit: "N/A",
    reviewer: "System",
  },
  {
    id: 4,
    header: "Customer Profile Update",
    type: "Customer",
    status: "read",
    target: "1",
    limit: "2",
    reviewer: "Eddie Lake",
  },
  {
    id: 5,
    header: "Service Renewal Notice",
    type: "Service",
    status: "unread",
    target: "7",
    limit: "14",
    reviewer: "Assign reviewer",
  },
  {
    id: 6,
    header: "Support Ticket Created",
    type: "Notification",
    status: "unread",
    target: "4",
    limit: "8",
    reviewer: "Emily Whalen",
  },
  {
    id: 7,
    header: "Account Deactivation",
    type: "Customer",
    status: "read",
    target: "1",
    limit: "3",
    reviewer: "Eddie Lake",
  },
  {
    id: 8,
    header: "Service Upgrade Request",
    type: "Service",
    status: "unread",
    target: "2",
    limit: "5",
    reviewer: "Assign reviewer",
  },
  {
    id: 9,
    header: "Billing Issue Reported",
    type: "Notification",
    status: "unread",
    target: "8",
    limit: "16",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 10,
    header: "New Feature Request",
    type: "Service",
    status: "read",
    target: "30",
    limit: "60",
    reviewer: "Eddie Lake",
  },
  {
    id: 11,
    header: "Customer Feedback",
    type: "Customer",
    status: "read",
    target: "5",
    limit: "10",
    reviewer: "Assign reviewer",
  },
  {
    id: 12,
    header: "System Maintenance Alert",
    type: "Notification",
    status: "read",
    target: "N/A",
    limit: "N/A",
    reviewer: "System",
  },
  {
    id: 13,
    header: "Subscription Cancellation",
    type: "Service",
    status: "unread",
    target: "1",
    limit: "2",
    reviewer: "Emily Whalen",
  },
  {
    id: 14,
    header: "New Lead Added",
    type: "Customer",
    status: "unread",
    target: "24",
    limit: "48",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 15,
    header: "Invoice Generated",
    type: "Notification",
    status: "read",
    target: "N/A",
    limit: "N/A",
    reviewer: "System",
  },
]

export function DashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}
