import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Plus } from 'lucide-react';

import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { CustomerDialog } from '@/components/customer/CustomerDialog';
import { DashboardKpis } from '@/components/dashboard/DashboardKpis';
import { EndingByMonthCard } from '@/components/dashboard/EndingByMonthCard';
import { OperatorsCard } from '@/components/dashboard/OperatorsCard';
import { EndingSoonTable } from '@/components/dashboard/EndingSoonTable';
import { UnreadNotificationsCard } from '@/components/dashboard/UnreadNotificationsCard';
import { formatTodayLong, greetingFor } from '@/components/dashboard/format';
import { useAuth } from '@/hooks/use-auth';

/**
 * Painel (DESIGN.md, PLAN.md P3): greeting header, the KPI row, then two 2:1
 * rows — services ending by month + operators, and the next services to end
 * + unread notifications. Everything shown is real data from the summary,
 * services and notifications APIs.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const now = new Date();
  const name = user ? user.firstName?.trim() || user.username : '';
  const greeting = greetingFor(now);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={formatTodayLong(now)}
        title={name ? `${greeting}, ${name}` : greeting}
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to="/services?ending=90">
                <CalendarClock aria-hidden />
                Ver serviços a terminar
              </Link>
            </Button>
            <Button onClick={() => setCustomerDialogOpen(true)}>
              <Plus aria-hidden />
              Novo cliente
            </Button>
          </>
        }
      />

      <DashboardKpis />

      <div className="flex flex-wrap gap-4">
        <EndingByMonthCard />
        <OperatorsCard />
      </div>

      <div className="flex flex-wrap gap-4">
        <EndingSoonTable />
        <UnreadNotificationsCard />
      </div>

      <CustomerDialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen} />
    </PageContainer>
  );
}
