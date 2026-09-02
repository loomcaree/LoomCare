import React from 'react';

interface LoomLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * The official Loom Care infinity mark (connected 'oo' loop)
 */
export function LoomMark({
  className = '',
  size = 28,
  color = 'currentColor',
  ...props
}: LoomLogoProps) {
  return (
    <svg
      width={size * 1.6}
      height={size}
      viewBox="0 0 100 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Loom Care Mark"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28 6C15.8497 6 6 15.8497 6 28C6 40.1503 15.8497 50 28 50C36.0289 50 43.089 45.7171 47.054 39.3148C47.9392 37.8863 49.0608 37.8863 49.946 39.3148C53.911 45.7171 60.9711 50 69 50C81.1503 50 91 40.1503 91 28C91 15.8497 81.1503 6 69 6C60.9711 6 53.911 10.2829 49.946 16.6852C49.0608 18.1137 47.9392 18.1137 47.054 16.6852C43.089 10.2829 36.0289 6 28 6ZM28 17.5C22.201 17.5 17.5 22.201 17.5 28C17.5 33.799 22.201 38.5 28 38.5C33.799 38.5 38.5 33.799 38.5 28C38.5 22.201 33.799 17.5 28 17.5ZM69 17.5C63.201 17.5 58.5 22.201 58.5 28C58.5 33.799 63.201 38.5 69 38.5C74.799 38.5 79.5 33.799 79.5 28C79.5 22.201 74.799 17.5 69 17.5Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * The official full 'loomcare' logotype with embedded infinity mark
 */
export function LoomLogo({
  className = '',
  size = 28,
  color = '#3e6bf6',
  ...props
}: LoomLogoProps) {
  return (
    <div
      className={`inline-flex items-center select-none font-sans font-bold tracking-tight ${className}`}
      style={{ color, height: size, fontSize: size * 0.92, lineHeight: 1 }}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      <span className="font-semibold tracking-[-0.03em] lowercase">l</span>
      <LoomMark
        size={size * 0.72}
        color={color}
        className="mx-[1.5px] inline-block align-middle transform translate-y-[-0.5px]"
      />
      <span className="font-semibold tracking-[-0.02em] lowercase">mcare</span>
    </div>
  );
}
