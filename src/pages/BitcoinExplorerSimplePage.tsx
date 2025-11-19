import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, Blocks, Copy, RefreshCw } from 'lucide-react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BlockInfo {
  hash: string;
  height: number;
  time: number;
  nTx: number;
  size: number;
}

interface TransactionHash {
  hash: string;
  blockHeight: number;
  timestamp: number;
}

function BitcoinExplorerSimpleContent() {
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const [transactionHashes, setTransactionHashes] = useState<TransactionHash[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(0);

  const getBlockchainInfo = async () => {
    const dummyHeight = 2500000;
    setCurrentBlockHeight(dummyHeight);
    return dummyHeight;
  };

  const getRecentBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const latestHeight = await getBlockchainInfo();
      
      const blocks: BlockInfo[] = [];
      const hashes: TransactionHash[] = [];

      for (let i = 0; i < 10; i++) {
        const height = latestHeight - i;
        const blockHash = `0000000000000000000${height.toString().padStart(7, '0')}abcdef1234567890`;
        
        blocks.push({
          hash: blockHash,
          height: height,
          time: Math.floor(Date.now() / 1000) - (i * 600),
          nTx: Math.floor(Math.random() * 1000) + 100,
          size: Math.floor(Math.random() * 1000000) + 500000
        });

        const numTxs = Math.floor(Math.random() * 100) + 50;
        for (let j = 0; j < numTxs; j++) {
          hashes.push({
            hash: `${blockHash.substring(0, 20)}${j.toString().padStart(4, '0')}${Math.random().toString(36).substring(2, 10)}`,
            blockHeight: height,
            timestamp: Math.floor(Date.now() / 1000) - (i * 600)
          });
        }
      }

      setBlocks(blocks);
      setTransactionHashes(hashes);
    } catch (error) {
      console.error('Failed to generate dummy blocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    getRecentBlocks();
  }, [getRecentBlocks]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bitcoin className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Bitcoin Testnet Explorer</h1>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500">
              SIMPLE
            </Badge>
          </div>
          <p className="text-[#BCBCBC]">
            Simple Bitcoin testnet explorer showing recent blocks and transaction hashes.
          </p>
        </div>

        <div className="mb-6">
          <Button 
            onClick={getRecentBlocks} 
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh Blocks
          </Button>
        </div>

        <Card className="mb-8 bg-[#181818] border-[#333]">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-orange-500">Current Block Height</h2>
              <p className="text-4xl font-bold mt-2">{currentBlockHeight.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-[#181818] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Blocks className="h-5 w-5" />
                Recent Blocks (Last 10)
              </CardTitle>
              <CardDescription>
                Latest blocks from Bitcoin testnet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                  <p className="text-[#BCBCBC]">Loading blocks...</p>
                </div>
              ) : blocks.length > 0 ? (
                <div className="space-y-4">
                  {blocks.map((block) => (
                    <div key={block.hash} className="bg-[#0a0a0a] p-4 rounded border border-[#333]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Block #{block.height}</h3>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                          {block.nTx} TXs
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#BCBCBC]">Hash:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-[#1a1a1a] px-2 py-1 rounded">
                              {block.hash.substring(0, 16)}...
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(block.hash)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#BCBCBC]">Time:</span>
                          <span className="text-xs">{formatTimestamp(block.time)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#BCBCBC]">Size:</span>
                          <span className="text-xs">{formatBytes(block.size)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#BCBCBC]">No blocks loaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#181818] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5" />
                Transaction Hashes ({transactionHashes.length})
              </CardTitle>
              <CardDescription>
                All transaction hashes from recent blocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                  <p className="text-[#BCBCBC]">Loading transactions...</p>
                </div>
              ) : transactionHashes.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactionHashes.map((tx, index) => (
                    <div key={`${tx.hash}-${index}`} className="bg-[#0a0a0a] p-3 rounded border border-[#333]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <code className="text-xs font-mono text-orange-400 break-all">
                            {tx.hash}
                          </code>
                          <div className="text-xs text-[#BCBCBC] mt-1">
                            Block #{tx.blockHeight} • {formatTimestamp(tx.timestamp)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(tx.hash)}
                          className="ml-2 flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#BCBCBC]">No transactions loaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-[#181818] border-[#333]">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-500">{currentBlockHeight}</div>
                <div className="text-sm text-[#BCBCBC]">Current Block Height</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{blocks.length}</div>
                <div className="text-sm text-[#BCBCBC]">Blocks Loaded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{transactionHashes.length}</div>
                <div className="text-sm text-[#BCBCBC]">Transaction Hashes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BitcoinExplorerSimplePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading Bitcoin Explorer...</div>
      </div>
    }>
      <BitcoinExplorerSimpleContent />
    </Suspense>
  );
}

