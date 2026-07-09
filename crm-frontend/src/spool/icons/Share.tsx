import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconShare = React.memo(
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
      <g clipPath="url(#share_svg__a)">
        <path
          d="M13 14h-2a9 9 0 00-7.968 4.81Q3 18.405 3 18C3 12.477 7.477 8 13 8V2.5L23.5 11 13 19.5zm-2-2h4v3.308L20.321 11 15 6.692V10h-2a7.98 7.98 0 00-6.057 2.773A11 11 0 0111 12"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="share_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
