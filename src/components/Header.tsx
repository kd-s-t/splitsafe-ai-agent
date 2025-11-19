'use client'

import TransactionStatusBadge from '@/components/TransactionStatusBadge'
import { Typography } from '@/components/ui/typography'
import { useUser } from '@/hooks/useUser'
import { RootState } from '@/lib/redux/store/store'
import TransactionNotificationDropdown from '@/modules/notifications/components/NotificationDropdown'
import ProfileDropdown from '@/modules/settings/components/Dropdown'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function Header() {

  const { principal } = useUser()
  const { pathname } = useLocation()
  const title = useSelector((state: RootState) => state.layout.title)
  const subtitle = useSelector((state: RootState) => state.layout.subtitle)
  const transactionStatus = useSelector((state: RootState) => state.layout.transactionStatus)

  // Only show transaction status badge on transaction detail pages
  const isTransactionDetailPage = pathname?.startsWith('/transactions/') && pathname !== '/transactions'

  return (
    <header className="h-[auto] md:h-[55px] pl-[16px] pr-[16px] mt-[28px] flex items-center md:justify-between text-foreground min-w-0 overflow-hidden flex-col-reverse md:flex-row gap-2">
      {/* Title Bar */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-4">
          <Typography variant="h3" className="text-white leading-[30px] font-normal">
            {title}
          </Typography>
          {transactionStatus && isTransactionDetailPage && <TransactionStatusBadge status={transactionStatus} />}
        </div>
        {subtitle && (
          <Typography variant="muted" className="text-[#BCBCBC] md:text-[17px] leading-[17px] font-normal">
            {subtitle}
          </Typography>
        )}
      </div>

      {/* Top Right - Notification and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <div className="w-12 h-12 bg-[#151717] rounded-[34px] flex items-center justify-center cursor-pointer hover:bg-[#1a1c1c] transition-colors">
            <TransactionNotificationDropdown principalId={principal?.toText() ?? ''} />
          </div>
        </div>

        {/* Profile */}
        <ProfileDropdown principalId={principal?.toText() ?? ''} />
      </div>
    </header>
  )
}