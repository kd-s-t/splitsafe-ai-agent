"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { Bitcoin, Calendar, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { EscrowType, EscrowTypeSelectorProps } from '../types';

export default function EscrowTypeSelector({}: EscrowTypeSelectorProps) {
  const navigate = useNavigate();

  const handleNavigateToEscrow = (type: EscrowType) => {
    if (type === 'basic') {
      navigate('/basic-escrow');
    } else if (type === 'milestone') {
      navigate('/milestone-escrow');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <Typography variant="h1" className="text-white mb-4">
          Choose Escrow Type
        </Typography>
        <Typography variant="large" className="text-[#9F9F9F]">
          Select the type of escrow that best fits your needs
        </Typography>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Escrow Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card 
            className="border-[#424444] bg-[#212121] hover:border-[#5F5F5F] transition-all duration-300 "
          >
            <CardHeader className="text-center pb-4 p-5">
              <div className="w-16 h-16 bg-[#4F3F27] rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-[#FEB64D]" />
              </div>
              <Typography variant="h2" className="text-white mb-2">
                Basic Escrow
              </Typography>
              <Typography variant="base" className="text-[#9F9F9F]">
                Release funds immediately after approval
              </Typography>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-[#FEB64D]" />
                  <Typography variant="small" className="text-white">
                    <strong>Timeline:</strong> Minutes to hours
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Bitcoin size={20} className="text-[#FEB64D]" />
                  <Typography variant="small" className="text-white">
                    <strong>Release:</strong> All funds at once
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Zap size={20} className="text-[#FEB64D]" />
                  <Typography variant="small" className="text-white">
                    <strong>Use Case:</strong> One-time payments, bonuses
                  </Typography>
                </div>
              </div>
              
              <div className="bg-[#1F374F] border border-[#0077FF] rounded-lg p-5 mt-4">
                <Typography variant="small" className="text-white">
                  <strong>Perfect for:</strong> Project completion bonuses, one-time payments, 
                  immediate fund transfers, simple escrow transactions
                </Typography>
              </div>

              <Button
                className="w-full mt-4 bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black"
                onClick={() => handleNavigateToEscrow('basic')}
              >
                Select basic escrow
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestone Escrow Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            className="border-[#424444] bg-[#212121] hover:border-[#5F5F5F] transition-all duration-300 "
          >
            <CardHeader className="text-center pb-4 p-5">
              <div className="w-16 h-16 bg-[#4F3F27] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-[#FEB64D]" />
              </div>
              <Typography variant="h2" className="text-white mb-2">
                Milestone Escrow
              </Typography>
              <Typography variant="base" className="text-[#9F9F9F]">
                Release funds gradually over time
              </Typography>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-[#FEB64D]" />
                  <Typography variant="small" className="text-white">
                    <strong>Timeline:</strong> Weeks to years
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Bitcoin size={20} className="text-[#FEB64D]" />
                  <Typography variant="small" className="text-white">
                    <strong>Release:</strong> Scheduled payments
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Zap size={20} className="text-[#FEB64D]" />
                  <Typography variant="small" className="text-white">
                    <strong>Use Case:</strong> Long-term projects, salaries
                  </Typography>
                </div>
              </div>
              
              <div className="bg-[#1F374F] border border-[#0077FF] rounded-lg p-5 mt-4">
                <Typography variant="small" className="text-white">
                  <strong>Perfect for:</strong> Freelance projects, monthly salaries, 
                  investment distributions, DAO payouts, charity donations
                </Typography>
              </div>

              <Button
                className="w-full mt-4 bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black"
                onClick={() => handleNavigateToEscrow('milestone')}
              >
                Select milestone escrow
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Example Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <Card className="bg-[#2B2B2B] border-[#424444] p-5">
          <CardHeader className="p-5">
            <Typography variant="h3" className="text-white text-center">
              Real-World Examples
            </Typography>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-1">
              <Typography variant="base" className="text-[#FEB64D] font-semibold">
                Basic Escrow Example:
              </Typography>
              <Typography variant="small" className="text-white">
                &quot;Freelance web development project completed.
                Release 2.5 BTC to developer immediately after final approval.&quot;
              </Typography>
            </div>
            <div className="space-y-1 mt-4">
              <Typography variant="base" className="text-[#FEB64D] font-semibold">
                Milestone Escrow Example:
              </Typography>
              <Typography variant="small" className="text-white">
                &quot;12 BTC for 4 developers over 1 year.
                Release 1 BTC every 1st of the month (0.25 BTC per developer).&quot;
              </Typography>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
