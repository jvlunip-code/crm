import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconUndoArrow = React.memo(
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
      <path
        d="M6.72 12.665c1.397-1.252 3.21-2.022 5.212-2.022 3.512 0 6.025 2.357 7.068 5.616l-1.783.606c-.793-2.48-2.603-4.277-5.285-4.277-1.473 0-2.818.56-3.868 1.462l2.735 2.815H4v-7z"
        fill="currentColor"
      />
    </Svg>
  )),
);
