import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconInventory = React.memo(
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
      <mask id="inventory_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#inventory_svg__a)">
        <path
          d="M5 22q-.825 0-1.413-.587A1.93 1.93 0 013 20.001V8.726q-.45-.275-.725-.713A1.86 1.86 0 012 7.001V4q0-.825.587-1.413A1.93 1.93 0 014 2.001h16q.825 0 1.412.587.588.588.588 1.413v3q0 .574-.276 1.012-.275.438-.724.713V20q0 .825-.588 1.412a1.93 1.93 0 01-1.412.588zM5 9v11h14V9zM4 7h16V4H4zm5 7h6v-2H9z"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
