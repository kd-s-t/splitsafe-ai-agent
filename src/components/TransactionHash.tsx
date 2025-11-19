import { Copy } from "lucide-react";
import { Typography } from "./ui/typography";
import { toast } from "sonner";

interface TransactionHashProps {
  title: string;
  hash: string;
  description?: string;
  explorerLinks?: Array<{
    label: string;
    url: string;
  }>;
  showCopy?: boolean;
  truncate?: boolean;
  className?: string;
}

export default function TransactionHash({
  title,
  hash,
  description,
  explorerLinks = [],
  showCopy = true,
  truncate = false,
  className = ""
}: TransactionHashProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Success', {
        description: 'Hash copied to clipboard'
      })

    } catch {
      toast.error('Error', {
        description: 'Failed to copy hash'
      })
    }
  };

  const displayHash = truncate && hash.length > 20
    ? `${hash.slice(0, 20)}...`
    : hash;

  return (
    <div className={`container-gray mt-4 ${className}`}>
      <Typography variant="small" className="text-[#fff] font-semibold">
        {title}
      </Typography>
      <div className="grid grid-cols-12 gap-3 mt-2">
        <div className="container-gray col-span-11 break-all">
          {displayHash}
        </div>
        {showCopy && (
          <div className="container-gray cursor-pointer" onClick={handleCopy}>
            <Copy />
          </div>
        )}
      </div>

      {explorerLinks.length > 0 && (
        <div className="flex gap-2 mt-2">
          {explorerLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => window.open(link.url, '_blank')}
              className="text-[#4F3F27] hover:text-[#FEB64D] text-sm underline"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {description && (
        <Typography variant="p" className="text-[#9F9F9F] mt-2">
          {description}
        </Typography>
      )}
    </div>
  );
} 