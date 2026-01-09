import type { Thing, WithContext } from 'schema-dts';

type JsonLdProps<T extends Thing> = {
  data: WithContext<T>;
};

export function JsonLd<T extends Thing>({ data }: JsonLdProps<T>) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Next.js recommended pattern for JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
