import ContactCombobox from "@/components/ContactCombobox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { useContacts } from '@/modules/contacts/hooks';
import { Milestone, MilestoneRecipientRequest } from "@/validation/escrow";
import { Calendar, Edit, LucideInfo, Plus, Trash2 } from "lucide-react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Control, FieldValues, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

interface MilestoneConfigurationProps {
  form: {
    getValues: (name?: string) => unknown;
    setValue: (name: string, value: unknown) => void;
    watch: (name: string) => unknown;
    control: Control<FieldValues>;
  };
  setExpandedMilestones?: React.Dispatch<React.SetStateAction<Set<string>>>
}

const MilestoneConfiguration = ({
  form,
  setExpandedMilestones
}: MilestoneConfigurationProps) => {

  const contractFileInputRef = useRef<HTMLInputElement>(null);

  const { getValues, setValue, watch, control } = form;
  const { contacts, contactsLoading } = useContacts();

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestoneField } = useFieldArray({
    control: control,
    name: "milestones"
  });

  const watchedMilestones = watch("milestones");

  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  // const countries = [
  //   { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  //   { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  //   { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  //   { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  //   { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  //   { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  //   { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  //   { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  //   { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  //   { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  // ];

  const addMilestone = () => {
    const currentMilestones = getValues("milestones");
    const startDate = getValues("startDate");

    if (startDate) {
      // Validate start date
      new Date(String(startDate));
    }

    const startTime = startDate ? new Date(String(startDate)).getTime() : Date.now();
    const endTime = startTime + (12 * 30 * 24 * 60 * 60 * 1000); // 12 months later

    const newMilestone: Milestone = {
      id: `mlstne-${(currentMilestones as unknown[]).length + 1}`,
      title: `Milestone ${(currentMilestones as unknown[]).length + 1}`,
      allocation: 0.001, // Default allocation (smaller default)
      coin: 'ckbtc',
      recipients: [], // Start with empty recipients array
      startDate: startTime,
      endDate: endTime,
      createdAt: Date.now(),
      frequency: 'day-1',
      duration: 12, // Default to 12 months
      contractFile: undefined // No contract file by default
    };

    appendMilestone(newMilestone);

    // Calculate and update total BTC amount from milestone allocations
    const updatedMilestones = [...(currentMilestones as unknown[]), newMilestone];
    const totalMilestoneAmount = updatedMilestones.reduce((sum: number, milestone: unknown) => sum + ((milestone as Milestone).allocation || 0), 0);
    setValue("btcAmount", totalMilestoneAmount.toString());

    // Auto-expand the newly created milestone
    setExpandedMilestones?.((prev: Set<string>) => new Set([...prev, newMilestone.id]));

    toast.success("Milestone added successfully", { description: "Add recipients as needed." });
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = getValues("milestones");
    removeMilestoneField(index);

    // Recalculate and update total BTC amount from remaining milestone allocations
    const updatedMilestones = (currentMilestones as unknown[]).filter((_: unknown, i: number) => i !== index);
    const totalMilestoneAmount = updatedMilestones.reduce((sum: number, milestone: unknown) => sum + ((milestone as Milestone).allocation || 0), 0);
    setValue("btcAmount", totalMilestoneAmount.toString());

    toast.success("Success", { description: "Milestone removed" });
  };

  const addMilestoneRecipient = (milestoneIndex: number) => {
    const currentMilestone = getValues(`milestones.${milestoneIndex}`) as Milestone;
    const newRecipient: MilestoneRecipientRequest = {
      id: `rcpnt-${currentMilestone.recipients.length + 1}`,
      name: `Recipient ${currentMilestone.recipients.length + 1}`,
      principal: "",
      share: 0
    };

    const updatedRecipients = [...currentMilestone.recipients, newRecipient];
    setValue(`milestones.${milestoneIndex}.recipients`, updatedRecipients);
    toast.success("Success", { description: "Recipient added to milestone" });
  };

  const removeMilestoneRecipient = (milestoneIndex: number, recipientIndex: number) => {
    const currentMilestone = getValues(`milestones.${milestoneIndex}`) as Milestone;
    if (currentMilestone.recipients.length > 1) {
      const updatedRecipients = currentMilestone.recipients.filter((_: MilestoneRecipientRequest, index: number) => index !== recipientIndex);
      setValue(`milestones.${milestoneIndex}.recipients`, updatedRecipients);
      toast.success("Success", { description: "Recipient removed from milestone" });
    } else {
      toast.error("Error", { description: "At least one recipient is required for each milestone" });
    }
  };

  useEffect(() => {
    if (watchedMilestones && Array.isArray(watchedMilestones) && watchedMilestones.length > 0) {
      const total = (watchedMilestones as unknown[]).reduce((sum: number, milestone: unknown) => sum + (((milestone as Milestone).allocation) || 0), 0);
      const currentAmount = getValues("btcAmount");

      // Only update if the total has actually changed to prevent infinite loops
      if (currentAmount !== total.toString()) {
        setValue("btcAmount", total.toString());
      }
    }
  }, [watchedMilestones, setValue, getValues]);

  return (
    <Fragment>
      <Separator className="h-0.25 bg-[#424444]" />

      {/* Contract File Upload */}
      <Typography variant="h4" className="mb-3">Contract</Typography>

      <div className="mb-4">
        <FormField
          control={control}
          name="contractFile"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-[#A1A1A1] justify-between">
                File <span className="text-[#666]">Optional</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <InputGroup>
                    <InputGroupInput
                      ref={contractFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Check file size (2MB limit for ICP)
                          const maxSize = 2 * 1024 * 1024; // 2MB in bytes
                          if (file.size > maxSize) {
                            toast.error('File too large', { description: `Maximum size is 2MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` });
                            return;
                          }

                          // Convert file to base64 string
                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64 = reader.result as string;
                            field.onChange(base64);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          field.onChange(undefined);
                        }
                      }}
                      className="!text-[#A1A1AA] file:hidden file:mr-2 file:pr-2 file:text-sm file:font-semibold file:border-r"
                    />
                    <InputGroupAddon className="border-r pr-2 border-r-[#5A5E5E]" onClick={() => contractFileInputRef.current?.click()}>
                      Choose file
                    </InputGroupAddon>
                  </InputGroup>
                  {field.value && (
                    <div className="flex items-center gap-2 p-2 bg-[#2A2A2A] border border-[#404040] rounded-lg">
                      <span className="text-[#FEB64D] text-sm">📄</span>
                      <span className="text-white text-sm">Contract file uploaded</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.onChange(undefined)}
                        className="ml-auto text-[#FF5050] hover:text-[#FF5050] hover:bg-[#FF5050]/10"
                      >
                        Remove
                      </Button>
                    </div>
                  )}

                </div>
              </FormControl>
              {fieldState?.error && (
                <FormMessage>{fieldState.error?.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <Typography variant="large" className="text-white">Milestone configuration</Typography>
        <Button
          variant="ghost"
          size="sm"
          onClick={addMilestone}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </Button>
      </div>
      <div className="space-y-4 mt-3">
        {/* Milestones List */}
        <div className="space-y-3">
          <Typography variant="muted">
            Milestones ({milestoneFields.length})
          </Typography>

          {milestoneFields.length === 0 ? (
            <div className="bg-[#2B2B2B] border border-[#424444] rounded-lg p-4">
              <div className="text-center text-[#9F9F9F]">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <Typography variant="small">
                  No milestones added yet. Click &quot;Add Milestone&quot; to create your first milestone.
                </Typography>
              </div>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {milestoneFields.map((field, index) => (
                <AccordionItem
                  key={field.id}
                  value={field.id}
                  className="bg-[#2B2B2B] border border-[#424444] rounded-lg overflow-hidden"
                >
                  <AccordionTrigger
                    downIconPosition="left"
                    downIconClassName="-mt-1"
                    triggerOnIcon={true}
                    className="bg-[#373737] px-4 !py-3 border-b border-[#A1A1AA] transition-colors [&[data-state=open]]:bg-[#2C2C2C] !items-center"
                  >
                    <div className="flex items-center justify-between w-full">
                      {editingMilestone === field.id ? (
                        <Input
                          value={(watchedMilestones as Milestone[])?.[index]?.title || `Milestone ${index + 1}`}
                          onChange={(e) => {
                            setValue(`milestones.${index}.title`, e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingMilestone(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                          className="!w-auto !border !border-[#5A5E5E] !bg-[#2B2B2B] !text-white pointer-events-auto !px-2 !py-1 !rounded"
                          autoFocus
                        />
                      ) : (
                        <Typography
                          variant="base"
                          className="text-white font-semibold cursor-pointer hover:text-[#FEB64D] transition-colors pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMilestone(field.id);
                          }}
                        >
                          {(watchedMilestones as Milestone[])?.[index]?.title || `Milestone ${index + 1}`}
                        </Typography>
                      )}
                      <div className="flex items-center gap-4 pointer-events-auto">
                        <Typography variant="small" className="text-[#9F9F9F]">
                          Allocation: {(watchedMilestones as Milestone[])?.[index]?.allocation || 0} BTC
                        </Typography>
                        <div className="flex items-center gap-2">
                          <Typography variant="small" className="text-[#9F9F9F]">Start:</Typography>
                          {editingMilestone === field.id ? (
                            <Input
                              type="date"
                              value={new Date((watchedMilestones as Milestone[])?.[index]?.startDate || Date.now()).toISOString().split('T')[0] || ''}
                              onChange={(e) => {
                                const newStartDate = new Date(e.target.value).getTime();
                                setValue(`milestones.${index}.startDate`, newStartDate);
                                // Update end date when start date changes
                                const milestone = (watchedMilestones as Milestone[])?.[index];
                                if (milestone) {
                                  const newEndDate = newStartDate + (milestone.duration * 30 * 24 * 60 * 60 * 1000);
                                  setValue(`milestones.${index}.endDate`, newEndDate);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              className="!w-40 !h-8 !text-sm !border-[#5A5E5E] !bg-[#2B2B2B] !text-white inline-block !px-2 !py-1"
                              style={{ display: 'inline-block', width: '160px', height: '32px', minWidth: '160px' }}
                            />
                          ) : (
                            <span className="cursor-pointer hover:text-[#FEB64D] transition-colors" onClick={(e) => {
                              e.stopPropagation();
                              setEditingMilestone(field.id);
                            }}>
                              {new Date((watchedMilestones as Milestone[])?.[index]?.startDate || Date.now()).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Typography variant="small" className="text-[#9F9F9F]">Duration:</Typography>
                          {editingMilestone === field.id ? (
                            <>
                              <Input
                                type="number"
                                min="1"
                                max="60"
                                value={(watchedMilestones as Milestone[])?.[index]?.duration || 1}
                                onChange={(e) => {
                                  const newDuration = parseInt(e.target.value) || 1;
                                  setValue(`milestones.${index}.duration`, newDuration);
                                  // Update end date when duration changes
                                  const milestone = (watchedMilestones as Milestone[])?.[index];
                                  if (milestone) {
                                    const newEndDate = milestone.startDate + (newDuration * 30 * 24 * 60 * 60 * 1000);
                                    setValue(`milestones.${index}.endDate`, newEndDate);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                className="!w-20 !h-8 !text-sm !border-[#5A5E5E] !bg-[#2B2B2B] !text-white inline-block !px-2 !py-1"
                                style={{ display: 'inline-block', width: '80px', height: '32px', minWidth: '80px' }}
                              />
                              <span className="text-[#9F9F9F] text-sm ml-1">months</span>
                            </>
                          ) : (
                            <span className="cursor-pointer hover:text-[#FEB64D] transition-colors" onClick={(e) => {
                              e.stopPropagation();
                              setEditingMilestone(field.id);
                            }}>
                              {(watchedMilestones as Milestone[])?.[index]?.duration || 1} months
                            </span>
                          )}
                        </div>
                        <Separator orientation="vertical" className="bg-[#5A5E5E] !h-[18px]" />
                        {editingMilestone !== field.id ? (
                          <>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMilestone(field.id);
                              }}
                              className="w-9 h-8 p-0 bg-[#404040] hover:bg-[#404040] rounded-full cursor-pointer flex items-center justify-center"
                            >
                              <Edit className="w-4 h-4 text-white" />
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMilestone(index);
                              }}
                              className="w-9 h-8 p-0 bg-[#404040] hover:bg-[#FF5050] rounded-full cursor-pointer flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 text-[#F64C4C] hover:text-white" />
                            </div>
                          </>) : (
                          <>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMilestone(null);
                              }}
                              className="w-16 h-8 p-0 bg-[#FEB64D] text-sm cursor-pointer flex items-center justify-center rounded text-black font-medium"
                            >
                              Save
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMilestone(null);
                              }}
                              className="w-16 h-8 p-0 bg-[#404040] border border-[#A1A1AA] text-sm text-white cursor-pointer flex items-center justify-center rounded"
                            >
                              Cancel
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="overflow-hidden space-y-4">
                    {/* Milestone Configuration */}
                    {/* Milestone Recipients Section */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Typography variant="base" className="text-white font-semibold">
                          Recipients ({(watchedMilestones as Milestone[])?.[index]?.recipients?.length || 0})
                        </Typography>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addMilestoneRecipient(index)}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add recipient
                        </Button>
                      </div>

                      {/* Recipients List */}
                      <div className="space-y-3">
                        {(watchedMilestones as Milestone[])?.[index]?.recipients?.length === 0 ? (
                          <div className="bg-[#242424] border border-[#424444] rounded-lg p-6 text-center">
                            <div className="text-[#9F9F9F]">
                              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <Typography variant="small">
                                No recipients added yet. Click &quot;Add recipient&quot; to add recipients for this milestone.
                              </Typography>
                            </div>
                          </div>
                        ) : (
                          (watchedMilestones as Milestone[])?.[index]?.recipients?.map((recipient: MilestoneRecipientRequest, recipientIndex: number) => (
                            <div key={recipient.id} className="bg-[#242424] border border-[#424444] rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <Typography variant="base" className="text-white font-medium">
                                  Recipient {recipientIndex + 1}
                                </Typography>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMilestoneRecipient(index, recipientIndex)}
                                  className="w-8 h-8 !p-0 hover:bg-[#404040] !rounded-full"
                                >
                                  <Trash2 className="w-4 h-4 text-[#F64C4C]" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                                  <FormField
                                    control={control}
                                    name={`milestones.${index}.recipients.${recipientIndex}.name`}
                                    render={({ field, fieldState }) => (
                                      <FormItem className="col-span-3">
                                        <FormLabel className="text-[#A1A1A1]">Name</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Input text placeholder"
                                            className="text-white"
                                            {...field}
                                            value={field.value || ''}
                                          />
                                        </FormControl>
                                        {fieldState?.error && (
                                          <FormMessage>{fieldState.error?.message}</FormMessage>
                                        )}
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={control}
                                    name={`milestones.${index}.recipients.${recipientIndex}.principal`}
                                    render={({ field, fieldState }) => (
                                      <FormItem className="col-span-3">
                                        <div className="flex items-center gap-1">
                                          <FormLabel className="text-[#A1A1A1]">ICP address</FormLabel>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <LucideInfo size={14} className="text-[#A1A1A1] hover:text-[#FEB64D]" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="container-gray !w-[350px]" withArrow={false}>
                                              Enter recipient’s ICP Principal ID. SplitSafe will route BTC payouts automatically. Or you can also search by name if the recipient is already under your associate contacts.
                                            </TooltipContent>
                                          </Tooltip>
                                        </div>
                                        <FormControl>
                                          <ContactCombobox
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onNameChange={(name) => setValue(`milestones.${index}.recipients.${recipientIndex}.name`, name)}
                                            contacts={contacts}
                                            contactsLoading={contactsLoading}
                                            selectedPrincipals={(() => {
                                              // Get all selected principals except the current one
                                              return (watchedMilestones as Milestone[])
                                                ?.flatMap((milestone: Milestone) => milestone.recipients || [])
                                                .map((recipient: MilestoneRecipientRequest) => {
                                                  const principal = recipient?.principal;
                                                  if (typeof principal === 'string') return principal;
                                                  if (principal && typeof principal === 'object' && 'toText' in principal) {
                                                    return (principal as { toText: () => string }).toText();
                                                  }
                                                  return null;
                                                })
                                                .filter((principal: string | null): principal is string => principal !== null) || [];
                                            })()}
                                            placeholder="ICP Principal ID"
                                            error={!!fieldState?.error}
                                          />
                                        </FormControl>
                                        {fieldState?.error && (
                                          <FormMessage>{fieldState.error?.message}</FormMessage>
                                        )}
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={control}
                                    name={`milestones.${index}.recipients.${recipientIndex}.share`}
                                    render={({ field, fieldState }) => (
                                      <FormItem className="col-span-2">
                                        <FormLabel className="text-[#A1A1A1]">Share (%)</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            placeholder="0"
                                            className="text-white"
                                            {...field}
                                            value={field.value || ''}
                                          />
                                        </FormControl>
                                        {fieldState?.error && (
                                          <FormMessage>{fieldState.error?.message}</FormMessage>
                                        )}
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={control}
                                    name={`milestones.${index}.recipients.${recipientIndex}.phone.number`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <FormLabel className="text-[#A1A1A1] justify-between">Phone <span className="text-[#666]">Optional</span></FormLabel>
                                        <FormControl>
                                          <div className="flex gap-2">
                                            <FormField
                                              control={control}
                                              name={`milestones.${index}.recipients.${recipientIndex}.phone.country`}
                                              render={({ field: countryField }) => (
                                                <Select
                                                  value={countryField.value || "+1"}
                                                  onValueChange={countryField.onChange}
                                                >
                                                  <SelectTrigger className="w-[10%] p-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-white focus:ring-2 focus:ring-[#FEB64D] focus:border-[#FEB64D]">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent className="bg-[#2A2A2A] border-[#404040] max-h-60 overflow-y-auto">
                                                    <SelectItem value="+1" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇺🇸 +1
                                                    </SelectItem>
                                                    <SelectItem value="+44" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇬🇧 +44
                                                    </SelectItem>
                                                    <SelectItem value="+49" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇩🇪 +49
                                                    </SelectItem>
                                                    <SelectItem value="+33" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇫🇷 +33
                                                    </SelectItem>
                                                    <SelectItem value="+81" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇯🇵 +81
                                                    </SelectItem>
                                                    <SelectItem value="+61" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇦🇺 +61
                                                    </SelectItem>
                                                    <SelectItem value="+86" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇨🇳 +86
                                                    </SelectItem>
                                                    <SelectItem value="+91" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇮🇳 +91
                                                    </SelectItem>
                                                    <SelectItem value="+55" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇧🇷 +55
                                                    </SelectItem>
                                                    <SelectItem value="+52" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                                                      🇲🇽 +52
                                                    </SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              )}
                                            />
                                            <Input
                                              placeholder="+1 (000) 000-0000"
                                              className="text-white w-[90%]"
                                              {...field}
                                              value={field.value || ''}
                                            />
                                          </div>
                                        </FormControl>
                                        {fieldState?.error && (
                                          <FormMessage>{fieldState.error?.message}</FormMessage>
                                        )}
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={control}
                                    name={`milestones.${index}.recipients.${recipientIndex}.email`}
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <FormLabel className="text-[#A1A1A1] justify-between">Email address <span className="text-[#666]">Optional</span></FormLabel>
                                        <FormControl>
                                          <Input
                                            type="email"
                                            placeholder="Input text placeholder"
                                            className="text-white"
                                            {...field}
                                            value={field.value || ''}
                                          />
                                        </FormControl>
                                        {fieldState?.error && (
                                          <FormMessage>{fieldState.error?.message}</FormMessage>
                                        )}
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={control}
                                  name={`milestones.${index}.recipients.${recipientIndex}.billingAddress`}
                                  render={({ field, fieldState }) => (
                                    <FormItem>
                                      <FormLabel className="text-[#A1A1A1] justify-between">Billing address <span className="text-[#666]">Optional</span></FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Input text placeholder"
                                          className="text-white"
                                          {...field}
                                          value={field.value || ''}
                                        />
                                      </FormControl>
                                      {fieldState?.error && (
                                        <FormMessage>{fieldState.error?.message}</FormMessage>
                                      )}
                                    </FormItem>
                                  )}
                                />

                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Total Allocation */}
                      <div className="mt-4 pt-3 border-t border-[#424444]">
                        <div className="flex justify-between items-center">
                          <Typography variant="base" className="text-[#A1A1A1]">
                            Total allocation:
                          </Typography>
                          <Typography variant="base" className="text-[#FEB64D] font-semibold">
                            {(watchedMilestones as Milestone[])?.[index]?.recipients?.reduce((sum: number, recipient: MilestoneRecipientRequest) => sum + (Number(recipient.share) || 0), 0).toFixed(0)}%
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

      </div>
    </Fragment>
  );
};

export default MilestoneConfiguration;