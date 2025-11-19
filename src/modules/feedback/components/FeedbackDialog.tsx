'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog-new';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/useUser';
import { RootState } from '@/lib';
import { submitFeedback } from '@/lib/internal/icp/feedback';
import { setIsFeedbackDialogOpen } from '@/lib/redux/store/dialogSlice';
import { feedbackSchema, type FeedbackFormData } from '@/validation/feedback';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Info, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function FeedbackDialog() {
  const dispatch = useDispatch();
  const { principal } = useUser();

  const { isFeedbackDialogOpen } = useSelector((state: RootState) => state.dialog);
  
  

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      rating: 0,
      message: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
    control,
    watch
  } = form;

  const rating = watch('rating');

  const handleOpenChange = (open: boolean) => {
    dispatch(setIsFeedbackDialogOpen(open));
    if (!open) {
      reset();
    }
  };

  const handleFormSubmit = async (data: FeedbackFormData) => {
    try {
      if (!principal) return;

      const result = await submitFeedback(data)

      if (result) {
        toast.success('Feedback sent successfully!', {
          description: 'Thank you for helping us improve SplitSafe!'
        })

        reset();
      } else {
        toast.error('Failed to send feedback', {
          description: 'Please try again or contact us directly at info@thesplitsafe.com'
        })
      }

      handleOpenChange(false);
    } catch (error) {
      toast.error('Failed to send feedback', {
        description: error instanceof Error ? error.message : 'Please try again or contact us directly at info@thesplitsafe.com'
      })
    }
  };

  return (
    <Dialog open={isFeedbackDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="!bg-[#313030] border border-[#303434] !w-[712px] !max-w-[90vw] max-h-[90vh] overflow-scroll !rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Share your feedback
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Help us improve SplitSafe by sharing your thoughts and experiences.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Rating Section */}
            <FormField
              control={control}
              name="rating"
              render={({ fieldState }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          variant="ghost"
                          size="icon"
                          key={star}
                          type="button"
                          onClick={() => setValue('rating', star)}
                          className={`!text-3xl transition-colors ${star <= rating
                            ? 'text-[#FEB64D]'
                            : 'text-[#5A5E5E] hover:text-[#FEB64D]/50'
                            }`}
                        >
                          ★
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Name Input */}
            <FormField
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your full name"
                      {...field}
                      className="bg-[#3D3D3D] border-[#5A5E5E] text-white placeholder:text-[#A1A1AA] focus:border-[#FEB64D]"
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Email Input */}
            <FormField
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your email address"
                      {...field}
                      className="bg-[#3D3D3D] border-[#5A5E5E] text-white placeholder:text-[#A1A1AA] focus:border-[#FEB64D]"
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Message Input */}
            <FormField
              control={control}
              name="message"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide detailed feedback about your experience, suggestions for improvement, or report any issues you encountered.."
                      rows={8}
                      {...field}
                      className="bg-[#3D3D3D] border-[#5A5E5E] resize-none min-h-[100px]"
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Privacy Note */}
            <Alert className="bg-[#1F3751] border-[#007AFF]">
              <Info color='#71B5FF' size={18} />
              <AlertTitle className='text-[#71B5FF] font-semibold'>Privacy note</AlertTitle>
              <AlertDescription className='text-sm'>
                Your feedback is valuable to us and will be used to improve SplitSafe. We may contact you for follow-up questions if needed.
              </AlertDescription>
            </Alert>

            <DialogFooter className="flex t-2">
              <motion.div className="relative overflow-hidden w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Send feedback
                    </>
                  )}
                </Button>
                {isSubmitting && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 2,
                    }}
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                      transform: "skewX(-20deg)",
                    }}
                  />
                )}
              </motion.div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
