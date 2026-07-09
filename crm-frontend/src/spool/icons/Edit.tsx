import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconEdit = React.memo(
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
      <g clipPath="url(#edit_svg__a)">
        <path
          d="M6.414 15.991 16.556 5.834l-1.414-1.416L5 14.575v1.416zm.829 2.003H3v-4.25l11.435-11.45a1 1 0 011.414 0l2.829 2.832a1 1 0 010 1.416zM3 19.997h18V22H3z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="edit_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
