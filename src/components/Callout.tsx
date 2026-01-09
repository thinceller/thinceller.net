import { AlertCircle, AlertTriangle, Ban, Info, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';

type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

type CalloutProps = {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
};

const calloutConfig = {
  note: {
    icon: Info,
    label: 'Note',
    containerClass:
      'bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-400',
    iconClass: 'text-blue-500 dark:text-blue-400',
    titleClass: 'text-blue-700 dark:text-blue-300',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    containerClass:
      'bg-green-50 dark:bg-green-950 border-green-500 dark:border-green-400',
    iconClass: 'text-green-500 dark:text-green-400',
    titleClass: 'text-green-700 dark:text-green-300',
  },
  important: {
    icon: AlertCircle,
    label: 'Important',
    containerClass:
      'bg-purple-50 dark:bg-purple-950 border-purple-500 dark:border-purple-400',
    iconClass: 'text-purple-500 dark:text-purple-400',
    titleClass: 'text-purple-700 dark:text-purple-300',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    containerClass:
      'bg-amber-50 dark:bg-amber-950 border-amber-500 dark:border-amber-400',
    iconClass: 'text-amber-500 dark:text-amber-400',
    titleClass: 'text-amber-700 dark:text-amber-300',
  },
  caution: {
    icon: Ban,
    label: 'Caution',
    containerClass:
      'bg-red-50 dark:bg-red-950 border-red-500 dark:border-red-400',
    iconClass: 'text-red-500 dark:text-red-400',
    titleClass: 'text-red-700 dark:text-red-300',
  },
} as const;

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title ?? config.label;

  return (
    <div
      className={`mb-6 rounded-md border-l-4 p-4 ${config.containerClass}`}
      role="note"
      aria-label={displayTitle}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${config.iconClass}`} aria-hidden="true" />
        <span className={`font-bold ${config.titleClass}`}>{displayTitle}</span>
      </div>
      <div className="[&>p]:mb-0 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}
