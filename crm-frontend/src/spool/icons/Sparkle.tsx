import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconSparkle = React.memo(
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
      <path
        d="M16.672 10q-2.296.736-4.116 2.556T10 16.672q-.736-2.296-2.556-4.116T3.328 10q2.297-.736 4.116-2.556Q9.264 5.624 10 3.328q.736 2.297 2.556 4.116 1.82 1.82 4.116 2.556Z"
        fill="#1F1F1F"
        stroke="#1F1F1F"
      />
    </Svg>
  )),
);
