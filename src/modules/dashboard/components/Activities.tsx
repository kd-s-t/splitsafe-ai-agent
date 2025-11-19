"use client"

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import type { RootState } from "@/lib/redux/store/store";
import { ACTIVITY_CATEGORIES } from "@/modules/shared.constants";
import type { ActivityItem } from "@/modules/shared.types";
import { useTransactions } from "@/modules/transactions/hooks";
import { ChevronRight, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import ActivityContent from "./ActivityContent";
// Image component removed - use <img> tags instead
import { setIsChooseEscrowTypeDialogOpen } from "@/lib/redux/store/dialogSlice";
import { useDispatch } from "react-redux";

export default function RecentActivities() {
  const principal = useSelector((state: RootState) => state.user?.principal);
  const { transactions } = useTransactions();
  const dispatch = useDispatch();

  const activities = transactions && transactions.length > 0
    ? [...transactions].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  const sentCount = activities.filter(
    (activity: ActivityItem) => principal && String(activity.from) === String(principal)
  ).length;

  const receivedCount = activities.filter(
    (activity: ActivityItem) => principal && activity.to && activity.to.some(
      (recipient: { principal: unknown }) => String(recipient.principal) === String(principal)
    )
  ).length;

  return (
    <div className="mt-10">
      <Typography variant="h3">
        Recent activity
      </Typography>
      <Typography variant="muted" className="text-gray-400">
        Track your latest escrow transactions
      </Typography>

      <Tabs defaultValue="all" className="mt-4">
        <div className="md:flex items-center justify-between">
          <TabsList>
            <TabsTrigger
              value="all"
              className="text-muted-foreground font-medium"
            >
              All transactions ({activities.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="text-muted-foreground font-medium"
            >
              Send ({sentCount})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-muted-foreground font-medium"
            >
              Received ({receivedCount})
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/transactions")}
            className="text-white hover:bg-[#2a2a2a]"
          >
            View all transactions <ChevronRight />
          </Button>
        </div>

        <TabsContent value="all" className="flex flex-col gap-6 mt-6">
          {transactions === null || transactions === undefined ? (
            // Skeleton loading for activities
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-[#222222] border border-[#303434] rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 animate-pulse rounded-full" />
                    <div>
                      <div className="w-32 h-4 bg-gray-600 animate-pulse rounded mb-2" />
                      <div className="w-24 h-3 bg-gray-600 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-gray-600 animate-pulse rounded" />
                </div>
                <div className="w-full h-3 bg-gray-600 animate-pulse rounded mb-2" />
                <div className="w-3/4 h-3 bg-gray-600 animate-pulse rounded" />
              </div>
            ))
          ) : transactions && transactions.length === 0 ? (
            <Empty className='!bg-[#191A1A] !border border-[#424747] !rounded-[10px]'>
              <EmptyHeader className='!max-w-full !text-white'>
                <EmptyMedia variant="icon" className='w-[94px]'>
                  <img src="/task-empty.svg" alt="Empty state" width={94} height={94} />
                </EmptyMedia>
                <EmptyTitle className="!font-semibold mt-8">Your escrow journey starts here.</EmptyTitle>
                <EmptyDescription>
                  No activity yet — but every trustless transaction begins with a secure contract. Create your first escrow to get started.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="default" size="lg" onClick={() => dispatch(setIsChooseEscrowTypeDialogOpen(true))}>
                  <Plus /> Start a new escrow
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            activities.map((activity: ActivityItem, idx: number) => {
              const isSender =
                principal &&
                activity.from &&
                String(activity.from) === String(principal);

              const category = isSender ? "sent" : "received";
              // Build transaction details URL
              const txUrl = activity.id
                ? `/transactions/${activity.id}`
                : undefined;

              return (
                <ActivityContent
                  key={idx}
                  idx={idx}
                  activity={activity}
                  category={category}
                  txUrl={txUrl}
                  principal={principal || undefined}
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value="active" className="flex flex-col gap-6 mt-6">
          {transactions === null || transactions === undefined ? (
            // Skeleton loading for sent activities
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-[#222222] border border-[#303434] rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 animate-pulse rounded-full" />
                    <div>
                      <div className="w-32 h-4 bg-gray-600 animate-pulse rounded mb-2" />
                      <div className="w-24 h-3 bg-gray-600 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-gray-600 animate-pulse rounded" />
                </div>
                <div className="w-full h-3 bg-gray-600 animate-pulse rounded mb-2" />
                <div className="w-3/4 h-3 bg-gray-600 animate-pulse rounded" />
              </div>
            ))
          ) : (
            activities
              .filter((activity: ActivityItem) =>
                principal && String(activity.from) === String(principal)
              )
              .map((activity: ActivityItem, idx: number) => {
                // const isSender = true; // We know it's sent since we filtered
                const category = ACTIVITY_CATEGORIES.SENT;
                const txUrl = activity.id ? `/transactions/${activity.id}` : undefined;
                return (
                  <ActivityContent
                    key={idx}
                    idx={idx}
                    activity={activity}
                    category={category}
                    txUrl={txUrl}
                    principal={principal || undefined}
                  />
                );
              })
          )}
        </TabsContent>

        <TabsContent value="completed" className="flex flex-col gap-6 mt-6">
          {transactions === null || transactions === undefined ? (
            // Skeleton loading for received activities
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-[#222222] border border-[#303434] rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 animate-pulse rounded-full" />
                    <div>
                      <div className="w-32 h-4 bg-gray-600 animate-pulse rounded mb-2" />
                      <div className="w-24 h-3 bg-gray-600 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-gray-600 animate-pulse rounded" />
                </div>
                <div className="w-full h-3 bg-gray-600 animate-pulse rounded mb-2" />
                <div className="w-3/4 h-3 bg-gray-600 animate-pulse rounded" />
              </div>
            ))
          ) : (
            activities
              .filter((activity: ActivityItem) =>
                principal && activity.to && activity.to.some(
                  (recipient: { principal: unknown }) => String(recipient.principal) === String(principal)
                )
              )
              .map((activity: ActivityItem, idx: number) => {
                // const isSender = false; // We know it's received since we filtered
                const category = ACTIVITY_CATEGORIES.RECEIVED;
                const txUrl = activity.id ? `/transactions/${activity.id}` : undefined;
                return (
                  <ActivityContent
                    key={idx}
                    idx={idx}
                    activity={activity}
                    category={category}
                    txUrl={txUrl}
                    principal={principal || undefined}
                  />
                );
              })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
