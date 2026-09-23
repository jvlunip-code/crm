import { Toaster as Sonner, type ToasterProps } from 'sonner';
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react';

/**
 * Toasts on the overlay surface. The app ships light only (see index.css), so
 * the theme is pinned — letting sonner follow the OS would render dark toasts
 * on a light console.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-status-success" />,
        info: <InfoIcon className="size-4 text-status-info" />,
        warning: <TriangleAlertIcon className="size-4 text-status-warning" />,
        error: <OctagonXIcon className="size-4 text-status-error" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius-lg)',
          '--font-family': 'var(--font-sans)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast shadow-1! text-[13px]!',
          description: 'text-muted-foreground!',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
