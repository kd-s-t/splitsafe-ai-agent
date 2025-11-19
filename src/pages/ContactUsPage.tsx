import ContactSupportForm from '@/components/ContactSupportForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { ArrowLeft, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ContactUsPage() {
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
              <Mail className="w-6 h-6 text-black" />
            </div>
            <div>
              <Typography variant="h1" className="text-white text-4xl font-bold">
                Contact Us
              </Typography>
              <Typography variant="muted" className="text-[#BCBCBC] text-lg mt-2">
                Get in touch with our support team
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-semibold">
              Send us a Message
            </CardTitle>
            <Typography variant="muted" className="text-[#BCBCBC]">
              We&apos;ll get back to you as soon as possible
            </Typography>
          </CardHeader>
          <CardContent>
            <ContactSupportForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

