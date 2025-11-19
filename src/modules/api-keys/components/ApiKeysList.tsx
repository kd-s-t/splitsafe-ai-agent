import { ApiKey } from '../types';
import { ApiKeyCard } from './ApiKeyCard';

interface ApiKeysListProps {
  apiKeys: ApiKey[];
  showKeys: { [key: string]: boolean };
  onToggleKeyVisibility: (id: string) => void;
  onCopyKey: (key: string) => void;
  onRevokeKey: (id: string) => void;
  onViewActivity?: (keyId: string) => void;
  maskKey: (key: string) => string;
  formatDate: (dateString: string) => string;
}

export function ApiKeysList({
  apiKeys,
  showKeys,
  onToggleKeyVisibility,
  onCopyKey,
  onRevokeKey,
  onViewActivity,
  maskKey,
  formatDate
}: ApiKeysListProps) {
  if (apiKeys.length === 0) {
    return (
      <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-8 text-center">
        <div className="text-[#BCBCBC] mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#3A3B3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">No API Keys</h3>
        <p className="text-[#BCBCBC]">Create your first API key to get started with SplitSafe integration.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {apiKeys.map((apiKey) => (
        <ApiKeyCard
          key={apiKey.id}
          apiKey={apiKey}
          showKey={showKeys[apiKey.id] || false}
          onToggleVisibility={() => onToggleKeyVisibility(apiKey.id)}
          onCopy={() => onCopyKey(apiKey.key)}
          onRevoke={() => onRevokeKey(apiKey.id)}
          onViewActivity={onViewActivity ? () => onViewActivity(apiKey.id) : undefined}
          maskKey={maskKey}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}
