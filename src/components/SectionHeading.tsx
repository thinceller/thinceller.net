import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

type Props = {
  title: string;
  linkHref?: string;
  linkText?: string;
  external?: boolean;
};

export function SectionHeading({ title, linkHref, linkText, external }: Props) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-custom-xl font-bold">{title}</h2>
      {linkHref && linkText && (
        <Link
          href={linkHref}
          className="text-custom-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1"
          {...(external
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          {linkText}
          {external && <ExternalLink size={14} />}
        </Link>
      )}
    </div>
  );
}
