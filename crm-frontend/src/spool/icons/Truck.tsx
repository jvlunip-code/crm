import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconTruck = React.memo(
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
      <g clipPath="url(#truck_svg__a)">
        <path
          d="M8.965 17.995A3.5 3.5 0 015.5 21a3.5 3.5 0 01-3.465-3.005H1V6a1 1 0 011-1h14a1 1 0 011 1v1.999h3l3 4.054v5.942h-2.035a3.498 3.498 0 01-5.759 2.149 3.5 3.5 0 01-1.171-2.15zM15 6.999H3v8.047a3.5 3.5 0 015.663.95h5.674c.168-.353.393-.674.663-.95zm2 5.998h4v-.285l-2.008-2.714H17zm.5 5.997a1.5 1.5 0 100-3 1.5 1.5 0 000 3M7 17.496a1.499 1.499 0 10-2.998 0 1.499 1.499 0 002.998 0"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="truck_svg__a">
          <rect width={24} height={24} fill="white" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
