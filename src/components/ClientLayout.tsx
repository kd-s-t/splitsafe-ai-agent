import DialogPortal from '@/components/dialogs'
import Header from '@/components/Header'
import { LazyRightSidebarWithSuspense as LazyRightSidebar } from '@/components/LazyComponents'
import Sidebar from '@/components/SideBar'
import { useUser } from '@/hooks/useUser'
import { store } from '@/lib/redux/store/store'
import { AnimatePresence, motion } from 'framer-motion'
import { BotMessageSquare } from 'lucide-react'
import React, { ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { useMediaQuery } from 'react-responsive'
import { useLocation } from 'react-router-dom'

const ClientLayoutContent = React.memo(function ClientLayoutContent({ children }: { children: ReactNode }) {

  const { principal } = useUser()
  const { pathname } = useLocation()
  // const dispatch = useDispatch() // Unused for now
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)

  // Note: Wallet address generation is now handled in ProtectedRoute.tsx
  // to avoid duplicate calls and reduce API load

  // Close left sidebar on tablet or mobile devices
  useEffect(() => {
    if (isTabletOrMobile) {
      setIsLeftSidebarOpen(false);
    }
  }, [isTabletOrMobile]);

  // Cache clearing removed - was causing authentication issues

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${isLeftSidebarOpen ? 'w-[210px]' : 'w-[72px]'} flex-shrink-0 mt-[16px] ml-[16px] transition-all duration-300 hidden md:block`} data-section="sidebar">
        <Sidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0" data-section="header">
          <Header />
        </div>

        {/* Main Content + AI Assistant Container */}
        <div className="flex-1 overflow-hidden ml-[16px] mt-[24px] mr-[16px] mb-[16px]" data-section="main-content">
          <div className="flex h-full">
            {/* Main Content - flex-1 when AI closed, flex-[8] when AI open */}
            <div className={`transition-all duration-300 ${isRightSidebarOpen ? 'flex-[8]' : 'flex-1'}`} data-section="content">
              <div className="h-full min-w-0 overflow-y-auto">{children}</div>
            </div>

            {/* AI Assistant - slides in from right (only when authenticated) */}
            <AnimatePresence>
              {isRightSidebarOpen && principal && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-80 flex-shrink-0 overflow-hidden ml-[16px] mr-[16px] mt-[16px] mb-[16px]"
                  data-section="right-sidebar"
                >
                  <LazyRightSidebar onToggle={toggleRightSidebar} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chat Button - fixed position (only when authenticated and not on payment gateway pages) */}
      {!isRightSidebarOpen && principal && !pathname.includes('/direct-transfers/') && (
        <button
          onClick={toggleRightSidebar}
          className="fixed right-4 bottom-10 z-50 bg-[#FEB64D] rounded-full py-3 px-3 shadow-lg hover:shadow-xl hover:bg-[#FEA52D]  transition-all duration-200 cursor-pointer"
        >
          <BotMessageSquare />
        </button>
      )}

      <DialogPortal />
    </div>
  )
})

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </Provider>
  )
} 