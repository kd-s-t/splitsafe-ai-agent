import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const faqData = [
  {
    id: '1',
    question: 'What is SplitSafe?',
    answer: 'SplitSafe is a decentralized escrow platform that allows users to safely split bills and payments using Bitcoin (cKBTC) and ICP. It provides secure, transparent, and automated payment splitting with built-in dispute resolution.'
  },
  {
    id: '2',
    question: 'How does the escrow system work?',
    answer: 'When you create a split, the total amount is held in escrow until all participants approve the transaction. Once everyone approves, the funds are automatically distributed according to the agreed percentages. If someone declines, the funds are returned to the original payer.'
  },
  {
    id: '3',
    question: 'What cryptocurrencies are supported?',
    answer: 'SplitSafe currently supports Bitcoin through cKBTC (chain-key Bitcoin) and Internet Computer Protocol (ICP). You can create splits using Bitcoin or ICP, and transfer between these two supported cryptocurrencies.'
  },
  {
    id: '4',
    question: 'How do I get started with SplitSafe?',
    answer: 'To get started, you need to authenticate using Internet Identity, which provides secure, passwordless authentication. Once logged in, you can create new splits, join existing ones, and manage your transactions through the dashboard.'
  },
  {
    id: '5',
    question: 'Is SplitSafe secure?',
    answer: 'Yes, SplitSafe uses smart contracts on the Internet Computer blockchain to ensure security and transparency. All transactions are recorded on-chain and can be verified by anyone. Funds are held in escrow until all parties agree, and dispute resolution is handled automatically.'
  },
  {
    id: '6',
    question: 'What happens if someone disputes a transaction?',
    answer: 'If a participant disputes a transaction, the escrow will hold the funds until the dispute is resolved. SplitSafe provides automated dispute resolution mechanisms, and in case of disagreements, the funds are returned to the original payer after a cooling-off period.'
  },
  {
    id: '7',
    question: 'Are there any fees?',
    answer: 'SplitSafe charges minimal transaction fees for processing escrow transactions on the Internet Computer blockchain. These fees are transparent and displayed before you confirm any transaction.'
  },
  {
    id: '8',
    question: 'Can I use SplitSafe on mobile?',
    answer: 'Yes, SplitSafe is a responsive web application that works on all devices including mobile phones and tablets. You can access it through any modern web browser.'
  },
  {
    id: '9',
    question: 'How do I contact support?',
    answer: 'You can reach out to our support team through the Contact Us page. We aim to respond to all inquiries within 24 hours.'
  },
  {
    id: '10',
    question: 'Is my personal information stored securely?',
    answer: 'Yes, SplitSafe follows best practices for data security and privacy. Your personal information is encrypted and stored securely. We only collect the minimum information necessary to provide our service.'
  }
];

export default function FaqPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-4 mb-6">
          <HelpCircle className="w-10 h-10 text-[#FEB64D]" />
          <Typography variant="h1">Frequently Asked Questions</Typography>
        </div>
        <Typography variant="muted" className="text-lg">
          Find answers to common questions about SplitSafe
        </Typography>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqData.map((faq) => (
          <Card key={faq.id} className="border-[#2A2B2B] bg-[#0D0D0D]">
            <AccordionItem value={faq.id} className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardHeader className="p-0">
                  <CardTitle className="text-left text-lg">{faq.question}</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <CardContent className="p-0">
                  <Typography variant="base" className="text-[#BCBCBC]">
                    {faq.answer}
                  </Typography>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>

      <Card className="mt-8 border-[#2A2B2B] bg-[#0D0D0D]">
        <CardHeader>
          <CardTitle>Still have questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="base" className="text-[#BCBCBC] mb-4">
            Can&apos;t find the answer you&apos;re looking for? Please get in touch with our friendly team.
          </Typography>
          <Link to="/contact-us">
            <Button className="bg-[#FEB64D] text-black hover:bg-[#FEA52D]">
              Contact Us
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

