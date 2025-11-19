import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { ArrowLeft, FileText } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function TermsOfServicePage() {
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
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <Typography variant="h1" className="text-white text-4xl font-bold">
                Terms of Service
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
              Terms of Service
            </CardTitle>
            <Typography variant="muted" className="text-[#BCBCBC]">
              Please read these terms carefully before using SplitSafe
            </Typography>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                1. Acceptance of Terms
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                By accessing and using SplitSafe (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                2. Description of Service
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                SplitSafe is a decentralized escrow platform built on the Internet Computer blockchain that enables secure Bitcoin and ICP transactions. The service facilitates payment splitting, escrow management, and dispute resolution through smart contracts.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                3. User Responsibilities
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed mb-3">
                As a user of SplitSafe, you agree to:
              </Typography>
              <ul className="space-y-2 text-[#BCBCBC] ml-4">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Provide accurate and complete information when creating transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Comply with all applicable laws and regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Not use the service for illegal or fraudulent activities</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Maintain the security of your Internet Identity and private keys</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-[#BCBCBC] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Respect other users and maintain professional conduct</span>
                </li>
              </ul>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                4. Blockchain and Cryptocurrency Risks
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                You acknowledge that blockchain transactions are irreversible and that cryptocurrency values are highly volatile. SplitSafe is not responsible for any losses incurred due to market fluctuations, technical issues, or user error. Always verify transaction details before confirming.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                5. Dispute Resolution
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                SplitSafe provides built-in dispute resolution mechanisms. Users are encouraged to resolve disputes through the platform&apos;s messaging system and dispute resolution tools. For unresolved disputes, users may seek external arbitration or legal remedies.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                6. Limitation of Liability
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                SplitSafe operates as a decentralized platform. While we strive to provide reliable service, we cannot guarantee uninterrupted access or error-free operation. Users assume full responsibility for their transactions and any associated risks.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                7. Privacy and Data Protection
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using SplitSafe, you consent to our data practices as described in the Privacy Policy.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                8. Modifications to Terms
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the service after changes constitutes acceptance of the new terms.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" className="text-white text-xl font-semibold mb-3">
                9. Contact Information
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{' '}
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

