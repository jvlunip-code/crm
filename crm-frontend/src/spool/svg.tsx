import * as React from 'react';

/**
 * Plain replacement for spool's styled-system `Svg`. Supports the subset of
 * styled-system props the generated icons and callers actually use
 * (`color`, `ml`, `mr`) so icon files ported from spool work unchanged.
 */
export type SvgProps = Omit<React.SVGProps<SVGSVGElement>, 'color'> & {
  color?: string;
  ml?: number | string;
  mr?: number | string;
};

export const Svg = React.forwardRef<SVGSVGElement, SvgProps>(
  ({ color, ml, mr, style, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        ...(color !== undefined && { color }),
        ...(ml !== undefined && { marginLeft: ml }),
        ...(mr !== undefined && { marginRight: mr }),
        ...style,
      }}
      {...props}
    />
  ),
);
Svg.displayName = 'Svg';

export type SvgClassType = React.ComponentType<SvgProps>;

/** Same as `SvgClassType` but semantically indicates that a spool icon should be used. */
export type IconClassType = SvgClassType;
