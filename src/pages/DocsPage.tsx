import {
    ApiReference,
    CodeExamples,
    DocsHeader,
    LiveExample,
    SaasIntegrationFlows,
    useDocsPageSetup
} from '@/modules/docs';

export default function DocsPage() {
  useDocsPageSetup();

  return (
    <div className="standalone-page min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] text-white">
      <DocsHeader />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="my-12">
          <SaasIntegrationFlows />
        </div>

        <div className="my-12">
          <ApiReference />
        </div>

        <div className="my-12">
          <CodeExamples />
        </div>

        <div className="my-12">
          <LiveExample />
        </div>
      </div>
    </div>
  );
}

