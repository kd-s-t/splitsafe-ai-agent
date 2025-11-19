import { useAuth } from '@/contexts/auth-context';
import { setSubtitle, setTitle } from '@/lib/redux/store/store';
import { ApiKeyActivity, ApiKeysList, useApiKeys } from '@/modules/api-keys';
import { BusinessAnalytics } from '@/modules/payment-gateway/components/BusinessAnalytics';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function ApiKeysPage() {
  const dispatch = useDispatch();
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const authContext = useAuth();
  
  const principal = authContext?.principal || null;
  const authLoading = authContext?.isLoading ?? true;
  
  const {
    apiKeys,
    showKeys,
    loading,
    error,
    createNewKey,
    revokeKey,
    copyToClipboard,
    toggleKeyVisibility,
    maskKey,
    formatDate
  } = useApiKeys();

  useEffect(() => {
    dispatch(setTitle('API Key Management'));
    dispatch(setSubtitle('Manage your API keys for SplitSafe integration'));
  }, [dispatch]);

  const handleCreateKey = async () => {
    console.log('🔑 Create New API Key button clicked - calling backend...');
    await createNewKey();
  };

  const handleViewActivity = (keyId: string) => {
    setSelectedKeyId(keyId);
  };

  const handleCloseActivity = () => {
    setSelectedKeyId(null);
  };

  const selectedKey = selectedKeyId ? apiKeys.find(key => key.id === selectedKeyId) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <div className="mb-4 flex gap-4">
        <button
          onClick={handleCreateKey}
          disabled={loading}
          className="bg-[#FEB64D] hover:bg-[#FEA52D] text-black font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New API Key
            </>
          )}
        </button>
      </div>

      {authLoading ? (
        <div className="mb-6 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400">Loading authentication...</p>
        </div>
      ) : !principal ? (
        <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400">Please log in to manage your API keys.</p>
        </div>
      ) : null}

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
        </div>
      )}

      {principal && (
        <div className="mb-6">
          <BusinessAnalytics merchantPrincipal={principal.toString()} />
        </div>
      )}

      <ApiKeysList
        apiKeys={apiKeys}
        showKeys={showKeys}
        onToggleKeyVisibility={toggleKeyVisibility}
        onCopyKey={copyToClipboard}
        onRevokeKey={revokeKey}
        onViewActivity={handleViewActivity}
        maskKey={maskKey}
        formatDate={formatDate}
      />

      {selectedKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D0D0D] border border-[#2A2B2B] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">API Key Activity</h2>
                <button
                  onClick={handleCloseActivity}
                  className="text-[#BCBCBC] hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <ApiKeyActivity keyId={selectedKey.id} keyName={selectedKey.name} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

