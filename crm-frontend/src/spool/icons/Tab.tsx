import React from 'react';
import { Svg, type SvgProps } from '../svg';
export const IconTab = React.memo(
  React.forwardRef((props: SvgProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg viewBox="0 0 10 16" fill="none" width="24" height="24" ref={ref} {...props}>
      <circle cx={2} cy={2} r={2} fill="#535E6D" />
      <circle cx={8} cy={2} r={2} fill="#535E6D" />
      <circle cx={2} cy={8} r={2} fill="#535E6D" />
      <circle cx={2} cy={14} r={2} fill="#535E6D" />
      <circle cx={8} cy={8} r={2} fill="#535E6D" />
      <circle cx={8} cy={14} r={2} fill="#535E6D" />
    </Svg>
  )),
);
