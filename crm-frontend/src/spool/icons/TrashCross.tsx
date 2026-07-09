import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconTrashCross = React.memo(
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
      <mask id="trash-cross_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#trash-cross_svg__a)">
        <path
          d="M9.418 16.584 12 14.002l2.582 2.582 1.502-1.502-2.582-2.582 2.582-2.582-1.502-1.502L12 10.998 9.418 8.416 7.916 9.918l2.582 2.582-2.582 2.582zm-2.484 4.62q-.944 0-1.61-.666a2.2 2.2 0 01-.665-1.61V6.066H3.522V3.79h5.34V2.653h6.264v1.138h5.352v2.275h-1.137v12.862q0 .945-.665 1.61-.666.665-1.61.665zM17.066 6.065H6.934v12.862h10.132z"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
