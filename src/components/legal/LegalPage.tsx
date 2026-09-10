import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import { getLegalPage } from '@/lib/content/legal';
import { Section } from '@/components/blocks/Section';
import { Prose } from '@/components/blocks/Prose';
import { ProcessorTable } from './ProcessorTable';
import { LegalDisclaimer } from './LegalDisclaimer';

export async function LegalPageBody({ locale, slug }: { locale: string; slug: string }) {
  const page = await getLegalPage(locale, slug);
  if (!page) notFound();

  return (
    <main id="inhalt">
      <Section>
        <div className="container-prose">
          <h1 className="text-3xl font-bold text-ink lg:text-4xl">{page.title}</h1>
          <p className="mt-3 text-ink-muted">{page.lead}</p>
        </div>
        <div className="mt-8">
          <Prose>
            <MDXRemote
              source={page.body}
              components={{ ProcessorTable: () => <ProcessorTable locale={locale} /> }}
            />
          </Prose>
          <div className="container-prose">
            <LegalDisclaimer />
          </div>
        </div>
      </Section>
    </main>
  );
}
