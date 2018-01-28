import React from 'react';
import { withTheme } from 'react-fela';
import { compose, withPropsOnChange } from 'recompose';

const icon = ({ color, width, height, size, id, className }) => (
  <svg
    width={size || width}
    height={size || height}
    className={className}
    viewBox="0 0 1000 1000"
  >
    <defs>
      <linearGradient
        x1="50%"
        y1="2.91573661%"
        x2="50%"
        y2="97.1938776%"
        id={`${id}-1`}
      >
        <stop stopColor={color} stopOpacity="0.52" offset="0%" />
        <stop stopColor={color} stopOpacity="0.87" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="15.7344472%"
        y1="-2.9713044%"
        x2="50%"
        y2="100%"
        id={`${id}-2`}
      >
        <stop stopColor={color} stopOpacity="0.27" offset="0%" />
        <stop stopColor={color} stopOpacity="0.35" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="82.6809405%"
        y1="0%"
        x2="51.0916226%"
        y2="96.6597577%"
        id={`${id}-3`}
      >
        <stop stopColor={color} stopOpacity="0.30" offset="0%" />
        <stop stopColor={color} stopOpacity="0.77" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="10.3112476%"
        y1="7.34921158%"
        x2="50%"
        y2="100%"
        id={`${id}-4`}
      >
        <stop stopColor={color} stopOpacity="0.13" offset="0%" />
        <stop stopColor={color} stopOpacity="0.61" offset="100%" />
      </linearGradient>
    </defs>
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <polygon
        fillOpacity="0.7"
        fill={`url(#${id}-1)`}
        opacity="0.7"
        points="0 685 300 165 500 895"
      />
      <polygon
        fillOpacity="0.6"
        fill={`url(#${id}-2)`}
        points="1000 685 300 165 500 895"
      />
      <polygon
        fillOpacity="0.8"
        fill={`url(#${id}-3)`}
        opacity="0.7"
        transform="translate(750, 500) scale(-1, 1) translate(-750, -500) "
        points="500 685 800 105 1000 895"
      />
      <polygon
        fillOpacity="0.6"
        fill={`url(#${id}-4)`}
        transform="translate(350, 500) scale(-1, 1) translate(-350, -500) "
        points="700 685 0 105 200 895"
      />
    </g>
  </svg>
);

icon.defaultProps = { width: 100, height: 100 };
export default compose(
  withTheme,
  withPropsOnChange(['color'], ({ color, theme }) => ({
    id: Math.random()
      .toString(36)
      .slice(-5),
    color:
      (color === true && theme.color) ||
      (typeof color === 'string' && (theme[color] || color)) ||
      (!!theme.inverted && theme.light) ||
      theme.dark
  }))
)(icon);
