import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconThumbsUp = React.memo(
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
      <mask id="thumbs-up_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#thumbs-up_svg__a)">
        <path
          d="M18 21H7V8l7-7 1.25 1.25q.176.175.287.475.113.3.113.575v.35L14.55 8H21q.8 0 1.4.6T23 10v2q0 .175-.05.375t-.1.375l-3 7.05q-.225.5-.75.85T18 21m-9-2h9l3-7v-2h-9l1.35-5.5L9 8.85zM7 8v2H4v9h3v2H2V8z"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
