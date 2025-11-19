import { BotMessageSquare } from 'lucide-react';

export default function AiModeLoading() {
  return (
    <div className="flex justify-start gap-4">
      <div className="rounded-full bg-[#FEB64D] self-start p-2 flex-shrink-0">
        <BotMessageSquare size={20} className="text-black" />
      </div>
      <div className="bg-[#1A1A1A] text-white rounded-lg p-4 border border-[#303333]">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </div>
  );
}

