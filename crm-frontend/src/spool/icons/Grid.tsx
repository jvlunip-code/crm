import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconGrid = React.memo(
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
      <g clipPath="url(#grid_svg__a)">
        <path
          d="M14 10v4h-4v-4zm2 0h5v4h-5zm-2 11h-4v-5h4zm2 0v-5h5v4a1 1 0 01-1 1zM14 3v5h-4V3zm2 0h4a1 1 0 011 1v4h-5zm-8 7v4H3v-4zm0 11H4a1 1 0 01-1-1v-4h5zM8 3v5H3V4a1 1 0 011-1z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="grid_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
