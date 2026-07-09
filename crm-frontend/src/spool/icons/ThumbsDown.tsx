import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconThumbsDown = React.memo(
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
      <mask id="thumbs-down_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#thumbs-down_svg__a)">
        <path
          d="M6 3h11v13l-7 7-1.25-1.25a1.3 1.3 0 01-.287-.475 1.6 1.6 0 01-.113-.575v-.35L9.45 16H3q-.8 0-1.4-.6T1 14v-2q0-.175.05-.375t.1-.375l3-7.05q.225-.5.75-.85T6 3m9 2H6l-3 7v2h9l-1.35 5.5L15 15.15zm2 11v-2h3V5h-3V3h5v13z"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
