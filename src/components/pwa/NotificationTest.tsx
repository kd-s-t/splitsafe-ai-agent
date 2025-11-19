'use client'

import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { requestNotificationPermission, showVoucherNotification, showWithdrawalNotification } from '@/lib/integrations/pusher/client'
import { Bell, TestTube } from 'lucide-react'
import { useState } from 'react'

export default function NotificationTest() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermission(granted ? 'granted' : 'denied')
  }

  const testWithdrawalNotification = () => {
    showWithdrawalNotification(
      'Test Withdrawal Notification',
      'This is a test withdrawal notification. Your BTC withdrawal of 0.001 BTC has been processed successfully.',
      {
        amount: '0.001',
        currency: 'BTC',
        address: 'test-address'
      }
    )
  }

  const testVoucherNotification = () => {
    showVoucherNotification(
      'Test Voucher Notification',
      'This is a test voucher notification. Your voucher TEST123 for 0.01 BTC has been created successfully.',
      {
        code: 'TEST123',
        amount: '0.01',
        type: 'created'
      }
    )
  }

  const testVoucherRedemptionNotification = () => {
    showVoucherNotification(
      'Test Voucher Redemption',
      'This is a test voucher redemption notification. Voucher TEST456 for 0.05 BTC has been redeemed successfully.',
      {
        code: 'TEST456',
        amount: '0.05',
        type: 'redeemed'
      }
    )
  }

  return (
    <div className="p-6 bg-[#222222] border border-[#303434] rounded-lg space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <TestTube className="w-6 h-6 text-[#FEB64D]" />
        <Typography variant="h4" className="text-white">
          Notification Test
        </Typography>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#FEB64D]" />
            <div>
              <Typography variant="p" className="font-medium text-white">
                Notification Permission
              </Typography>
              <Typography variant="muted" className="text-sm text-gray-400">
                Status: {permission}
              </Typography>
            </div>
          </div>
          {permission !== 'granted' && (
            <Button
              onClick={handleRequestPermission}
              size="sm"
              className="bg-[#FEB64D] hover:bg-[#FEA52D] text-black"
            >
              Request Permission
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={testWithdrawalNotification}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={permission !== 'granted'}
          >
            Test Withdrawal Notification
          </Button>

          <Button
            onClick={testVoucherNotification}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={permission !== 'granted'}
          >
            Test Voucher Creation
          </Button>

          <Button
            onClick={testVoucherRedemptionNotification}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={permission !== 'granted'}
          >
            Test Voucher Redemption
          </Button>
        </div>

        <div className="p-3 bg-[#1a1a1a] rounded-lg">
          <Typography variant="small" className="text-gray-400">
            <strong>How to test:</strong>
            <br />
            1. Click &quot;Request Permission&quot; to enable notifications
            <br />
            2. Click the test buttons to see notifications
            <br />
            3. Switch to another tab/window to see browser notifications
            <br />
            4. Browser notifications only show when the app is not in focus
          </Typography>
        </div>
      </div>
    </div>
  )
}
