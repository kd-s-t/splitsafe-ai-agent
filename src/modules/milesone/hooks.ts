import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { MILESTONE_CONSTANTS } from "./constants";
import { Milestone, MilestoneRecipient } from "./types";

export const useMilestoneForm = (form: UseFormReturn<Record<string, unknown>>) => {
  const { getValues, setValue } = form;
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const addMilestone = useCallback(() => {
    const currentMilestones = getValues("milestones") as Milestone[];
    const startDate = getValues("startDate") as string;

    // Calculate start date: if there are existing milestones, start when the last one ends
    // Otherwise, use the form's start date
    let milestoneStartDate: number;
    if (currentMilestones.length > 0) {
      const lastMilestone = currentMilestones[currentMilestones.length - 1];
      milestoneStartDate = lastMilestone.endDate || (lastMilestone.startDate + (lastMilestone.duration * 30 * 24 * 60 * 60 * 1000));
    } else {
      milestoneStartDate = startDate ? new Date(startDate).getTime() : Date.now();
    }

    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: `Milestone ${currentMilestones.length + 1}`,
      allocation: MILESTONE_CONSTANTS.DEFAULT_MILESTONE_ALLOCATION,
      coin: MILESTONE_CONSTANTS.DEFAULT_COIN_TYPE,
      recipients: [],
      startDate: milestoneStartDate,
      endDate: milestoneStartDate + (12 * 30 * 24 * 60 * 60 * 1000), // 12 months later
      createdAt: Date.now(),
      frequency: 'day-1' as const,
      duration: 12 // Default to 12 months
    };

    const updatedMilestones = [...currentMilestones, newMilestone];
    setValue("milestones", updatedMilestones);

    // Calculate and update total BTC amount from milestone allocations
    const totalMilestoneAmount = updatedMilestones.reduce((sum: number, milestone: Milestone) => sum + milestone.allocation, 0);
    setValue("btcAmount", totalMilestoneAmount.toString());

    setExpandedMilestones(prev => new Set([...prev, newMilestone.id]));
    toast.success("Milestone added successfully", { description: "Add recipients as needed." });
  }, [getValues, setValue, setExpandedMilestones]);

  const removeMilestone = useCallback((index: number) => {
    const currentMilestones = getValues("milestones") as Milestone[];
    const updatedMilestones = currentMilestones.filter((_, i: number) => i !== index);
    setValue("milestones", updatedMilestones);

    // Recalculate and update total BTC amount from remaining milestone allocations
    const totalMilestoneAmount = updatedMilestones.reduce((sum: number, milestone: Milestone) => sum + milestone.allocation, 0);
    setValue("btcAmount", totalMilestoneAmount.toString());

    toast.success("Success", { description: "Milestone removed" });
  }, [getValues, setValue]);

  const addMilestoneRecipient = useCallback((milestoneIndex: number) => {
    const currentMilestone = getValues(`milestones.${milestoneIndex}`) as Milestone;
    const newRecipient: MilestoneRecipient = {
      id: `rcpnt-${currentMilestone.recipients.length + 1}`,
      name: `Recipient ${currentMilestone.recipients.length + 1}`,
      principal: "",
      share: 0
    };

    const updatedRecipients = [...currentMilestone.recipients, newRecipient];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(`milestones.${milestoneIndex}.recipients` as any, updatedRecipients);
    toast.success("Success", { description: "Recipient added to milestone" });
  }, [getValues, setValue]);

  const removeMilestoneRecipient = useCallback((milestoneIndex: number, recipientIndex: number) => {
    const currentMilestone = getValues(`milestones.${milestoneIndex}`) as Milestone;
    if (currentMilestone.recipients.length > 1) {
      const updatedRecipients = currentMilestone.recipients.filter((_, index: number) => index !== recipientIndex);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue(`milestones.${milestoneIndex}.recipients` as any, updatedRecipients);
      toast.success("Success", { description: "Recipient removed from milestone" });
    } else {
      toast.error("Error", { description: "At least one recipient is required for each milestone" });
    }
  }, [getValues, setValue]);

  const toggleMilestoneExpansion = useCallback((milestoneId: string) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  }, [setExpandedMilestones]);

  return {
    expandedMilestones,
    addMilestone,
    removeMilestone,
    addMilestoneRecipient,
    removeMilestoneRecipient,
    toggleMilestoneExpansion,
  };
};
