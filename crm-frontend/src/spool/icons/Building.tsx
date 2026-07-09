import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconBuilding = React.memo(
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
      <g clipPath="url(#building_svg__a)">
        <path
          d="M21 19h2v2H1v-2h2V4a1 1 0 011-1h10a1 1 0 011 1v15h4v-8h-2V9h3a1 1 0 011 1zM5 5v14h8V5zm2 6h4v2H7zm0-4h4v2H7z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="building_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
