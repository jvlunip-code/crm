import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconVerified = React.memo(
  React.forwardRef(({ title, titleId, ...props }: GraphicProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg
      viewBox="0 0 16 16"
      fill="none"
      width="24"
      height="24"
      ref={ref}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M5.527 15.636 4.145 13.31l-2.618-.582.255-2.69L0 8l1.782-2.036-.255-2.691 2.618-.582L5.527.364 8 1.418 10.473.364l1.381 2.327 2.619.582-.255 2.69L16 8l-1.782 2.036.255 2.691-2.619.582-1.381 2.327L8 14.582zm.618-1.854 1.855-.8 1.89.8 1.02-1.746 2-.472-.183-2.037L14.073 8l-1.346-1.564.182-2.036-2-.436-1.054-1.746-1.855.8-1.89-.8-1.02 1.746-2 .436.183 2.036L1.927 8l1.346 1.527L3.09 11.6l2 .436zm1.091-3.2 4.11-4.11-1.019-1.054-3.09 3.091-1.564-1.527L4.655 8z"
        fill="#373737"
      />
    </Svg>
  )),
);
