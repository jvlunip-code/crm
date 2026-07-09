import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconFlask = React.memo(
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
      <g clipPath="url(#flask_svg__a)">
        <path
          d="M15.923 2v2h-.98v3.243c0 1.157.246 2.301.721 3.352l4.2 9.276a1.53 1.53 0 01-.096 1.437 1.5 1.5 0 01-.533.508 1.45 1.45 0 01-.706.184H5.472a1.45 1.45 0 01-.707-.184c-.217-.121-.4-.296-.533-.508a1.52 1.52 0 01-.096-1.437l4.2-9.276a8.1 8.1 0 00.721-3.352V4h-.98V2zm-2.562 8.001H10.64a10 10 0 01-.367 1.071l-.155.361L6.237 20h11.525l-3.879-8.567a10 10 0 01-.522-1.432M11.02 7.243q0 .38-.028.758h2.018a10 10 0 01-.02-.364l-.008-.394V4h-1.962z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="flask_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
