import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconNotification = React.memo(
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
      <mask id="notification_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#notification_svg__a)">
        <path
          d="M3.797 19.203v-2.275h1.928v-6.796q0-2.154 1.283-3.84 1.282-1.687 3.355-2.206v-.652q0-.682.477-1.16A1.58 1.58 0 0112 1.797q.682 0 1.16.477.477.478.477 1.16v.652q2.079.519 3.358 2.203 1.28 1.683 1.28 3.843v6.796h1.928v2.275zm8.209 3.066q-.855 0-1.463-.607a1.99 1.99 0 01-.609-1.459h4.138q0 .855-.607 1.46-.607.606-1.459.606M8 16.929h8v-6.797q0-1.65-1.175-2.825T12 6.132 9.175 7.307 8 10.132z"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
