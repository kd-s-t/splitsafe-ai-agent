import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog-new';
import { Typography } from '@/components/ui/typography';
import { RootState } from '@/lib/redux/store/store';
import { setWithdrawConfirmClose } from '@/lib/redux/store/withdrawSlice';
import { BLOCKSTREAM_URL } from '@/modules/withdraw/constants';
import { CircleCheckBig, ExternalLink } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

export default function WithdrawalConfirmation() {
  const dispatch = useDispatch();

  const { isConfirmed, amount, destination, status, transactionHash } = useSelector((state: RootState) => state.withdraw);

  const handleCloseConfirmation = () => {
    dispatch(setWithdrawConfirmClose(false))
  }

  const handleTransactionHashClick = () => {
    // Use Blockstream URL for Bitcoin transactions
    const explorerUrl = `${BLOCKSTREAM_URL}/tx/${transactionHash}`;
    window.open(explorerUrl, '_blank');
  }

  const formatTransactionHash = (hash: string | null) => {
    if (!hash) return "Pending...";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  }

  return (
    <Dialog open={isConfirmed} onOpenChange={handleCloseConfirmation}>
      <DialogContent className="!bg-[#313030] !max-w-[528px] border border-[#303333] max-h-[90vh] overflow-hidden !rounded-3xl">
        <DialogHeader>
          <DialogTitle className='flex gap-3'>
            <CircleCheckBig color='#00C287' size={20} />
            Withdrawal confirmed
          </DialogTitle>
          <DialogDescription className='text-[#BCBCBC]'>
            Your withdrawal has been processed successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 bg-[#282828] rounded-xl p-4">
          <div className='flex justify-between'>
            <Typography variant="small" className="text-[#9F9F9F]">Amount:</Typography>
            <Typography variant="small" className="text-white">{amount}</Typography>
          </div>
          <div className='flex justify-between'>
            <Typography variant="small" className="text-[#9F9F9F]">Destination:</Typography>
            <Typography variant="small" className="text-white">{destination}</Typography>
          </div>
          <div className='flex justify-between items-center'>
            <Typography variant="small" className="text-[#9F9F9F]">Transaction hash:</Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTransactionHashClick}
              className="text-[#FEB64D] hover:text-[#FEB64D]/80 hover:bg-[#FEB64D]/10 p-1 h-auto"
            >
              <Typography variant="small" className="text-[#FEB64D] font-mono">
                {formatTransactionHash(transactionHash)}
              </Typography>
              <ExternalLink size={12} className="ml-1" />
            </Button>
          </div>
          <div className='flex justify-between'>
            <Typography variant="small" className="text-[#9F9F9F]">Status:</Typography>
            <Typography className="capitalize text-[#00C287]" variant="small">{status}</Typography>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" className='w-full border border-[#7A7A7A]'>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
