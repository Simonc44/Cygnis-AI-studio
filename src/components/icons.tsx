import type { SVGProps } from 'react';

export function CygnisAILogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.75 18L18 12.75C18 12.75 14.25 12 12.75 9.75C11.25 7.5 12.375 3.75 12.375 3.75" />
      <path d="M8.25 18C10.4591 18 12.25 16.2091 12.25 14C12.25 11.7909 10.4591 10 8.25 10C6.04086 10 4.25 11.7909 4.25 14C4.25 16.2091 6.04086 18 8.25 18Z" />
      <path d="M18 3.75L18.75 5.25L20.25 6L18.75 6.75L18 8.25L17.25 6.75L15.75 6L17.25 5.25L18 3.75Z" />
    </svg>
  );
}
