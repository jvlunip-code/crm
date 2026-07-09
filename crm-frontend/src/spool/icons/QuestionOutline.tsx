import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconQuestionOutline = React.memo(
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
      <mask
        id="question-outline_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#question-outline_svg__a)">
        <path
          d="M11.932 18q.55 0 .932-.383a1.27 1.27 0 00.384-.934q0-.55-.384-.929a1.27 1.27 0 00-.932-.38q-.55 0-.932.38a1.26 1.26 0 00-.384.93q0 .549.384.933.383.383.932.383m-.966-3.85h1.97q0-.8.19-1.282.191-.48 1.036-1.282a7 7 0 001.004-1.223q.372-.597.372-1.435 0-1.422-1.013-2.181t-2.413-.759q-1.45 0-2.366.78a4.13 4.13 0 00-1.28 1.866l1.782.692q.137-.462.56-.981.422-.52 1.274-.52.729 0 1.098.408.37.407.37.897 0 .47-.29.899a3.7 3.7 0 01-.7.767q-1.075.963-1.335 1.484-.259.521-.259 1.87M12 22.203a9.95 9.95 0 01-3.984-.803 10.3 10.3 0 01-3.237-2.18 10.3 10.3 0 01-2.18-3.236A9.95 9.95 0 011.798 12q0-2.122.803-3.984A10.3 10.3 0 014.78 4.78 10.3 10.3 0 018.015 2.6 9.95 9.95 0 0112 1.798q2.122 0 3.984.803 1.86.802 3.237 2.18a10.3 10.3 0 012.18 3.236A9.95 9.95 0 0122.202 12a9.95 9.95 0 01-.803 3.984 10.3 10.3 0 01-2.18 3.237 10.3 10.3 0 01-3.236 2.18 9.95 9.95 0 01-3.984.802m0-2.275q3.326 0 5.627-2.3 2.301-2.302 2.301-5.628t-2.3-5.627T12 4.072t-5.627 2.3Q4.072 8.675 4.072 12t2.3 5.627Q8.675 19.928 12 19.928"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
