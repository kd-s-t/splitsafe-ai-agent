import { Activity, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { ApiKey } from '../types';

interface ApiKeyCardProps {
  apiKey: ApiKey;
  showKey: boolean;
  onToggleVisibility: () => void;
  onCopy: () => void;
  onRevoke: () => void;
  onViewActivity?: () => void;
  maskKey: (key: string) => string;
  formatDate: (dateString: string) => string;
}

export function ApiKeyCard({
  apiKey,
  showKey,
  onToggleVisibility,
  onCopy,
  onRevoke,
  onViewActivity,
  maskKey,
  formatDate
}: ApiKeyCardProps) {
  return (
    <div className="bg-[#1C1D1D] border border-[#2A2B2B] rounded-lg p-4">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-base">{apiKey.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            apiKey.status === 'active' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {apiKey.status}
          </span>
          {apiKey.lastUsed && (
            <span className="text-[#BCBCBC] text-xs">
              Last used: {formatDate(apiKey.lastUsed)}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {onViewActivity && (
            <button
              onClick={onViewActivity}
              className="bg-[#FEB64D]/20 hover:bg-[#FEB64D]/30 text-[#FEB64D] px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="View Activity"
            >
              <Activity className="w-3 h-3" />
              <span className="text-xs">Activity</span>
            </button>
          )}
          <button
            onClick={onToggleVisibility}
            className="bg-[#2A2B2B] hover:bg-[#3A3B3B] text-white px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title={showKey ? 'Hide Key' : 'Show Key'}
          >
            {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span className="text-xs">{showKey ? 'Hide' : 'Show'}</span>
          </button>
          <button
            onClick={onCopy}
            className="bg-[#2A2B2B] hover:bg-[#3A3B3B] text-white px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy Key"
          >
            <Copy className="w-3 h-3" />
            <span className="text-xs">Copy</span>
          </button>
          {apiKey.status === 'active' && (
            <button
              onClick={onRevoke}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Revoke Key"
            >
              <Trash2 className="w-3 h-3" />
              <span className="text-xs">Revoke</span>
            </button>
          )}
        </div>
      </div>
      
      {/* API Key and Permissions Row */}
      <div className="flex items-center gap-4">
        {/* API Key */}
        <div className="flex-1 bg-[#2A2B2B] border border-[#3A3B3B] rounded p-2">
          <code className="text-[#BCBCBC] font-mono text-xs break-all">
            {showKey ? apiKey.key : maskKey(apiKey.key)}
          </code>
        </div>
        
        {/* Permissions */}
        <div className="flex items-center gap-2">
          <span className="text-[#BCBCBC] text-xs font-medium">Permissions:</span>
          <div className="flex gap-1">
            {apiKey.permissions && apiKey.permissions.length > 0 ? (
              apiKey.permissions.map((permission, index) => {
                // Handle both string and object permissions
                const permissionText = typeof permission === 'string' ? permission : JSON.stringify(permission);
                return (
                  <span
                    key={`permission-${index}-${permissionText}`}
                    className="bg-[#FEB64D]/20 text-[#FEB64D] px-2 py-1 rounded text-xs"
                  >
                    {permissionText}
                  </span>
                );
              })
            ) : (
              <span className="text-[#BCBCBC] text-xs">No permissions</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
