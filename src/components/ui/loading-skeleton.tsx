import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-gray-200 dark:bg-gray-700 rounded", className || "")} />
  );
}

export function TransactionLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-10 w-32" />
        <LoadingSkeleton className="h-6 w-24" />
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          {/* Card skeleton */}
          <div className="container !rounded-2xl !p-6">
            <LoadingSkeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-3/4" />
              <LoadingSkeleton className="h-4 w-1/2" />
            </div>
            <hr className="my-6 text-[#424444] h-[1px]" />
            <div className="space-y-3">
              <LoadingSkeleton className="h-6 w-32" />
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-full md:w-80">
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
