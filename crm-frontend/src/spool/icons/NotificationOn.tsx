import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconNotificationOn = React.memo(
  React.forwardRef(({ title, titleId, ...props }: GraphicProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg
      viewBox="0 0 32 29"
      fill="none"
      width="24"
      height="24"
      ref={ref}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <g clipPath="url(#notification-on_svg__a)">
        <path
          d="M18 14a6 6 0 10-12 0v8h12zm2 8.667.4.533a.5.5 0 01-.4.8H4a.5.5 0 01-.4-.8l.4-.533V14a8 8 0 0116 0zM9.5 25h5a2.5 2.5 0 01-5 0"
          fill="currentColor"
        />
      </g>
      <g filter="url(#notification-on_svg__b)">
        <rect x={12} y={2} width={16} height={16} rx={8} fill="#DF3232" />
      </g>
      <defs>
        <filter
          id="notification-on_svg__b"
          x={8}
          y={0}
          width={24}
          height={24}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_25_7874" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_25_7874"
            result="shape"
          />
        </filter>
        <clipPath id="notification-on_svg__a">
          <rect width={24} height={24} fill="white" transform="translate(0 4)" />
        </clipPath>
      </defs>
    </Svg>
  )),
);
