import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { ArrowLeft, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="standalone-page min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] text-white">
      <div className="border-b border-[#2A2A2A] bg-[#0A0A0A]/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#2A2A2A]" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-[#FEB64D] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <Typography variant="h1" className="text-white text-4xl font-bold">
                Privacy Policy
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] text-lg mt-2">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-semibold">
              Privacy Policy
            </CardTitle>
            <Typography variant="muted" className="text-[#BCBCBC]">
              How we collect, use, and protect your information
            </Typography>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                1. Information We Collect
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed mb-3">
                We collect the following types of information:
              </Typography>
              <ul className="space-y-2 text-[#BCBCBC] ml-4">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Blockchain Data:</strong> Transaction details, wallet addresses, and smart contract interactions</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>User Information:</strong> Internet Identity principal, nickname, and profile data you provide</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Communication Data:</strong> Messages sent through our platform and support communications</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Technical Data:</strong> Browser information, IP addresses, and usage analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Feedback Data:</strong> Ratings, comments, and suggestions you provide</span>
                </li>
              </ul>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                2. How We Use Your Information
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed mb-3">
                We use your information to:
              </Typography>
              <ul className="space-y-2 text-[#BCBCBC] ml-4">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Provide and maintain the SplitSafe platform</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Process transactions and manage escrow services</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Facilitate communication between users</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Provide customer support and resolve disputes</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Improve our services and develop new features</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Ensure platform security and prevent fraud</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Comply with legal obligations</span>
                </li>
              </ul>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                3. Blockchain and Decentralization
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                SplitSafe is built on the Internet Computer blockchain, which means transaction data is publicly verifiable on-chain. While we don&apos;t store personal information on the blockchain, transaction details and smart contract interactions are transparent and immutable. This transparency is a core feature of our decentralized platform.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                4. Data Storage and Security
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                We implement industry-standard security measures to protect your information. Data is encrypted in transit and at rest. We use secure cloud infrastructure and follow best practices for data protection. However, no method of transmission over the internet is 100% secure.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                5. Information Sharing
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
              </Typography>
              <ul className="space-y-2 text-[#BCBCBC] ml-4 mt-3">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>With your explicit consent</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>To comply with legal requirements or court orders</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>To protect our rights, property, or safety</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>With service providers who assist in platform operations</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>In case of a business transfer or merger</span>
                </li>
              </ul>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                6. Cookies and Tracking
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences. Some features may not function properly if cookies are disabled.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                7. Your Rights and Choices
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed mb-3">
                You have the right to:
              </Typography>
              <ul className="space-y-2 text-[#BCBCBC] ml-4">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Access and review your personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Request correction of inaccurate data</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Request deletion of your account and data</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Opt out of marketing communications</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Withdraw consent for data processing</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Export your data in a portable format</span>
                </li>
              </ul>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                8. Data Retention
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. Transaction data may be retained longer due to blockchain immutability. When you delete your account, we will remove your personal information within 30 days, though some data may persist in backups.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                9. International Data Transfers
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers, including standard contractual clauses and adequacy decisions.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                10. Children&apos;s Privacy
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                SplitSafe is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information promptly.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                11. Changes to This Policy
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of SplitSafe after changes constitutes acceptance of the updated policy.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                12. Contact Us
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
                <a 
                  href="mailto:info@thesplitsafe.com"
                  className="text-[#FEB64D] hover:underline"
                >
                  info@thesplitsafe.com
                </a>
                {' '}or through our{' '}
                <Link to="/contact-us" className="text-[#FEB64D] hover:underline">
                  contact form
                </Link>
                .
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

