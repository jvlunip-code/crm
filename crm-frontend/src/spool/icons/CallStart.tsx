import React from 'react';
import { Svg, type SvgProps } from '../svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export type GraphicProps = SvgProps & SVGRProps;
export const IconCallStart = React.memo(
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
          id="call-start_svg__a"
          d="M11.183 7.404c.468.52.32 1.108-.095 1.667a4 4 0 01-.348.406c-.066.07-.117.121-.224.228l-.613.614c-.08.08.468 1.177 1.533 2.242 1.064 1.066 2.16 1.615 2.24 1.534l.614-.614c.337-.337.516-.5.762-.662.51-.335 1.067-.426 1.537-.006 1.534 1.098 2.402 1.77 2.827 2.213.83.861.72 2.188.005 2.945-.249.262-.563.577-.935.935-2.25 2.25-6.996.881-10.633-2.76C4.214 12.504 2.845 7.757 5.09 5.512c.403-.41.536-.543.928-.93.73-.719 2.118-.832 2.962.002.443.438 1.15 1.348 2.203 2.82m4.237 7.209-.613.613c-1.042 1.043-2.816.154-4.502-1.534-1.687-1.688-2.575-3.462-1.532-4.505l.809-.813a3 3 0 00.182-.205c-.932-1.298-1.566-2.11-1.908-2.447-.176-.174-.571-.142-.716 0-.387.382-.514.509-.915.917-1.444 1.444-.339 5.276 2.759 8.376 3.096 3.1 6.927 4.205 8.382 2.75q.55-.53.893-.894c.166-.176.196-.537.005-.736-.318-.33-1.096-.937-2.44-1.902a6 6 0 00-.404.38"
        />
      </defs>
      <g fill="none" fillRule="evenodd">
        <mask id="call-start_svg__b" fill="#fff">
          <use xlinkHref="#call-start_svg__a" />
        </mask>
        <use fill="currentColor" xlinkHref="#call-start_svg__a" />
        <g fill="currentColor" fillRule="nonzero" mask="url(#call-start_svg__b)">
          <path d="M0 0h24v24H0z" />
        </g>
      </g>
    </Svg>
  )),
);
