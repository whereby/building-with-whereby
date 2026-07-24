// Small inline icon set so the app carries no external icon dependency.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MicIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
    </svg>
  );
}

export function MicOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 9v-4a3 3 0 0 1 6 0v4M5 10a7 7 0 0 0 11 5.3M12 19v3" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 10l5-3v10l-5-3v-4Z" />
      <rect x="2" y="6" width="13" height="12" rx="2" />
    </svg>
  );
}

export function CameraOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 10l5-3v10M2 8v8a2 2 0 0 0 2 2h9" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

export function PhoneOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9a16 16 0 0 1 18 0l-2.5 2.5-3-1V8.5a11 11 0 0 0-7 0V10l-3 1L3 9Z" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
