import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconStickynoteAdd = React.memo(
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
      <g clipPath="url(#stickynote-add_svg__a)">
        <path
          d="M5.763 17H20V5H4v13.385zm.692 2L2 22.5V4a1 1 0 011-1h18a1 1 0 011 1v14a1 1 0 01-1 1z"
          fill="currentColor"
        />
        <path d="M11 7v3H8v2h3v3h2v-3h3v-2h-3V7z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="stickynote-add_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
