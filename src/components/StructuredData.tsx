import { serializeJsonLd } from "@/lib/serialize-json-ld";

type StructuredDataProps = {
  id: string;
  data: Record<string, unknown>;
};

export function StructuredData({ id, data }: StructuredDataProps) {
  // React must emit raw JSON inside this non-executable data script.
  // serializeJsonLd prevents HTML tag termination; never pass raw HTML here.
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
