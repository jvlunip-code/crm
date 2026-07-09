import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconAsterisk = React.memo(
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
      <mask id="asterisk_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#asterisk_svg__a)">
        <path
          d="M11 21v-6.6l-4.65 4.675-1.425-1.425L9.6 13H3v-2h6.6L4.925 6.35 6.35 4.925 11 9.6V3h2v6.6l4.65-4.675 1.425 1.425L14.4 11H21v2h-6.6l4.675 4.65-1.425 1.425L13 14.4V21z"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
