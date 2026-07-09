import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconDocumentMedical = React.memo(
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
      <g clipPath="url(#document-medical_svg__a)">
        <path
          d="M17 3h3a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h3V1h2v2h6V1h2zm0 2v2h-2V5H9v2H7V5H5v16h14V5z"
          fill="currentColor"
        />
        <path d="M11 9v3H8v2h3v3h2v-3h3v-2h-3V9z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="document-medical_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
