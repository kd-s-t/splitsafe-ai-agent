import { AIProviderToggle } from '@/components/ui/ai-provider-toggle';
import { Typography } from '@/components/ui/typography';

export default function AiModeHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#303333] bg-[#0D0D0D]">
      <Typography variant="h3" className="text-white font-semibold">
        SplitSafe AI Agent
      </Typography>
      <AIProviderToggle />
    </div>
  );
}

