"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { escrowFormSchema, Milestone } from "@/validation/escrow";
import { Bitcoin, Zap } from "lucide-react";
// import { useState } from "react";
import { useMemo } from "react";
import { Control, FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MilestoneConfiguration from "./MilestoneConfiguration";

type FormData = z.infer<typeof escrowFormSchema>;

// Interface for the form props passed to MilestoneConfiguration
interface MilestoneConfigurationFormProps {
  getValues: (name?: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  watch: (name: string) => unknown;
  control: Control<FieldValues>;
}

interface MilestoneFormProps {
  form: UseFormReturn<FormData>;
}

const MilestoneForm = ({ form }: MilestoneFormProps) => {
  const { setValue, control, watch } = form;
  // const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const ckbtcBalance = watch("btcAmount"); // Get BTC amount from form

  // Memoize the form object to prevent infinite re-renders
  const memoizedForm = useMemo(() => ({
    getValues: (name?: string) => form.getValues(name as keyof FormData),
    setValue: (name: string, value: unknown) => form.setValue(name as keyof FormData, value as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    watch: (name: string) => form.watch(name as keyof FormData),
    control: form.control as unknown as Control<FieldValues>
  } as MilestoneConfigurationFormProps), [form]);

  // Development helper function to populate form with test data
  const populateTestData = () => {
    if (process.env.NODE_ENV === 'production') {
      toast.error("Error", { description: "Test data population is only available in development" });
      return;
    }

    // Set form title
    setValue("title", "Large Scale Development Project");

    // Set start date to 15 days from now
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 15);
    setValue("startDate", startDate.toISOString().split('T')[0]);

    // Create 3 test milestones with your real ICP principals, totaling 10 BTC
    const timestamp = Date.now();
    const testMilestones: Milestone[] = [
      {
        id: "mlstne-1",
        title: "Phase 1: Foundation",
        allocation: 3.0, // 3 BTC
        coin: 'ckbtc',
        recipients: [
          {
            id: "rcpnt-1",
            name: "Ken",
            principal: "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae",
            share: 60, // 60%
          },
          {
            id: "rcpnt-2",
            name: "Yumis",
            principal: "yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae",
            share: 40, // 40%
          }
        ],
        startDate: startDate.getTime(),
        endDate: startDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000), // 6 months later
        createdAt: timestamp,
        frequency: 'day-1',
        duration: 6
      },
      {
        id: "mlstne-2",
        title: "Phase 2: Core Features",
        allocation: 4.0, // 4 BTC
        coin: 'ckbtc',
        recipients: [
          {
            id: "rcpnt-1",
            name: "Ken",
            principal: "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae",
            share: 60, // 60%
          },
          {
            id: "rcpnt-2",
            name: "Yumis",
            principal: "yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae",
            share: 40, // 40%
          }
        ],
        startDate: startDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000), // Start when Milestone 1 ends
        endDate: startDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000) + (8 * 30 * 24 * 60 * 60 * 1000), // 8 months after phase 2 start
        createdAt: timestamp,
        frequency: 'day-1',
        duration: 8
      },
      {
        id: "mlstne-3",
        title: "Phase 3: Polish & Launch",
        allocation: 3.0, // 3 BTC
        coin: 'ckbtc',
        recipients: [
          {
            id: "rcpnt-1",
            name: "Ken",
            principal: "6zxf5-nlgzi-3l3zt-wvymm-i5wg5-ps4ki-thcmh-z5kei-64fxa-vyaq6-rae",
            share: 50, // 50%
          },
          {
            id: "rcpnt-2",
            name: "Yumis",
            principal: "yetlc-kgqk7-mnktx-5gkj3-5bz2l-2uiip-k6i6u-vtaa7-hpiio-rjb7w-hae",
            share: 50, // 50%
          }
        ],
        startDate: startDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000) + (8 * 30 * 24 * 60 * 60 * 1000), // Start when Milestone 2 ends
        endDate: startDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000) + (8 * 30 * 24 * 60 * 60 * 1000) + (4 * 30 * 24 * 60 * 60 * 1000), // 4 months after phase 3 start
        createdAt: timestamp,
        frequency: 'day-1',
        duration: 4
      }
    ];

    // Clear existing milestones and add test milestones
    setValue("milestones", testMilestones);

    // Update total BTC amount (10 BTC total)
    setValue("btcAmount", "10.0");

    // Auto-expand all milestones
    // setExpandedMilestones(new Set(testMilestones.map(m => m.id)));

    toast.success("Success", { description: "Test data populated! 3 milestones, 2 recipients each, 10 BTC total." });
  };

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4 w-full max-w-none">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-[#F97A15]" />
                <Typography variant="large" className="text-white">Milestone setup</Typography>
              </div>
              {/* Development-only populate button */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={populateTestData}
                  className="text-[#00FF88] hover:bg-[#00FF88]/10 gap-2 border border-[#00FF88]/30"
                >
                  <Zap className="w-4 h-4" />
                  Populate Test Data
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Title */}
              <FormField
                control={control}
                name="title"
                render={({ field, fieldState }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[#A1A1A1]">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Monthly salary distribution"
                        className="text-white"
                        {...field}
                      />
                    </FormControl>
                    {fieldState?.error && (
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              {/* BTC Amount */}
              <FormField
                control={control}
                name="btcAmount"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[#A1A1A1] justify-between">
                      <span>Amount</span>
                      <span className="text-white">{ckbtcBalance ? `${ckbtcBalance} BTC` : "0.00000000 BTC"}</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        className="text-white"
                        {...field}
                      />
                    </FormControl>
                    {fieldState?.error && (
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {/* Contract Period */}
              <FormField
                control={control}
                name="contractSigningPeriod"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[#A1A1A1]">Signing period</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        placeholder="7"
                        className="text-white"
                        {...field}
                      />
                    </FormControl>
                    {fieldState?.error && (
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <MilestoneConfiguration
              form={memoizedForm}
            // setExpandedMilestones={(val) => setExpandedMilestones(val)}
            />
          </CardContent>
        </Card>
      </div>
    </Form>
  );
};

export default MilestoneForm;
