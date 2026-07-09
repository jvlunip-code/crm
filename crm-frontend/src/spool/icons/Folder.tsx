import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconFolder = React.memo(
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
      <g mask="url(#folder_svg__mask0_4043_56490)">
        <path
          d="M4.072 20.203q-.945 0-1.61-.665a2.2 2.2 0 01-.665-1.61V6.072q0-.945.665-1.61t1.61-.665H9.91L12 5.887h7.928q.945 0 1.61.665t.665 1.61v9.766q0 .945-.665 1.61t-1.61.665zm0-2.275h15.856V8.161h-8.867l-2.09-2.09h-4.9z"
          fill="#1F1F1F"
        />
      </g>
    </Svg>
  )),
);
