import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconCalendarDotted = React.memo(
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
      <g clipPath="url(#calendar-dotted_svg__a)">
        <path
          d="M17 4h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4V2h2v2h6V2h2zm3 8H4v8h16zm-5-6H9v2H7V6H4v4h16V6h-3v2h-2zm-9 8h2v2H6zm5 0h2v2h-2zm5 0h2v2h-2z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="calendar-dotted_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
