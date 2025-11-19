'use client'

import Header from '@/components/Header'
import { LazyRightSidebar } from '@/components/LazyComponents'
import Sidebar from '@/components/SideBar'
import { AnimatePresence, motion } from 'framer-motion'
import { BotMessageSquare } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'

interface ApiKeysLayoutProps {
  children: ReactNode;
}

export default function ApiKeysLayout({ children }: ApiKeysLayoutProps) {
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTabletOrMobile(window.innerWidth <= 1224)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${isLeftSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex-shrink-0`}>
        <Sidebar 
          isOpen={isLeftSidebarOpen} 
          onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Right Sidebar (Chat) */}
      {!isTabletOrMobile && (
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-shrink-0 border-l border-[#2A2B2B]"
            >
              <LazyRightSidebar onToggle={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Chat Toggle Button */}
      {!isTabletOrMobile && (
        <motion.button
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          className="fixed bottom-6 right-6 bg-[#FEB64D] hover:bg-[#FEA52D] text-black p-3 rounded-full shadow-lg transition-colors z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BotMessageSquare size={24} />
        </motion.button>
      )}
    </div>
  )
}
