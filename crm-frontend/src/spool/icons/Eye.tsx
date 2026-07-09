import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconEye = React.memo(
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
      <g clipPath="url(#eye_svg__a)">
        <path
          d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9s-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3m0 16a9.005 9.005 0 008.777-7 9.005 9.005 0 00-17.554 0A9.005 9.005 0 0012 19m0-2.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9m0-2a2.5 2.5 0 100-5 2.5 2.5 0 000 5"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="eye_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
