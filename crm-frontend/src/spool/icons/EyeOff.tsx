import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconEyeOff = React.memo(
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
      <g clipPath="url(#eye-off_svg__a)">
        <path
          d="M17.882 19.297A10.95 10.95 0 0112 21c-5.392 0-9.878-3.88-10.819-9a11 11 0 013.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.97 8.97 0 003.223 12a9.005 9.005 0 0013.201 5.838l-2.028-2.028A4.5 4.5 0 018.19 9.604zm6.979 6.978-3.242-3.242a2.5 2.5 0 003.241 3.241zm7.893 2.264-1.431-1.43A8.9 8.9 0 0020.777 12 9.004 9.004 0 009.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.95 10.95 0 01-2.012 4.592m-9.084-9.084a4.5 4.5 0 014.769 4.769l-4.77-4.769z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="eye-off_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
