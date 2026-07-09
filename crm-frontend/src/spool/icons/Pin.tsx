import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconPin = React.memo(
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
      <g clipPath="url(#pin_svg__a)">
        <path
          d="m12 22-5.657-5.858a8.4 8.4 0 01-2.19-4.242 8.56 8.56 0 01.456-4.786 8.23 8.23 0 012.946-3.718A7.8 7.8 0 0112 2c1.582 0 3.129.486 4.445 1.396a8.23 8.23 0 012.946 3.718 8.56 8.56 0 01.455 4.786 8.4 8.4 0 01-2.19 4.242zm4.4-7.16a6.5 6.5 0 001.703-3.299 6.66 6.66 0 00-.355-3.722 6.4 6.4 0 00-2.291-2.892A6.07 6.07 0 0012 3.841c-1.23 0-2.434.378-3.457 1.086A6.4 6.4 0 006.251 7.82a6.66 6.66 0 00-.354 3.722 6.5 6.5 0 001.703 3.3l4.4 4.556zM12 12.126c-.472 0-.924-.194-1.257-.54a1.88 1.88 0 01-.52-1.3c0-.49.186-.957.52-1.303.333-.345.785-.539 1.257-.539s.924.194 1.257.54c.334.345.52.813.52 1.301s-.186.957-.52 1.302c-.333.345-.785.54-1.257.54"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="pin_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
