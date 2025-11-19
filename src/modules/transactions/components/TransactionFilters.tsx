"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCw, Search } from "lucide-react";
import { useRef } from "react";

export interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  transactionsFilter: string;
  onTransactionsFilterChange: (filter: string) => void;
  availableCategories: string[];
  availableStatuses: string[];
  onRefresh: () => void;
  refreshing: boolean;
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  transactionsFilter,
  onTransactionsFilterChange,
  availableCategories,
  availableStatuses,
  onRefresh,
  refreshing,
}: TransactionFiltersProps) {
  const refreshIconRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#BCBCBC]" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 pl-10 !bg-transparent !rounded-[10px] !border-[#303434]"
          />
        </div>

        <Select
          value={transactionsFilter}
          onValueChange={onTransactionsFilterChange}
        >
          <SelectTrigger className="px-4 py-5 border-[#303434] !rounded-[10px] max-w-[156px]">
            <SelectValue placeholder="All transactions" />
          </SelectTrigger>
          <SelectContent className="bg-[#212121] border-[#303333]">
            <SelectGroup>
              <SelectItem value="all" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                All transactions
              </SelectItem>
              {availableCategories.map((cat, index) => (
                <SelectItem
                  key={index}
                  className="capitalize px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]"
                  value={cat}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="px-4 py-5 !rounded-[10px] border-[#303434] max-w-[156px] focus:outline-none">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="bg-[#212121] border-[#303333]">
              <SelectItem value="all" className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]">
                All status
              </SelectItem>
              {availableStatuses.map((status, index) => (
                <SelectItem
                  key={index}
                  className="px-2 py-1.5 cursor-pointer hover:bg-[#3C3C3C] focus:bg-[#3C3C3C] data-[highlighted]:bg-[#3C3C3C] rounded-[10px]"
                  value={status}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button
          ref={refreshIconRef}
          onClick={onRefresh}
          variant='outline'
          className="!bg-transparent !rounded-[10px] mb-4"
          disabled={refreshing}
        >
          <RotateCw size={14} className={`${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
