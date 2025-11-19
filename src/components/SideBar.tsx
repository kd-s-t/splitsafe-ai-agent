"use client";

// import { useUser } from "@/hooks/useUser";
import { setIsChooseEscrowTypeDialogOpen } from "@/lib/redux/store/dialogSlice";
import { motion } from "framer-motion";
import { ChevronLeft, History, House, Key, Ticket, Users, Wallet } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Typography } from "./ui/typography";

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SideBar({ isOpen, onToggle }: SideBarProps) {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  // const { isAdmin } = useUser(); // TODO: Implement admin functionality

  const nav = [
    { name: "Dashboard", href: "/dashboard", icon: House },
    { name: "Escrow", href: "/escrow", icon: Wallet },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "Contacts", href: "/contacts", icon: Users },
    { name: "Vouchers", href: "/vouchers", icon: Ticket },
    { name: "Developer Tools", href: "/api-keys", icon: Key },
  ];

  const handleNavigationLinkClick = (href: string, e: React.MouseEvent) => {
    if (href === "/escrow") {
      e.preventDefault(); // Prevent navigation
      dispatch(setIsChooseEscrowTypeDialogOpen(true));
    }
  };

  return (
    <div className={`w-full h-screen bg-[#1C1D1D]/80 border border-[#2A2B2B] shadow-lg flex flex-col relative rounded-[12px] transition-all duration-300`}>
      {/* Logo Section */}
      <div className="px-3 py-4 flex gap-2 h-16 items-center">
        {!isOpen && (
          <motion.div
            className="flex gap-1"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <img
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </motion.div>
        )}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <img
              src="/splitsafe-logo.svg"
              alt="SplitSafe Logo"
              width={160}
              height={40}
              className="object-contain"
            />
          </motion.div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 space-y-2 flex flex-col mt-2">
        {nav.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              onClick={(e) => handleNavigationLinkClick(link.href, e)}
              key={link.href}
              to={link.href}
              className={`rounded-lg py-2 text-sm transition-colors flex items-center gap-2 h-10 ${isOpen ? 'px-4' : 'px-2'} ${isActive
                ? "bg-[#FEB64D] !text-[#0D0D0D] font-semibold"
                : "hover:bg-[#2d2e2e] text-white"
                }`}
              style={{ minHeight: '40px' }}
              title={link.name}
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <Icon size={20} className={`${isActive ? 'text-black' : 'text-white'} flex-shrink-0`} />
              </span>
              {isOpen && (
                <Typography variant="small">{link.name}</Typography>
              )}
            </Link>
          );
        })}
      </div>

      {/* Collapse Button */}
      <div className="absolute top-6 right-[-12px] transition-all duration-300">
        <button
          onClick={onToggle}
          className="w-6 h-6 bg-[#343737] border border-[#2A2B2B] rounded-lg flex items-center justify-center hover:bg-[#404040] transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} className={`text-white transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
}