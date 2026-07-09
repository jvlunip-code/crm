import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconChevronRight = React.memo(
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
      <g clipPath="url(#chevron-right_svg__a)">
        <path
          d="m13.172 12-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="chevron-right_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
