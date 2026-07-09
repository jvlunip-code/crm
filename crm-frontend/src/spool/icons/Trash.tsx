import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconTrash = React.memo(
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
      <mask id="trash_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#trash_svg__a)">
        <path
          d="M6.934 21.203q-.944 0-1.61-.665a2.2 2.2 0 01-.665-1.61V6.066H3.522V3.79h5.34V2.653h6.264v1.138h5.352v2.275h-1.137v12.862q0 .945-.665 1.61-.666.665-1.61.665zM17.066 6.066H6.934v12.862h10.132zM8.892 16.994h2.138v-9H8.892zm4.078 0h2.138v-9H12.97z"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
