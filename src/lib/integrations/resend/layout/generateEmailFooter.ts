/**
 * Generate standardized email footer - Mobile Responsive
 */
export function generateEmailFooter(): string {
  return `
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px; padding: 0 10px;">
      <p style="margin: 8px 0; line-height: 1.4;">Powered by Internet Computer's native Bitcoin integration</p>
      <p style="margin: 8px 0; line-height: 1.4;">SplitSafe - Secure, Decentralized Payment Solutions</p>
      <p style="margin-top: 15px;">
        <a href="https://thesplitsafe.com" 
           style="color: #007AFF; text-decoration: none; font-weight: bold; word-break: break-all;">
          Visit us at thesplitsafe.com
        </a>
      </p>
      <p style="margin-top: 10px; font-size: 12px;">
        <a href="https://thesplitsafe.com/terms-of-service" style="color: #666; text-decoration: none; word-break: break-all;">Terms of Service</a> | 
        <a href="https://thesplitsafe.com/privacy-policy" style="color: #666; text-decoration: none; word-break: break-all;">Privacy Policy</a> | 
        <a href="https://thesplitsafe.com/faq" style="color: #666; text-decoration: none; word-break: break-all;">FAQ</a> | 
        <a href="https://thesplitsafe.com/contact-us" style="color: #666; text-decoration: none; word-break: break-all;">Contact Us</a>
      </p>
    </div>
  `;
}
