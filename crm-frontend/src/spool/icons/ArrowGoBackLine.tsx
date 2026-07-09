import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconArrowGoBackLine = React.memo(
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
      <g clipPath="url(#arrow-go-back-line_svg__a)">
        <path
          d="m5.828 7.965 2.536 2.542-1.414 1.418L2 6.962 6.95 2l1.414 1.418L5.828 5.96H13a8 8 0 015.657 2.349 8.03 8.03 0 010 11.342A8 8 0 0113 22H4v-2.005h9a6 6 0 004.243-1.762 6.02 6.02 0 000-8.506A6 6 0 0013 7.965z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="arrow-go-back-line_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
