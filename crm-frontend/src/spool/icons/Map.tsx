import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconMap = React.memo(
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
      <g clipPath="url(#map_svg__a)">
        <path
          d="m2 5 7-3 6 3 6.303-2.701a.5.5 0 01.697.46V19l-7 3-6-3-6.303 2.701a.5.5 0 01-.697-.46zm14 14.395 4-1.714V5.033l-4 1.714zm-2-.131V6.736l-4-2v12.528zm-6-2.011V4.605L4 6.319v12.648z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="map_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
