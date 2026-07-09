import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconDownload = React.memo(
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
      <mask id="download_svg__a" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#download_svg__a)">
        <path
          d="m12 15.928-5.287-5.287L8.31 9.006l2.553 2.558V3.797h2.274v7.767l2.553-2.558 1.597 1.635zm-5.928 4.275q-.945 0-1.61-.665a2.2 2.2 0 01-.665-1.61v-3h2.275v3h11.856v-3h2.275v3q0 .945-.665 1.61t-1.61.665z"
          fill="#1F1F1F"
        />
      </g>
    </Svg>
  )),
);
