'use client';

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
import { Separator } from '@/components/ui/separator';
import { Contact } from '@/lib/internal/icp/contacts';
import { contactFormSchema, type ContactFormData } from '@/validation/contacts';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CONTACT_DIALOG } from '../constants';
interface AddUpdateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'add' | 'update';
  contact?: Contact;
  handleSaveContact: (data: ContactFormData, mode: 'add' | 'update', contact?: Contact) => Promise<boolean>;
}

export default function AddUpdateContactDialog({
  open,
  onOpenChange,
  mode = 'add',
  contact = undefined,
  handleSaveContact,
}: AddUpdateContactDialogProps) {

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nickname: '',
      principalId: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
    control
  } = form;

  // Reset form when dialog opens or contact changes
  useEffect(() => {
    if (open) {
      if (mode === 'update' && contact) {
        setValue('nickname', contact.nickname);
        setValue('principalId', contact.principalid.toString());
      } else {
        reset();
      }
    }
  }, [open, mode, contact, setValue, reset]);

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      await handleSaveContact(data, mode, contact);
      // Close dialog after successful operation
      onOpenChange(false);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-[#212121] border border-[#303333] !w-[456px] !max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {mode === 'add' ? CONTACT_DIALOG.ADD_TITLE : CONTACT_DIALOG.UPDATE_TITLE}
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            {mode === 'add' ? CONTACT_DIALOG.ADD_DESCRIPTION : CONTACT_DIALOG.UPDATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-1 bg-[#424444] h-0.25" />

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="nickname"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a nickname for this contact" {...field} />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="principalId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Principal ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the contact's Principal ID" {...field} />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <DialogFooter className="flex space-x-3 pt-4">
              <motion.div className="relative overflow-hidden w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-sm bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {mode === 'add' ? 'Adding...' : 'Updating...'}
                    </>
                  ) : (
                    mode === 'add' ? 'Add Contact' : 'Update Contact'
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
