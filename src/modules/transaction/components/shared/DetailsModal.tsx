import MilestoneStatusBadge from '@/components/MilestoneStatusBadge';
import { Button } from '@/components/ui/button';
import { ToEntry, TransactionDetailsModalProps, isMilestoneTransaction } from "@/modules/shared.types";
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  const navigate = useNavigate();
  
  if (!transaction) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#212121] border border-[#303333] p-6 rounded-xl shadow-xl w-[30%] relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          className="absolute top-2 right-2 text-lg font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">
          <span className="ml-2 text-white">{transaction.title}</span>
          <span className="ml-2">
            {isMilestoneTransaction(transaction) ? (
              <MilestoneStatusBadge status={transaction.status} transaction={transaction} />
            ) : (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                transaction.status === 'released' ? 'bg-green-600 text-white' :
                transaction.status === 'pending' ? 'bg-yellow-600 text-white' :
                transaction.status === 'confirmed' ? 'bg-blue-600 text-white' :
                transaction.status === 'cancelled' ? 'bg-red-600 text-white' :
                transaction.status === 'declined' ? 'bg-red-600 text-white' :
                transaction.status === 'refund' ? 'bg-red-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {transaction.status === 'confirmed' ? 'ACTIVE' : transaction.status?.toUpperCase()}
              </span>
            )}
          </span>
        </h2>

        <div className="mb-2">
          <span className="font-semibold">From:</span>
          <span className="ml-2 font-mono text-xs">{String(transaction.from)}</span>
        </div>
        
        <div className="mb-2">
          <span className="font-semibold">Recipients:</span>
          <ul className="ml-4 mt-2 space-y-2">
            {transaction.to.map((toEntry: ToEntry, idx: number) => (
              <li key={idx} className="flex items-center">
                <span className="text-yellow-600 mr-2">•</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{String(toEntry.principal)}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-gray-400">Status: </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      toEntry.status && typeof toEntry.status === 'object' && 'approved' in toEntry.status ? 'bg-green-600 text-white' :
                      toEntry.status && typeof toEntry.status === 'object' && 'declined' in toEntry.status ? 'bg-red-600 text-white' :
                      toEntry.status && typeof toEntry.status === 'object' && 'pending' in toEntry.status ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {toEntry.status && typeof toEntry.status === 'object' && 'approved' in toEntry.status ? 'APPROVED' :
                       toEntry.status && typeof toEntry.status === 'object' && 'declined' in toEntry.status ? 'DECLINED' :
                       toEntry.status && typeof toEntry.status === 'object' && 'pending' in toEntry.status ? 'PENDING' :
                       'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Released At:</span>
          <span className="ml-2 text-xs">
            {transaction.releasedAt
              ? new Date(Number(transaction.releasedAt) / 1_000_000).toLocaleString()
              : 'N/A'}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Date:</span>
          <span className="ml-2 text-xs">
            {transaction.createdAt
              ? new Date(Number(transaction.createdAt) / 1_000_000).toLocaleString()
              : 'N/A'}
          </span>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => {
              navigate(`/transactions/${transaction.id}`);
              onClose();
            }}
            className="bg-[#FEB64D] text-[#0D0D0D] hover:bg-[#FEB64D]/90 px-4 py-2 rounded-lg font-medium"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Details
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
} 