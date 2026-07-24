import type { ReactNode } from "react";

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  /** Icon to show when the feature is on/active. */
  onIcon: ReactNode;
  /** Icon to show when the feature is off/muted. */
  offIcon: ReactNode;
}

/** Round mute/camera-style toggle. "Off" renders in a warning red. */
export function ControlButton({ active, onClick, label, onIcon, offIcon }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={
        "flex h-12 w-12 items-center justify-center rounded-full transition " +
        (active
          ? "bg-neutral-700 text-neutral-100 hover:bg-neutral-600"
          : "bg-red-600 text-white hover:bg-red-500")
      }
    >
      {active ? onIcon : offIcon}
    </button>
  );
}

interface DeviceSelectProps {
  label: string;
  icon: ReactNode;
  devices: MediaDeviceInfo[];
  value?: string;
  onChange: (deviceId: string) => void;
  fallbackLabel: (index: number) => string;
}

/** Labeled dropdown for one class of media device. */
export function DeviceSelect({ label, icon, devices, value, onChange, fallbackLabel }: DeviceSelectProps) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
      <span className="text-neutral-400">{icon}</span>
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={devices.length === 0}
        className="min-w-0 flex-1 bg-transparent text-sm text-neutral-100 outline-none disabled:text-neutral-600"
        aria-label={label}
      >
        {devices.length === 0 && <option value="">No {label.toLowerCase()} found</option>}
        {devices.map((device, i) => (
          <option key={device.deviceId || i} value={device.deviceId} className="bg-neutral-900">
            {device.label || fallbackLabel(i)}
          </option>
        ))}
      </select>
    </label>
  );
}
