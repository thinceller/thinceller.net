import type { Graph, Thing, WithContext } from 'schema-dts';

type JsonLdProps = {
  data: WithContext<Thing> | Graph;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Next.js recommended pattern for JSON-LD
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e')
          .replace(/&/g, '\\u0026'),
      }}
    />
  );
}
