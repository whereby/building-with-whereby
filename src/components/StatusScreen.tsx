import type { ReactNode } from "react";

interface Props {
  title: string;
  message?: string;
  spinner?: boolean;
  children?: ReactNode;
}

/** Full-screen centered message used for connecting / knocking / rejected states. */
export default function StatusScreen({ title, message, spinner, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      {spinner && (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-indigo-400" />
      )}
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {message && <p className="mt-1 max-w-sm text-sm text-neutral-400">{message}</p>}
      </div>
      {children}
    </div>
  );
}
