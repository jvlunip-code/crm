/**
 * Spool design system ported from @trialspark/spool for the CRM.
 * Basic primitives (typography, button, card, icons) live here so they can
 * be reused directly; `components/ui/button` and `components/ui/card`
 * re-export from this folder for backwards compatibility.
 */
export { Svg, type SvgProps, type SvgClassType, type IconClassType } from './svg';
export * from './text';
export { Button, buttonVariants, type ButtonProps } from './button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from './card';
export * from './icons';
