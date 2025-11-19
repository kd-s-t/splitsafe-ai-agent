import { VoucherRedemptionEmailData } from './voucherRedemptionService';

export function generateVoucherRedemptionEmail(data: VoucherRedemptionEmailData): string {
  const { voucherCode, amount, redeemerId, timestamp } = data;
  const date = new Date(timestamp).toLocaleString();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Voucher Redeemed - SplitSafe</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #FEB64D;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #FEB64D;
                margin-bottom: 10px;
            }
            .title {
                font-size: 28px;
                color: #333;
                margin: 0;
            }
            .voucher-details {
                background: #f8f9fa;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #FEB64D;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .detail-label {
                font-weight: 600;
                color: #666;
            }
            .detail-value {
                color: #333;
                font-family: monospace;
            }
            .amount {
                font-size: 18px;
                font-weight: bold;
                color: #FEB64D;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: #FEB64D;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
            }
            .status {
                background: #d4edda;
                color: #155724;
                padding: 10px 15px;
                border-radius: 4px;
                border: 1px solid #c3e6cb;
                margin: 20px 0;
                text-align: center;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎫 SplitSafe</div>
                <h1 class="title">Voucher Redeemed</h1>
            </div>

            <div class="status">
                ✅ Your voucher has been successfully redeemed!
            </div>

            <div class="voucher-details">
                <h3 style="margin-top: 0; color: #333;">Voucher Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Voucher Code:</span>
                    <span class="detail-value">${voucherCode}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value amount">${amount} BTC</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Redeemed By:</span>
                    <span class="detail-value">${redeemerId}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Redeemed At:</span>
                    <span class="detail-value">${date}</span>
                </div>
            </div>

            <p style="color: #666; font-size: 16px;">
                Your voucher <strong>${voucherCode}</strong> has been successfully redeemed for <strong>${amount} BTC</strong>. 
                The funds have been transferred to the redeemer's account.
            </p>

            <div style="text-align: center;">
                <a href="https://splitsafe.app/vouchers" class="button">
                    View Vouchers
                </a>
            </div>

            <div class="footer">
                <p>This is an automated notification from SplitSafe.</p>
                <p>If you have any questions, please contact our support team.</p>
                <p style="margin-top: 20px;">
                    <strong>SplitSafe</strong> - Secure Escrow & Payment Platform
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}
