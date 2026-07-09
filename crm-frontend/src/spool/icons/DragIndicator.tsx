import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconDragIndicator = React.memo(
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
        d="M9.941 17.457q-.576 0-.987-.41a1.35 1.35 0 01-.41-.988q0-.577.41-.985.411-.407.987-.407t.985.407.407.985-.407.987q-.408.41-.985.41m4.12 0q-.575 0-.985-.41a1.35 1.35 0 01-.41-.988q0-.577.41-.985.409-.407.984-.407.576 0 .987.407.41.408.41.985 0 .576-.41.987-.41.41-.985.41m-4.12-4.064q-.576 0-.987-.41a1.34 1.34 0 01-.41-.983q0-.578.41-.985.411-.408.987-.408t.985.408.407.983q0 .575-.407.986-.408.41-.985.41m4.12 0q-.575 0-.985-.41a1.34 1.34 0 01-.41-.983q0-.578.41-.985.409-.408.984-.408.576 0 .987.408.41.407.41.983 0 .575-.41.986-.41.41-.985.41m-4.12-4.06q-.576 0-.987-.409-.41-.409-.41-.984 0-.576.41-.987.411-.41.987-.41t.985.41.407.985-.407.986-.985.41m4.12 0q-.575 0-.985-.409a1.34 1.34 0 01-.41-.984q0-.576.41-.987.409-.41.984-.41.576 0 .987.41.41.41.41.985 0 .576-.41.986t-.985.41"
        fill="#1C1B1F"
      />
    </Svg>
  )),
);
