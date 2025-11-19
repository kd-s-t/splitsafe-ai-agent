"use client"

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { RootState } from '@/lib';
import { setIsChooseEscrowTypeDialogOpen } from '@/lib/redux/store/dialogSlice';
import { Calendar, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog-new';
import { Separator } from '../ui/separator';

export default function EscrowTypeSelectorDialog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isChooseEscrowTypeDialogOpen } = useSelector((state: RootState) => state.dialog);

  const handleOpenChange = (open: boolean) => {
    dispatch(setIsChooseEscrowTypeDialogOpen(open));
  };

  const handleSelectBasic = () => {
    dispatch(setIsChooseEscrowTypeDialogOpen(false));
    navigate('/basic-escrow');
  };

  const handleSelectMilestone = () => {
    dispatch(setIsChooseEscrowTypeDialogOpen(false));
    navigate('/milestone-escrow');
  };

  return (
    <Dialog
      open={isChooseEscrowTypeDialogOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="!bg-[#313030] border border-[#303434] !w-[868px] !max-w-[90vw] max-h-[90vh] overflow-scroll !rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Choose escrow type
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Configure your secure Bitcoin transaction
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 mt-2">
          {/* Basic Escrow Card */}
          <div>
            <Card className="p-6">

              <CardHeader className='flex-row justify-between'>
                <div>
                  <CardTitle className='text-xl'>
                    Basic escrow
                  </CardTitle>
                  <CardDescription className='text-[#A1A1A1] leading-none mt-2 min-h-[28px]'>
                    Release funds immediately after approval
                  </CardDescription>
                </div>
                <div className='bg-[#323232] rounded-full size-[56px] flex items-center justify-center ml-4'>
                  <Zap className="text-[#FEB64D]" />
                </div>
              </CardHeader>

              <CardContent>
                <Separator className="bg-[#424444] mb-3 mt-2" />
                <div className="space-y-1">
                  <Typography variant='muted'><span className='font-semibold text-white'>Timeline:</span> Minutes to hours</Typography>
                  <Typography variant='muted'><span className='font-semibold text-white'>Release:</span> All funds at once</Typography>
                  <Typography variant='muted'><span className='font-semibold text-white'>Use for:</span> One-time payments, bonuses</Typography>
                </div>

                <Separator className="bg-[#424444] mb-3 mt-3" />
                <Typography variant="muted">
                  <span className='font-semibold text-white'>Perfect for:</span> Project completion bonuses, one-time payments, immediate fund transfers, simple escrow transactions.
                </Typography>
              </CardContent>

              <CardFooter className='!p-0'>
                <Button
                  className="w-full mt-4"
                  onClick={handleSelectBasic}
                >Select basic escrow
                </Button>
              </CardFooter>
            </Card>

            <Typography variant='base' className='text-[#FEB64D] mt-3 font-semibold'>
              Basic escrow example:
            </Typography>
            <Typography variant='muted' className="mt-2">
              &quot;Freelance web development project completed. Release 2.5 BTC to developer immediately after final approval.&quot;
            </Typography>
          </div>

          {/* Milestone Escrow Card */}
          <div>
            <Card className="p-6">

              <CardHeader className='flex-row justify-between'>
                <div>
                  <CardTitle className='text-xl'>
                    Milestone escrow
                  </CardTitle>
                  <CardDescription className='text-[#A1A1A1] leading-none mt-2 min-h-[28px]'>
                    Release funds gradually over time
                  </CardDescription>
                </div>
                <div className='bg-[#323232] rounded-full size-[56px] flex items-center justify-center ml-4'>
                  <Calendar className="text-[#FEB64D]" />
                </div>
              </CardHeader>

              <CardContent>
                <Separator className="bg-[#424444] mb-3 mt-2" />
                <div className="space-y-1">
                  <Typography variant='muted'><span className='font-semibold text-white'>Timeline:</span> Weeks to years</Typography>
                  <Typography variant='muted'><span className='font-semibold text-white'>Release:</span> Scheduled payments</Typography>
                  <Typography variant='muted'><span className='font-semibold text-white'>Use for:</span> Long-term projects, salaries</Typography>
                </div>

                <Separator className="bg-[#424444] mb-3 mt-3" />
                <Typography variant="muted">
                  <span className='font-semibold text-white'>Perfect for:</span> Freelance projects, monthly salaries, investment distributions, DAO payouts, charity donations.
                </Typography>
              </CardContent>

              <CardFooter className='!p-0'>
                <Button
                  className="w-full mt-4"
                  onClick={handleSelectMilestone}
                >Select milestone escrow
                </Button>
              </CardFooter>
            </Card>

            <Typography variant='base' className='text-[#FEB64D] mt-3 font-semibold'>
              Milestone escrow example:
            </Typography>
            <Typography variant='muted' className="mt-2">
              &quot;12 BTC for 4 developers over 1 year. Release 1 BTC every 1st of the month (0.25 BTC per developer).&quot;
            </Typography>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-8 space-y-4">



        </div>
      </DialogContent>
    </Dialog >
  );
}
