import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconSmartphoneConfirmed = React.memo(
  React.forwardRef(({ title, titleId, ...props }: GraphicProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg
      viewBox="0 0 20 22"
      fill="none"
      width="24"
      height="24"
      ref={ref}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M2.81 22h10c1.1 0 2-.9 2-2v-3h-2v2h-10V3h10v2h2V2c0-1.1-.9-2-2-2h-10c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2"
        fill="currentColor"
      />
      <path
        d="m10.27 9.92 2.55 2.55 5.91-5.93L20 7.81l-3.595 3.595L12.81 15 9 11.19z"
        fill="currentColor"
      />
    </Svg>
  )),
);
