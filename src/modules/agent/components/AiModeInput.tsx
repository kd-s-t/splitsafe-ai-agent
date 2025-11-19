import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { FormEvent, KeyboardEvent } from 'react';

interface AiModeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function AiModeInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  isLoading,
  placeholder = 'Message SplitSafe AI Agent...',
}: AiModeInputProps) {
  return (
    <div className="border-t border-[#303333] bg-[#0D0D0D] p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit} className="flex gap-3 items-end">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-[#1A1A1A] border-[#424444] text-white placeholder-[#A1A1A1] resize-none min-h-[52px] max-h-[200px] py-3 px-4"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="bg-[#FEB64D] text-black hover:bg-[#FEB64D]/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-[52px] px-6"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}

