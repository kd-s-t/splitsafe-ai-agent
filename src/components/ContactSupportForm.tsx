'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { getSplitSafeApiUrl } from '@/lib/integrations/splitsafe'
import { Mail, MessageSquare, Send, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactSupportForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Use apiCall which handles JWT token automatically
      const { apiCall } = await import('@/lib/internal/auth/api-client');
      
      const response = await apiCall('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      let responseData
      try {
        responseData = await response.json()
        console.log('Response data:', responseData)
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError)
        try {
          const textResponse = await response.text()
          console.log('Raw response text:', textResponse)
          responseData = { error: `Server error: ${textResponse.substring(0, 100)}` }
        } catch (textError) {
          console.error('Failed to read response as text:', textError)
          responseData = { error: `Server error (${response.status}): Unable to read response` }
        }
      }

      if (response.ok) {
        toast.success('Message sent successfully!', {
          description: "We'll get back to you soon."
        })

        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        // Get the specific error message from the API response
        const errorMessage = responseData?.error || `Server error (${response.status})`
        console.error('API Error:', responseData)
        toast.success('Failed to send message:', {
          description: errorMessage
        })
      }
    } catch (error) {
      console.error('Network or other error:', error)
      toast.error('Failed to send message', {
        description: 'Please try again or contact us directly at info@thesplitsafe.com'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent hydration mismatch by only rendering after client-side mount
  if (!isMounted) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-white text-2xl font-semibold flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#FEB64D]" />
            Contact Support
          </CardTitle>
          <Typography variant="muted" className="text-[#BCBCBC]">
            Send us a message and we&apos;ll get back to you as soon as possible
          </Typography>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-[#2A2A2A] rounded animate-pulse" />
                <div className="h-10 bg-[#2A2A2A] rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-[#2A2A2A] rounded animate-pulse" />
                <div className="h-10 bg-[#2A2A2A] rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-[#2A2A2A] rounded animate-pulse" />
              <div className="h-10 bg-[#2A2A2A] rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-[#2A2A2A] rounded animate-pulse" />
              <div className="h-24 bg-[#2A2A2A] rounded animate-pulse" />
            </div>
            <div className="h-12 bg-[#2A2A2A] rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white text-2xl font-semibold flex items-center gap-2">
          <Mail className="w-6 h-6 text-[#FEB64D]" />
          Contact Support
        </CardTitle>
        <Typography variant="muted" className="text-[#BCBCBC]">
          Send us a message and we&apos;ll get back to you as soon as possible
        </Typography>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="bg-[#2A2A2A] border-[#404040] text-white placeholder:text-[#BCBCBC] focus:border-[#FEB64D]"
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="bg-[#2A2A2A] border-[#404040] text-white placeholder:text-[#BCBCBC] focus:border-[#FEB64D]"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-white mb-2">
              Subject *
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="bg-[#2A2A2A] border-[#404040] text-white placeholder:text-[#BCBCBC] focus:border-[#FEB64D]"
              placeholder="Brief description of your issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-white mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Message *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="bg-[#2A2A2A] border-[#404040] text-white placeholder:text-[#BCBCBC] focus:border-[#FEB64D] resize-none"
              placeholder="Please describe your issue or question in detail..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold py-3"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-[#2A2A2A] rounded-lg">
          <Typography variant="muted" className="text-[#BCBCBC] text-sm">
            <strong>Alternative contact:</strong> You can also reach us directly at{' '}
            <a
              href="mailto:info@thesplitsafe.com"
              className="text-[#FEB64D] hover:underline"
            >
              info@thesplitsafe.com
            </a>
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}
