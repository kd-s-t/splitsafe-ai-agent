import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bitcoin, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#333]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/splitsafe-logo.svg"
                alt="SplitSafe Logo"
                width={160}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link to="/bitcoin-explorer-simple">
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Bitcoin Explorer
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-[#FEB64D] text-black hover:bg-[#FEB64D]/90">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            SplitSafe
            <Badge variant="outline" className="ml-4 bg-[#FEB64D]/10 text-[#FEB64D] border-[#FEB64D]">
              BETA
            </Badge>
          </h1>
          <p className="text-xl text-[#BCBCBC] mb-8 max-w-2xl mx-auto">
            Secure, decentralized escrow platform built on the Internet Computer. 
            Split payments safely with smart contracts and Bitcoin integration.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-[#FEB64D] text-black hover:bg-[#FEB64D]/90">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/bitcoin-explorer-simple">
              <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">
                <Bitcoin className="h-4 w-4 mr-2" />
                Explore Bitcoin Testnet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#111]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SplitSafe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#181818] border-[#333]">
              <CardHeader>
                <Shield className="h-8 w-8 text-[#FEB64D] mb-2" />
                <CardTitle>Secure Escrow</CardTitle>
                <CardDescription>
                  Smart contracts ensure your funds are safe until all parties are satisfied.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-[#181818] border-[#333]">
              <CardHeader>
                <Zap className="h-8 w-8 text-[#FEB64D] mb-2" />
                <CardTitle>Fast & Decentralized</CardTitle>
                <CardDescription>
                  Built on Internet Computer for instant, low-cost transactions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-[#181818] border-[#333]">
              <CardHeader>
                <Bitcoin className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle>Bitcoin Integration</CardTitle>
                <CardDescription>
                  Native Bitcoin support with testnet explorer and real-time blockchain data.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Bitcoin Testnet Explorer
                <Badge variant="outline" className="ml-3 bg-orange-500/10 text-orange-500 border-orange-500">
                  LIVE
                </Badge>
              </h2>
              <p className="text-[#BCBCBC] mb-6">
                Explore the Bitcoin testnet blockchain in real-time. View blocks, transactions, 
                and addresses with our integrated explorer. When SplitSafe&apos;s ICP canister generates 
                Bitcoin transactions, you can look up the transaction hashes here to see the real 
                Bitcoin testnet transaction details.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Real-time blockchain data
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Block and transaction explorer
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Address balance lookup
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Network statistics
                </li>
              </ul>
              <Link to="/bitcoin-explorer-simple">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Open Bitcoin Explorer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-[#181818] border border-[#333] rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#BCBCBC]">Current Block</span>
                  <span className="font-mono">410,139</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#BCBCBC]">Network</span>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                    TESTNET
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#BCBCBC]">Status</span>
                  <span className="text-green-500">● Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#BCBCBC]">Last Updated</span>
                  <span className="text-sm">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#333] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">SplitSafe</h3>
              <p className="text-[#BCBCBC] text-sm">
                Secure, decentralized escrow platform built on Internet Computer.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-[#BCBCBC]">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/bitcoin-explorer-simple" className="hover:text-white">Bitcoin Explorer</Link></li>
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-[#BCBCBC]">
                <li><a href="https://testnet-faucet.mempool.co/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Bitcoin Testnet Faucet</a></li>
                <li><a href="https://blockstream.info/testnet/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Blockstream Explorer</a></li>
                <li><a href="https://internetcomputer.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Internet Computer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-[#BCBCBC]">
                <li><Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/contact-us" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#333] mt-8 pt-8 text-center text-sm text-[#BCBCBC]">
            <p>&copy; 2024 SplitSafe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

