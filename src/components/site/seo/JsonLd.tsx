// Structured data as a JSON-LD script (spec §13). "<" is escaped so no
// string in the data can close the script tag early.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
