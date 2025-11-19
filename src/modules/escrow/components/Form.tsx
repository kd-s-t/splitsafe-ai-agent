"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { useUser } from "@/hooks/useUser";
import { AnimatePresence, motion } from "framer-motion";
import { Bitcoin, Info, LucideInfo, Plus, Sparkles, Trash2 } from "lucide-react";

import { useFieldArray } from "react-hook-form";

import { useContacts } from '@/modules/contacts/hooks';

import ContactCombobox from "@/components/ContactCombobox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EscrowFormProps } from '@/modules/escrow/types';
import { RANDOM_TITLES } from '@/modules/shared.constants';

const Form = ({ form }: EscrowFormProps) => {
  const { getValues, setValue, control, watch, register, formState: { errors } } = form;
  const { ckbtcBalance } = useUser();
  const { contacts, contactsLoading } = useContacts();

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "recipients"
  });

  const watchedRecipients = watch("recipients");
  const totalAllocation = watchedRecipients?.reduce((sum: number, recipient: { percentage: string | number }) => sum + (Number(recipient.percentage) || 0), 0) || 0;

  const generateTitle = () => {
    const randomTitle = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
    setValue("title", randomTitle);
  };

  const addRecipient = () => {
    const newId = `recipient-${fields.length + 1}`;
    append({
      id: newId,
      name: `Recipient ${fields.length + 1}`,
      principal: "",
      percentage: 0
    });
  };

  const removeRecipient = (index: number) => {
    if (fields.length > 1) {
      const currentRecipients = getValues().recipients;

      const remainingRecipients = currentRecipients.filter((_: unknown, i: number) => i !== index);
      if (remainingRecipients.length > 0) {
        const equalPercentage = Math.floor(100 / remainingRecipients.length);
        const remainder = 100 - (equalPercentage * remainingRecipients.length);

        remainingRecipients.forEach((recipient: { percentage: string | number }, i: number) => {
          const newPercentage = equalPercentage + (i === 0 ? remainder : 0);
          setValue(`recipients.${i < index ? i : i + 1}.percentage`, newPercentage);
        });
      }

      remove(index);
    }
  };




  return (
    <div className="flex flex-col gap-4 w-full max-w-none">
      {/* Escrow Setup Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-[#F97A15]" />
            <Typography variant="large" className="text-white">Escrow setup</Typography>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[#A1A1A1]">Title</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateTitle}
                  className="text-[#FEB64D] hover:text-[#FEB64D] hover:bg-[#FEB64D]/10 p-1 h-auto"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
            <Input
              {...register("title")}
              placeholder="e.g., Freelance project payment"
              className={`text-white ${errors.title ? '!border-[#FF5050]' : ''}`}
            />
            {errors.title && (
              <Typography variant="small" className="text-[#FF5050]">{errors.title.message}</Typography>
            )}
          </div>

          {/* BTC Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[#A1A1A1]">BTC amount</Label>
              <span className="text-white text-sm">
                {ckbtcBalance ? `${ckbtcBalance} BTC` : "0.00000000 BTC"}
              </span>
            </div>
            <Input
              {...register("btcAmount")}
              type="number"
              step="0.00000001"
              placeholder="0.00000000"
              className={`text-white ${errors.btcAmount ? '!border-[#FF5050]' : ''}`}
            />
            {errors.btcAmount && (
              <Typography variant="small" className="text-[#FF5050]">{errors.btcAmount.message}</Typography>
            )}
          </div>
        </CardContent>


        <hr className="text-[#424444] mt-6 mb-4" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Typography variant="large" className="text-white">Recipients & split allocation</Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={addRecipient}
              className="text-white hover:bg-[#303333] gap-2"
            >
              <Plus className="w-4 h-4" />
              Add recipient
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#1F374F] border border-[#0077FF] rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#71B5FF] mt-0.5 flex-shrink-0" />
              <div>
                <Typography variant="base" className="text-[#71B5FF] font-medium mb-1">
                  Recipient ID required
                </Typography>
                <Typography variant="small" className="text-white">
                  Enter recipient&apos;s ICP Principal ID. SplitSafe will route BTC payouts automatically.
                </Typography>
              </div>
            </div>
          </div>

          {/* Recipients List */}
          <div className="space-y-3">
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#2B2B2B] border border-[#424242] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="base" className="text-white font-medium">
                      {watchedRecipients?.[index]?.name || `Recipient ${index + 1}`}
                    </Typography>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                        className="w-8 h-8 !p-0 bg-[#353535] hover:bg-[#404040] !rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-[#F64B4B]" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4 space-y-2">
                        <Label className="text-[#A1A1A1]">Name</Label>
                        <Input
                          {...register(`recipients.${index}.name`)}
                          placeholder="Recipient name"
                          className={`text-white ${errors.recipients?.[index]?.name ? '!border-[#FF5050]' : ''}`}
                        />
                        {errors.recipients?.[index]?.name && (
                          <Typography variant="small" className="text-[#FF5050]">{errors.recipients[index]?.name?.message}</Typography>
                        )}
                      </div>
                      <div className="md:col-span-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[#A1A1A1]">ICP address</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <LucideInfo size={14} className="hover:text-[#FEB64D]" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="container-gray !w-[350px]" withArrow={false}>
                              Enter recipient&apos;s ICP Principal ID. SplitSafe will route BTC payouts automatically. Or you can also search by name if the recipient is already under your associate contacts.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ContactCombobox
                          value={(() => {
                            const principal = watchedRecipients?.[index]?.principal;
                            if (typeof principal === 'string') return principal;
                            if (principal && typeof principal === 'object' && 'toText' in principal) {
                              return (principal as { toText: () => string }).toText();
                            }
                            return '';
                          })()}
                          onChange={(value) => setValue(`recipients.${index}.principal`, value)}
                          onNameChange={(name) => setValue(`recipients.${index}.name`, name)}
                          contacts={contacts}
                          contactsLoading={contactsLoading}
                          selectedPrincipals={(() => {
                            // Get all selected principals except the current one
                            return watchedRecipients
                              ?.map((recipient, i) => {
                                if (i === index) return null; // Skip current recipient
                                const principal = recipient?.principal;
                                if (typeof principal === 'string') return principal;
                                if (principal && typeof principal === 'object' && 'toText' in principal) {
                                  return (principal as { toText: () => string }).toText();
                                }
                                return null;
                              })
                              .filter((principal): principal is string => principal !== null) || [];
                          })()}
                          placeholder="ICP Principal ID"
                          error={!!errors.recipients?.[index]?.principal}
                        />
                        {errors.recipients?.[index]?.principal && (
                          <Typography variant="small" className="text-[#FF5050]">{errors.recipients[index]?.principal?.message}</Typography>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-[#A1A1A1]">Percentage</Label>
                        <Input
                          {...register(`recipients.${index}.percentage`)}
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="0"
                          className={`text-white ${errors.recipients?.[index]?.percentage ? '!border-[#FF5050]' : ''}`}
                        />
                        {errors.recipients?.[index]?.percentage && (
                          <Typography variant="small" className="text-[#FF5050]">{errors.recipients[index]?.percentage?.message}</Typography>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total Allocation */}
          <div className="flex justify-between items-center pt-3 border-t border-[#424242]">
            <Typography variant="muted" className="text-[#9F9F9F]">Total allocation:</Typography>
            <Typography
              variant="small"
              className={`font-medium ${totalAllocation === 100 ? 'text-[#FEB64D]' : 'text-[#FF5050]'}`}
            >
              {totalAllocation}%
            </Typography>
          </div>
          {totalAllocation !== 100 && totalAllocation > 0 && (
            <Typography variant="small" className="text-[#FF5050]">Total allocation must equal 100%</Typography>
          )}
          {errors.recipients && (
            <Typography variant="small" className="text-[#FF5050]">{errors.recipients.message}</Typography>
          )}
        </CardContent>
      </Card>

      {/* SEI Acceleration Option */}
      <Card className="bg-[#1A1A1A] border-[#404040]">
        <CardHeader>
          <Typography variant="large" className="text-white">Network Acceleration</Typography>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useSeiAcceleration"
              {...register("useSeiAcceleration")}
              className="w-4 h-4 text-[#FEB64D] bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#FEB64D] focus:ring-2"
            />
            <Label htmlFor="useSeiAcceleration" className="text-[#A1A1A1] cursor-pointer">
              Enable SEI Network Acceleration
            </Label>
          </div>
          <div className="bg-[#1F374F] border border-[#007AFF] rounded-[10px] p-3">
            <div className="flex items-start gap-2">
              <Info size={16} color='#71B5FF' className="mt-0.5 flex-shrink-0" />
              <Typography variant="small" className="text-white">
                SEI acceleration: Backend will use SEI for faster processing
                <br />
                Standard: ckBTC → BTC (direct, Bitcoin network fees only)
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Form;
