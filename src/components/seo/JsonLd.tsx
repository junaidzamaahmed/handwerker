/**
 * JSON-LD as a plain script tag with pre-serialised content. The `<` escape closes the
 * XSS hole that `dangerouslySetInnerHTML` + JSON opens as soon as any field carries text
 * a person typed — a review, a job description, an MDX excerpt.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
