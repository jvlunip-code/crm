import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconCallEnd = React.memo(
  React.forwardRef(({ title, titleId, ...props }: GraphicProps, ref: React.Ref<SVGSVGElement>) => (
    <Svg
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      ref={ref}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <defs>
        <path
          id="call-end_svg__a"
          d="M13.986 9.174c-.506-.168-1.23-.265-1.989-.265-.758 0-1.482.097-1.987.265-.22.073-.38.154-.466.226v.736c0 .455-.01.686-.068.963-.123.589-.45 1.044-1.078 1.08-1.65.275-2.754.412-3.353.412C3.853 12.59 3 11.525 3 10.545V9.318C3 6.271 7.113 3.998 11.998 4c4.886.001 8.997 2.272 8.997 5.296.003.136.005.277.005.436 0 .115 0 .207-.003.412l-.002.401c0 .974-.854 2.046-2.045 2.046-.599 0-1.7-.137-3.349-.41-.86-.036-1.097-.666-1.142-1.6a8 8 0 01-.008-.444V9.4c-.085-.071-.245-.152-.465-.226m-6.078.962v-.818c0-1.445 1.805-2.046 4.09-2.045s4.09.6 4.09 2.045v.818a7 7 0 00.012.468c1.432.234 2.395.35 2.85.35.195 0 .409-.268.409-.409 0-.116 0-.209.002-.416l.003-.398c0-.144-.002-.27-.005-.413 0-1.88-3.259-3.68-7.362-3.682-4.101 0-7.36 1.8-7.36 3.682v1.227c0 .146.21.41.408.41.455 0 1.418-.117 2.85-.351.01-.11.013-.254.013-.468m3.274 5.798v-4.57h1.636v4.57l1.876-1.876 1.157 1.157L12 19.066l-3.851-3.851 1.157-1.157z"
        />
      </defs>
      <g fill="none" fillRule="evenodd">
        <mask id="call-end_svg__b" fill="#fff">
          <use xlinkHref="#call-end_svg__a" />
        </mask>
        <use fill="currentColor" xlinkHref="#call-end_svg__a" />
        <g fill="currentColor" fillRule="nonzero" mask="url(#call-end_svg__b)">
          <path d="M0 0h24v24H0z" />
        </g>
      </g>
    </Svg>
  )),
);
