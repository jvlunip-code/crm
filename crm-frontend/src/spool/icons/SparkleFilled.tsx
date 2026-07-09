import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconSparkleFilled = React.memo(
  React.forwardRef(({ title, titleId, ...props }: GraphicProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg
      viewBox="0 0 20 20"
      fill="none"
      width="24"
      height="24"
      ref={ref}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <circle cx={10} cy={10} r={10} fill="#DADAF6" />
      <mask
        id="sparkle-filled_svg__a"
        maskUnits="userSpaceOnUse"
        x={1}
        y={2}
        width={17}
        height={17}
      >
        <rect x={2.497} y={2.5} width={15} height={15} fill="#D9D9D9" stroke="currentColor" />
      </mask>
      <g mask="url(#sparkle-filled_svg__a)">
        <path
          d="M15.025 10.243q-1.692.612-3.054 1.973-1.36 1.362-1.974 3.055-.613-1.693-1.974-3.055-1.362-1.36-3.054-1.973 1.692-.614 3.054-1.974 1.361-1.362 1.974-3.055.614 1.693 1.974 3.055 1.362 1.36 3.054 1.974Z"
          fill="#1F1F1F"
          stroke="#1F1F1F"
        />
      </g>
    </Svg>
  )),
);
