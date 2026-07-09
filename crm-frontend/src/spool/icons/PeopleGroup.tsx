import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconPeopleGroup = React.memo(
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
      <mask id="people-group_svg__a" maskUnits="userSpaceOnUse" x={0} y={0} width={24} height={24}>
        <rect width={24} height={24} fill="#D9D9D9" />
      </mask>
      <g mask="url(#people-group_svg__a)">
        <path
          d="M.815 20.305V17.29q0-.906.468-1.665a3.1 3.1 0 011.245-1.159q1.569-.78 3.192-1.174a14.108 14.108 0 016.608-.003q1.623.39 3.18 1.171.775.399 1.245 1.156.468.758.468 1.673v3.016zm18.496 0v-3.197q0-1.125-.607-2.167-.606-1.042-1.75-1.857a12.7 12.7 0 014.316 1.376q.924.5 1.42 1.18t.495 1.486v3.179zM9.018 11.898q-1.698 0-2.9-1.201-1.202-1.203-1.202-2.9 0-1.698 1.202-2.9t2.9-1.202 2.9 1.202 1.202 2.9-1.202 2.9q-1.203 1.2-2.9 1.201M19.31 7.797q0 1.691-1.205 2.897-1.204 1.204-2.896 1.204a5 5 0 01-.7-.065 6 6 0 01-.719-.153 5.982 5.982 0 001.418-3.883 6 6 0 00-1.418-3.884q.357-.13.706-.174.35-.045.71-.044 1.692 0 2.898 1.205t1.206 2.897M3.09 18.03h11.856v-.71a.9.9 0 00-.137-.49.96.96 0 00-.363-.342 13 13 0 00-2.671-.983 11.6 11.6 0 00-2.757-.332q-1.388 0-2.757.332-1.37.33-2.671.982a.97.97 0 00-.363.343.9.9 0 00-.137.49zm5.927-8.317q.79 0 1.354-.563.563-.563.563-1.352t-.562-1.354a1.84 1.84 0 00-1.353-.564q-.79 0-1.354.563a1.84 1.84 0 00-.563 1.353q0 .79.562 1.353.563.564 1.353.564"
          fill="currentColor"
        />
      </g>
    </Svg>
  )),
);
