import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconCalendarCross = React.memo(
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
      <g clipPath="url(#calendar-cross_svg__a)">
        <path
          d="M9 2v2h6V2h2v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4V2zm11 9H4v9h16zM7 6H4v3h16V6h-3v1h-2V6H9v1H7z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m15.707 17.626-2.333-2.333 2.333-2.333-1.373-1.374L12 13.919l-2.333-2.333-1.374 1.374 2.333 2.333-2.333 2.333L9.667 19 12 16.667 14.334 19z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="calendar-cross_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
