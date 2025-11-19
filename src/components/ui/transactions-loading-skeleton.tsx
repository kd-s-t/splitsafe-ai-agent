import { LoadingSkeleton } from "./loading-skeleton";

export function TransactionsLoadingSkeleton() {
  return (
    <div className="space-y-6">

      {/* Transaction cards skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-[#222222] rounded-[20px] p-4 md:p-5 border-0 w-full">
          <div className="flex items-start justify-between mb-4 min-w-0">
            <div className="flex-1 min-w-0">
              {/* Title and status skeleton */}
              <div className="flex items-center space-x-3 mb-2">
                <LoadingSkeleton className="h-6 w-48" />
                <LoadingSkeleton className="h-6 w-20 rounded-full" />
              </div>
              
              {/* Date and direction skeleton */}
              <div className="flex items-center space-x-4">
                <LoadingSkeleton className="h-4 w-32" />
                <LoadingSkeleton className="h-4 w-16" />
              </div>
            </div>
            
            {/* Action button skeleton */}
            <div className="flex-shrink-0 ml-4">
              <LoadingSkeleton className="h-8 w-32" />
            </div>
          </div>

          {/* Transaction details grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 rounded-[10px]">
            <div>
              <LoadingSkeleton className="h-4 w-16 mb-1" />
              <div className="flex items-center space-x-2">
                <LoadingSkeleton className="h-5 w-5 rounded-full" />
                <LoadingSkeleton className="h-5 w-24" />
              </div>
            </div>
            <div>
              <LoadingSkeleton className="h-4 w-20 mb-1" />
              <LoadingSkeleton className="h-5 w-16" />
            </div>
            <div>
              <LoadingSkeleton className="h-4 w-28 mb-1" />
              <LoadingSkeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
