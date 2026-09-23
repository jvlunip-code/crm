/**
 * Route → breadcrumb trail for the site header. Labels are the same words the
 * sidebar uses; dynamic segments (a customer) get their generic noun — the
 * page header below shows the actual name.
 */
export interface Crumb {
  label: string;
  to?: string;
}

const HOME: Crumb = { label: 'Painel', to: '/' };

const SECTIONS: Record<string, string> = {
  customers: 'Clientes',
  services: 'Serviços',
  notifications: 'Notificações',
  events: 'Eventos',
};

export function breadcrumbsFor(pathname: string): Crumb[] {
  const [section, id] = pathname.split('/').filter(Boolean);

  if (!section) return [{ label: HOME.label }];

  const label = SECTIONS[section];
  if (!label) return [HOME];

  const crumbs: Crumb[] = [HOME, { label, to: `/${section}` }];
  if (section === 'customers' && id) crumbs.push({ label: 'Cliente' });
  return finish(crumbs);
}

/** The last crumb is the current page: no link. */
function finish(crumbs: Crumb[]): Crumb[] {
  return crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c));
}
