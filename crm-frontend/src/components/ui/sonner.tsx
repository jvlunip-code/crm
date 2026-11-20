import { Toaster as Sonner, type ToasterProps } from 'sonner';
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react';

/**
 * Toasts: white, r12, hairline border, shadow-1, 14px text. The app ships
 * light only (see index.css), so the theme is pinned — letting sonner follow
 * the OS would render dark toasts on a light console. Icons use the status
 * inks (the dot hues are too light for small glyphs).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-status-success-fg" />,
        info: <InfoIcon className="size-4 text-status-info-fg" />,
        warning: <TriangleAlertIcon className="size-4 text-status-warning-fg" />,
        error: <OctagonXIcon className="size-4 text-status-error-fg" />,
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
          toast: 'cn-toast border! shadow-1! type-body!',
          description: 'text-muted-foreground!',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
