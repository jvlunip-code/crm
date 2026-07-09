import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconHome = React.memo(
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
      <g mask="url(#home_svg__mask0_4046_1949)">
        <path
          d="M6.072 18.928h2.79v-6.065h6.275v6.065h2.791v-8.892L12 5.59l-5.928 4.446zm-2.275 2.275V8.898L12 2.743l8.203 6.153v12.307h-7.25v-6.155h-1.905v6.155z"
          fill="#1F1F1F"
        />
      </g>
    </Svg>
  )),
);
