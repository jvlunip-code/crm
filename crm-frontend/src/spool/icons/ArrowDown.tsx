import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconArrowDown = React.memo(
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
      <g clipPath="url(#arrow-down_svg__a)">
        <path
          d="m13 16.172 5.364-5.364 1.414 1.414L12 20l-7.778-7.778 1.414-1.414L11 16.172V4h2z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="arrow-down_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
