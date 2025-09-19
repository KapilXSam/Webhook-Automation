import React from 'react';

// Using a type for icon names for better type safety
export type IconName = 
  | 'brain-circuit'
  | 'arrow-right'
  | 'webhook'
  | 'layout-dashboard'
  | 'settings'
  | 'sparkles'
  | 'check'
  | 'copy'
  | 'trash'
  | 'loader'
  | 'alert-circle';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const icons: Record<IconName, React.ReactNode> = {
  'brain-circuit': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5zm0 18a5 5 0 0 0 5-5v-2a5 5 0 0 0-10 0v2a5 5 0 0 0 5 5zm-5-9h10m-8 2v2m6-2v2M4 12H2m20 0h-2m-5-5v-2m-6 2V7"
    />
  ),
  'arrow-right': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
  ),
  webhook: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2c-3.3 0-6 2.7-6 6s2.7 6 6 6v4l4-4h2c1.1 0 2-.9 2-2V8c0-3.3-2.7-6-6-6zm-4 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm8 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"
    />
  ),
  'layout-dashboard': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h7v7H3zm11 0h7v7h-7zm-11 11h7v7H3zm11 0h7v7h-7z"
    />
  ),
  settings: (
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.14,12.94a1.5,1.5,0,0,0-1.25-.87,1.5,1.5,0,0,0-1.5,1.25,3.5,3.5,0,0,1-5.78,0,1.5,1.5,0,0,0-2.75,0,3.5,3.5,0,0,1-5.78,0,1.5,1.5,0,0,0-1.5-1.25,1.5,1.5,0,0,0-1.25.87,3.5,3.5,0,0,0,0,5.12,1.5,1.5,0,0,0,1.25.87,1.5,1.5,0,0,0,1.5-1.25,3.5,3.5,0,0,1,5.78,0,1.5,1.5,0,0,0,2.75,0,3.5,3.5,0,0,1,5.78,0,1.5,1.5,0,0,0,1.5,1.25,1.5,1.5,0,0,0,1.25-.87,3.5,3.5,0,0,0,0-5.12Z"
    />
  ),
  sparkles: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2 9.5 8.5 3 11l6.5 2.5L12 22l2.5-8.5L21 11l-6.5-2.5z"
    />
  ),
  check: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
  ),
  copy: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"
    />
  ),
  trash: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 5v6m4-6v6"
    />
  ),
  loader: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4m-2.83 8.48l-2.83-2.83M7.76 7.76l-2.83-2.83" />
  ),
  'alert-circle': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 8V12M12 16H12.01" />
  )
};

const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      {...props}
    >
      {icons[name]}
    </svg>
  );
};

export default Icon;
