'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
// Image import removed - use <img> tags directly
import { useState } from 'react';
import { LiveExampleProps } from '../types';

type PaymentMethod = 'splitSafe' | 'creditCard' | 'gcash' | 'paymaya' | 'bankTransfer';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  color: string;
  available: boolean;
  cursor?: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'splitSafe',
    name: 'SplitSafe Escrow',
    description: 'Pay with Bitcoin (₱8,500 → 0.85 BTC) held in escrow until flight completion',
    icon: '/icon-192x192.png',
    color: '#FEB64D',
    available: true,
    cursor: 'cursor-pointer'
  },
  {
    id: 'creditCard',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
    color: '#3B82F6',
    available: false
  },
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Pay with your GCash wallet',
    icon: 'https://cdn.prod.website-files.com/6385b55675a0bd614777a5c1/6474928322d48888f6c8cfe5_biz-gcash-logo.svg',
    color: '#00A651',
    available: false
  },
  {
    id: 'paymaya',
    name: 'PayMaya',
    description: 'Pay with your PayMaya account',
    icon: 'https://www.maya.ph/hubfs/Maya/MAYA-Mint%20Green.svg',
    color: '#00A8E8',
    available: false
  }
];

export function LiveExample({ title, description }: LiveExampleProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [activeTab, setActiveTab] = useState<'pal' | 'splitsafe' | 'icp'>('pal');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showSplitSafeRedirect, setShowSplitSafeRedirect] = useState(false);
  const [escrowTemplateId, setEscrowTemplateId] = useState<string | null>(null);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    if (method === 'splitSafe') {
      setIsProcessingPayment(true);
      // Move to Step 2 (SplitSafe Login)
      setTimeout(() => {
        console.log('Simulation: Moving to SplitSafe login step');
        setCurrentStep(2);
        setActiveTab('splitsafe');
        setShowSplitSafeRedirect(true);
        setIsProcessingPayment(false);
      }, 1500);
    }
  };

  const handleSplitSafePayment = () => {
    // Simulate user completing payment on SplitSafe
    setIsProcessingPayment(true);
    setTimeout(() => {
      console.log('Simulation: User completed payment on SplitSafe');
      console.log('Simulation: Escrow created on ICP blockchain');
      console.log('Simulation: Returning to PAL with confirmation');
      
      setShowSplitSafeRedirect(false);
      setActiveTab('pal');
      setCurrentStep(5); // Move to success step
      setIsProcessingPayment(false);
    }, 3000);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handlePaymentMethodSelect(method.id)}
              disabled={!method.available || isProcessingPayment}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                method.available
                  ? `border-gray-200 hover:border-gray-300 hover:shadow-md ${method.cursor || 'cursor-pointer'}`
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: method.color + '20' }}
              >
                {method.icon.startsWith('http') || method.icon.startsWith('/') ? (
                  <img 
                    src={method.icon} 
                    alt={method.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{method.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{method.name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              {method.available && (
                <div className="text-gray-400">
                  {isProcessingPayment ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );


  const renderSplitSafeRedirect = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">SplitSafe Payment Gateway</h2>
        <p className="text-gray-600">You have been redirected to SplitSafe to complete your payment</p>
        <p className="text-sm text-gray-500">URL: thesplitsafe.com/payment-gateway</p>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-blue-800 mb-2">Authentication Status (Simulated)</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>✓ Already logged in with ICP</div>
          <div>✓ Session shared with SplitSafe</div>
          <div>✓ No need to login again</div>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Escrow Details</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <div>• Template ID: {escrowTemplateId}</div>
          <div>• Amount: ₱8,500</div>
          <div>• Flight: Manila → Cebu</div>
          <div>• Release: After flight completion</div>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={handleSplitSafePayment}
          disabled={isProcessingPayment}
          className="bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          {isProcessingPayment ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Pay with ICP'
          )}
        </button>
      </div>

      <div className="text-center">
        <button 
          onClick={() => {
            setShowSplitSafeRedirect(false);
            setActiveTab('pal');
            setCurrentStep(1);
            setSelectedPaymentMethod(null);
            setEscrowTemplateId(null);
          }}
          className="text-gray-500 hover:text-gray-700 text-sm mt-2"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Escrow Created Successfully!</h2>
        <p className="text-gray-600">Your flight booking and escrow are confirmed</p>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">Booking & Escrow Confirmation</h3>
        <div className="text-sm text-green-700 space-y-1">
          <div>✓ Escrow created on ICP blockchain</div>
          <div>✓ Funds secured with your ICP signature</div>
          <div>✓ Flight booking confirmed</div>
          <div>✓ Confirmation email sent</div>
          <div>✓ Funds will be released after flight completion</div>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => {
            setCurrentStep(1);
            setSelectedPaymentMethod(null);
            setShowSplitSafeRedirect(false);
            setEscrowTemplateId(null);
            setActiveTab('pal');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Book Another Flight
        </button>
      </div>
    </div>
  );

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="mb-6">
        <CardTitle className="text-white flex items-center gap-3">
          <span className="text-blue-400">🌐</span>
          {title}
        </CardTitle>
        <CardDescription className="text-[#BCBCBC]">
          {description}
        </CardDescription>
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium">
             This is a simulation demo only - no actual login or transfers occur
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-[#2A2A2A] overflow-hidden bg-white h-[800px]">
          {/* Browser Window Controls - Top Left */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Browser Tabs */}
          <div className="bg-gray-200 border-b border-gray-300">
            <div className="flex">
              {/* PAL Tab */}
              <div 
                className={`border-r border-gray-300 px-4 py-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'pal' ? 'bg-white' : 'bg-gray-200'
                }`}
                onClick={() => setActiveTab('pal')}
              >
                <img 
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAqFBMVEVHcEzfVykAGGAABWPuKymmJj/uKynvJikACGYADW3uKynuKynuKyn0GCcAEmUAEWPuKynuKynuKynuKynuKykAH2DCny3uLCkACmOMdkfLnyXzgBy2oDPQqiQ0OFqwkjQAH1/uKyn/0QCkiTqKdkQgLVzhtxvuIylAQFdxY0wFHl/7yQZYUVKXfz/tGCoAAGaCcEW1lTIAAGXwSCX7rBDBni3ywxD1bx/SnwFSAAAAIXRSTlMALOmBqQTrR0gROYFsPTBPD0u3V9PFqBG+2Ejnv1HTrlVl+f7wAAAAx0lEQVQokdXQZw6CQBAFYECKihF7b7OFDtK9/82kLNI8gL4/M8mX3bwMx/15JmxKX2zLcCoO7WhXcw2zwZcCPpSLCsD3jHdtb1QsIgD07EE9SrR82eQmd22EI0zJhNvLuUG3zz0Ko9AkHA9lOn1urmcFOrkolcG0XTOleuBk6GwwbG4wx8EzSxFCL59Z0+dqP109zC2uDVafmqaHieUgJ67/BFCZ7SyzeIkSozFQSpIEaloE607iQyuLqos2LnNS2ln2r/77eQOj8xrf2wFkewAAAABJRU5ErkJggg=="
                  alt="Philippines Airlines" 
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">Philippines Airlines</span>
                
                <button className="w-4 h-4 hover:bg-gray-300 rounded flex items-center justify-center ml-1 cursor-pointer">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* SplitSafe Tab - Only show when SplitSafe redirect is active */}
              {showSplitSafeRedirect && (
                <div 
                  className={`border-r border-gray-300 px-4 py-2 flex items-center gap-2 cursor-pointer ${
                    activeTab === 'splitsafe' ? 'bg-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('splitsafe')}
                >
                  <img 
                    src="/Logo-32px.png" 
                    alt="SplitSafe" 
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">SplitSafe</span>
                  <button 
                    className="w-4 h-4 hover:bg-gray-300 rounded flex items-center justify-center ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSplitSafeRedirect(false);
                      setActiveTab('pal');
                      setCurrentStep(1);
                      setSelectedPaymentMethod(null);
                      setEscrowTemplateId(null);
                    }}
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* ICP Tab - Only show when currentStep === 3 (ICP authentication step) */}
              {currentStep === 3 && (
                <div 
                  className={`border-r border-gray-300 px-4 py-2 flex items-center gap-2 cursor-pointer ${
                    activeTab === 'icp' ? 'bg-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('icp')}
                >
                  <img 
                    src="https://raw.githubusercontent.com/dfinity/internet-identity/main/ii-logo.png" 
                    alt="Internet Identity" 
                    width={48}
                    height={16}
                    className="w-12 h-4"
                  />
                  <span className="text-sm text-gray-600">Internet Identity</span>
                  <button 
                    className="w-4 h-4 hover:bg-gray-300 rounded flex items-center justify-center ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('splitsafe');
                      setCurrentStep(2);
                    }}
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              
              <div className="bg-gray-200 px-4 py-2 flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-xs text-white font-bold">+</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Browser Address Bar */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center gap-3">
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-sm text-gray-600 border">
              {activeTab === 'pal' 
                ? 'https://philippinesairlines.com/checkout'
                : activeTab === 'splitsafe'
                ? currentStep === 2 
                  ? 'https://thesplitsafe.com/login'
                  : 'https://thesplitsafe.com/payment-gateway'
                : 'https://identity.internetcomputer.org'
              }
            </div>
          </div>
          
          {/* Browser Content */}
          <div className="p-6 bg-white">
            {activeTab === 'pal' ? (
              <>
                {/* Philippines Airlines Header */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-lg" style={{backgroundColor: '#0047bb'}}>
                  <img 
                    src="/pal.svg" 
                    alt="Philippines Airlines" 
                    width={192}
                    height={40}
                    className="w-48 h-10"
                  />
                </div>

                {/* Flight Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h2 className="font-semibold text-black mb-3">Flight Details</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Route:</span>
                      <span className="ml-2 font-medium text-black">Manila → Cebu</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium text-black">Dec 15, 2024</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Passenger:</span>
                      <span className="ml-2 font-medium text-black">John Doe</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="ml-2 font-medium text-green-600">₱8,500</span>
                    </div>
                  </div>
                </div>
                

                {/* Step Content */}
                {showSplitSafeRedirect ? renderSplitSafeRedirect() : (
                  <>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 5 && renderSuccessStep()}
                  </>
                )}
              </>
            ) : activeTab === 'icp' ? (
              /* ICP Tab Content - Original design with overlay */
              <div className="h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] text-white -m-6 p-6 relative">
                {/* Two-column layout like actual ICP */}
                <div className="flex h-full">
                  {/* Left side - Branding and info */}
                  <div className="flex-1 flex flex-col justify-between p-8">
                    {/* Top left logo */}
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://raw.githubusercontent.com/dfinity/internet-identity/main/ii-logo.png" 
                        alt="Internet Identity" 
                        width={104}
                        height={32}
                        className="w-26 h-8"
                      />
                    </div>

                    {/* Center content */}
                    <div className="text-center -mt-24">
                      <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
                        Safe. Private.<br />
                        Decentralized.
                      </h1>
                      <p className="text-white text-lg">Pioneering passkey based identity since May 2021</p>
                    </div>

                    {/* Bottom links */}
                    <div className="flex gap-6 text-white text-sm">
                      <a href="#" className="flex items-center gap-2 hover:text-gray-300">
                        <span>?</span>
                        <span>Support</span>
                      </a>
                      <a href="#" className="flex items-center gap-2 hover:text-gray-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>Source code</span>
                      </a>
                    </div>

                  </div>

                  {/* Right side - Identity selection dialog */}
                  <div className="w-[28rem] flex items-center justify-center p-9">
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 w-full">
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-white">Choose Identity</h2>
                        <span className="text-yellow-400">🔑</span>
                      </div>
                      <p className="text-white text-sm mb-6">to connect to https://thesplitsafe.com</p>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => {
                            setIsProcessingPayment(true);
                            setTimeout(() => {
                              setCurrentStep(4);
                              setActiveTab('splitsafe');
                              setIsProcessingPayment(false);
                            }, 3000);
                          }}
                          className="w-full p-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg text-white font-medium flex items-center justify-between hover:opacity-90 transition-opacity"
                        >
                          <span>2850893</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        <button className="w-full p-4 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg text-white flex items-center justify-between transition-colors cursor-pointer">
                          <span>More options</span>
                          <span>⋯</span>
                        </button>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <a href="#" className="text-white text-sm hover:text-gray-300">
                          Learn more about Internet Identity
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading Overlay - This will show when identity is selected */}
                {isProcessingPayment && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="text-center">
                      <motion.img
                        src="https://identity.internetcomputer.org/_app/immutable/assets/loader.RXaCK3AI.svg"
                        alt="Loading"
                        className="w-12 h-18 mx-auto mb-4"
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SplitSafe Tab Content */
              <div className="h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] text-white -m-6 p-6">

                {/* Profile Header - Only show in Step 4 */}
                {currentStep === 4 && (
                  <div className="flex items-center justify-between mb-8 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
                    <div className="flex items-center gap-4">
                      {/* Profile Picture */}
                      <div className="w-12 h-12 rounded-full border-2 border-[#FEB64D] overflow-hidden">
                        <img 
                          src="/profiles/10790816.png" 
                          alt="Profile" 
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* User Info */}
                      <div>
                        <div className="text-white font-semibold">Silver Storm</div>
                        <div className="text-[#BCBCBC] text-sm">z5ogu-fswbs-c4ckq-nmfa3-jukwt-ktdl7-u2jal-q4i6s-4eltd-sz3wk-rqe</div>
                      </div>
                    </div>
                    
                    {/* Balance */}
                    <div className="text-right">
                      <div className="text-[#FEB64D] font-bold text-lg">0.0245 BTC</div>
                      <div className="text-[#BCBCBC] text-sm">≈ ₱24,500</div>
                    </div>
                  </div>
                )}

                {/* Main Content */}
                <div className="max-w-2xl mx-auto">
                  {currentStep === 2 ? (
                    /* Step 2: SplitSafe Login Page - Copy from our actual login page */
                    <div className="text-center mb-8 mt-12">
                      <img 
                        src="/splitsafe-logo.svg" 
                        alt="SplitSafe" 
                        width={128}
                        height={64}
                        className="w-32 h-auto mx-auto mb-6"
                      />
                      <h2 className="text-3xl font-bold text-white mb-2">Secure. Trustless. On-chain.</h2>
                      <p className="text-[#BCBCBC] text-lg mb-6">Built for native Bitcoin escrow — no bridges, no wraps.</p>
                    </div>
                  ) : (
                    /* Step 4: Payment Gateway */
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold text-white mb-1">Complete Your Payment</h2>
                      <p className="text-[#BCBCBC] text-sm">Secure escrow payment for your flight booking</p>
                    </div>
                  )}

                  {currentStep === 2 ? (
                    /* Step 2: Login Button - Copy from our actual login page */
                    <div className="text-center mb-6">
                      <button 
                        onClick={() => {
                          setIsLoginLoading(true);
                          setTimeout(() => {
                            setCurrentStep(3);
                            setActiveTab('icp');
                            setIsLoginLoading(false);
                          }, 3000);
                        }}
                        disabled={isLoginLoading}
                        className="relative overflow-hidden group bg-[#1A1A1A] border border-[#2A2A2A] text-white px-8 py-3 rounded-lg transition-all duration-300 hover:border-[#FEB64D]/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-pulse" />
                        <div className="relative flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span>Login with Internet Identity</span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    /* Step 4: Payment Details Card */
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 mb-4">
                      <h3 className="text-white font-semibold mb-3 text-sm">Payment Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#BCBCBC]">Merchant:</span>
                          <span className="text-white font-medium">Philippines Airlines</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#BCBCBC]">Description:</span>
                          <span className="text-white font-medium">Flight: Manila → Cebu</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#BCBCBC]">Passenger:</span>
                          <span className="text-white font-medium">John Doe</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#BCBCBC]">Date:</span>
                          <span className="text-white font-medium">Dec 15, 2024</span>
                        </div>
                        <div className="border-t border-[#2A2A2A] pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[#BCBCBC] text-sm">Total Amount:</span>
                            <div className="text-right">
                              <div className="text-[#FEB64D] text-lg font-bold">0.85 ICP</div>
                              <div className="text-[#BCBCBC] text-xs">≈ ₱8,500</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <>
                      {/* Escrow Information */}
                      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 mb-4">
                        <h3 className="text-white font-semibold mb-3 text-sm">Escrow Protection</h3>
                        <div className="space-y-1 text-[#BCBCBC] text-xs">
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Your payment is held securely until flight completion</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Automatic refund if flight is cancelled</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Button */}
                      <div className="text-center mb-6">
                        <button 
                          onClick={handleSplitSafePayment}
                          disabled={isProcessingPayment}
                          className="bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold px-12 py-4 rounded-lg transition-colors flex items-center gap-3 mx-auto text-lg"
                        >
                          {isProcessingPayment ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Pay with ICP
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}


                  {/* Security Badge */}
                  <div className="text-center mt-8">
                    <div className="inline-flex items-center gap-2 text-[#BCBCBC] text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Secured by SplitSafe • Powered by ICP Blockchain</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}