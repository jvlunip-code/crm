import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconAccount = React.memo(
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
      <g clipPath="url(#account_svg__a)">
        <path
          d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10m-4.987-3.744A7.97 7.97 0 0012 20a7.97 7.97 0 005.167-1.892A6.98 6.98 0 0012.16 16a6.98 6.98 0 00-5.147 2.256M5.616 16.82A8.98 8.98 0 0112.16 14a8.97 8.97 0 016.362 2.634 8 8 0 10-12.906.187zM12 13a4 4 0 110-8 4 4 0 010 8m0-2a2 2 0 100-4 2 2 0 000 4"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="account_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
