import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconCalendarCheck = React.memo(
  React.forwardRef(({ title, titleId, ...props }: GraphicProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      width="24"
      height="24"
      ref={ref}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <g clipPath="url(#calendar-check_svg__a)">
        <path
          d="M9 2v2h6V2h2v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4V2zm11 9H4v9h16zm-4.964 1.136 1.414 1.414-4.95 4.95-3.536-3.536L9.38 13.55l2.121 2.122 3.536-3.536zM7 6H4v3h16V6h-3v1h-2V6H9v1H7z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="calendar-check_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
