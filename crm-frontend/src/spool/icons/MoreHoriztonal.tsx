import React from 'react';
import { Svg, type SvgProps } from '../svg';
export const IconMoreHoriztonal = React.memo(
  React.forwardRef((props: SvgProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" ref={ref} {...props}>
      <g clipPath="url(#more-horiztonal_svg__a)">
        <path
          d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="more-horiztonal_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
