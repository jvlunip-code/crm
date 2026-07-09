import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconArrowGoForwardLine = React.memo(
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
      <g clipPath="url(#arrow-go-forward-line_svg__a)">
        <path
          d="M18.172 7.965H11a6 6 0 00-4.243 1.762 6.023 6.023 0 000 8.506A6 6 0 0011 19.995h9V22h-9a8 8 0 01-5.657-2.349 8.03 8.03 0 010-11.342A8 8 0 0111 5.959h7.172l-2.536-2.541L17.05 2 22 6.962l-4.95 4.963-1.414-1.418z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="arrow-go-forward-line_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
