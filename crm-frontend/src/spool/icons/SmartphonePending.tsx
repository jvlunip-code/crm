import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconSmartphonePending = React.memo(
  React.forwardRef(({ title, titleId, ...props }: GraphicProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg
      viewBox="0 0 19 22"
      fill="none"
      width="24"
      height="24"
      ref={ref}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M2.81 22h10c1.1 0 2-.9 2-2v-5h-2v4h-10V3h10v4h2V2c0-1.1-.9-2-2-2h-10c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2"
        fill="currentColor"
      />
      <path d="M11 10H9v2h2zM15 10h-2v2h2zM19 10h-2v2h2z" fill="currentColor" />
    </Svg>
  )),
);
