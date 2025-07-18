import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1.5em" 
      height="1.5em"
      fill="currentColor"
      {...props}
    >
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" opacity="0.2"/>
      <path d="M128,64a8,8,0,0,0-8,8v40H80a8,8,0,0,0,0,16h40v40a8,8,0,0,0,16,0V128h40a8,8,0,0,0,0-16H136V72A8,8,0,0,0,128,64Z"/>
    </svg>
  );
}
