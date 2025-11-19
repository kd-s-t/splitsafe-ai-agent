"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { getProofOfWorkFiles } from "@/lib/internal/icp/fileStorage";
import { Calendar, Download, Eye, FileText, X } from "lucide-react";
// Image component removed - use <img> tags instead
import { useEffect, useState } from "react";

interface ProofOfWorkViewerProps {
  isOpen: boolean;
  onClose: () => void;
  proofOfWork: {
    description?: string;
    screenshots: string[]; // File IDs
    files: string[]; // File IDs
    submittedAt?: string;
    approvedAt?: string;
  };
  recipientName: string;
  milestoneId: string;
  monthNumber?: number; // Add month number to show which month's proof this is
}

export function ProofOfWorkViewer({ 
  isOpen, 
  onClose, 
  proofOfWork, 
  recipientName, 
  milestoneId,
  monthNumber 
}: ProofOfWorkViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [proofFiles, setProofFiles] = useState<{
    screenshots: { id: string; data: string | null; filename: string }[];
    files: { id: string; data: string | null; filename: string }[];
  }>({ screenshots: [], files: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch proof of work files when modal opens
  useEffect(() => {
    if (isOpen && (proofOfWork.screenshots.length > 0 || proofOfWork.files.length > 0)) {
      setIsLoading(true);
      getProofOfWorkFiles(proofOfWork.screenshots, proofOfWork.files)
        .then((files) => {
          setProofFiles(files);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching proof of work files:', error);
          setIsLoading(false);
        });
    }
  }, [isOpen, proofOfWork.screenshots, proofOfWork.files]);

  if (!isOpen) return null;

  const handleDownloadFile = (fileData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = filename;
    link.click();
  };

  const getFileType = (fileData: string) => {
    if (fileData.includes('data:application/pdf')) return 'pdf';
    if (fileData.includes('data:image/')) return 'image';
    if (fileData.includes('data:text/')) return 'text';
    if (fileData.includes('data:application/')) return 'document';
    return 'unknown';
  };

  const getFileExtension = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '.pdf';
      case 'image': return '.png';
      case 'text': return '.txt';
      case 'document': return '.doc';
      default: return '';
    }
  };

  const handleViewFile = (fileData: string, filename: string) => {
    const fileType = getFileType(fileData);
    const extension = getFileExtension(fileType);
    const fullFilename = filename.includes('.') ? filename : `${filename}${extension}`;

    // Check if it's a PDF
    if (fileType === 'pdf') {
      // For PDFs, create a blob and open in new tab
      try {
        const byteCharacters = atob(fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Open in new tab
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          // Clean up the URL after a delay
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
          // Fallback to download if popup blocked
          handleDownloadFile(fileData, fullFilename);
        }
      } catch (error) {
        console.error('Error opening PDF:', error);
        // Fallback to download
        handleDownloadFile(fileData, fullFilename);
      }
    } else if (fileType === 'image') {
      // For images, open in new tab directly
      const newWindow = window.open(fileData, '_blank');
      if (!newWindow) {
        // Fallback to download
        handleDownloadFile(fileData, fullFilename);
      }
    } else {
      // For other files, try to open in new tab
      const newWindow = window.open(fileData, '_blank');
      if (!newWindow) {
        // Fallback to download
        handleDownloadFile(fileData, fullFilename);
      }
    }
  };

  const handleViewImage = (imageData: string) => {
    setSelectedImage(imageData);
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp || timestamp === '0' || timestamp === '') return 'Not submitted';
    
    // Handle different timestamp formats
    let date: Date;
    if (timestamp.length > 10) {
      // Assume it's in nanoseconds (ICP format)
      date = new Date(Number(timestamp) / 1000000);
    } else {
      // Assume it's in milliseconds
      date = new Date(Number(timestamp));
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#2A2A2A] border border-[#404040] rounded-[12px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography variant="large" className="text-white">
                Proof of Work
              </Typography>
              <Typography variant="small" className="text-[#9CA3AF] mt-1">
                {recipientName} • Milestone {milestoneId}{monthNumber ? ` • Month ${monthNumber}` : ''}
              </Typography>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Submission Date */}
            <div className="bg-[#1A1A1A] border border-[#333] rounded-[8px] p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar size={16} className="text-[#FEB64D]" />
                <Typography variant="small" className="text-white font-medium">
                  Submitted
                </Typography>
              </div>
              <Typography variant="small" className="text-[#9CA3AF]">
                {formatDate(proofOfWork.submittedAt)}
              </Typography>
            </div>

            {/* Description */}
            {proofOfWork.description && (
              <div className="space-y-2">
                <Typography variant="small" className="text-white font-medium">
                  Description
                </Typography>
                <div className="bg-[#1A1A1A] border border-[#404040] rounded-[8px] p-4">
                  <Typography variant="small" className="text-[#BCBCBC] whitespace-pre-wrap">
                    {proofOfWork.description}
                  </Typography>
                </div>
              </div>
            )}

            {/* Screenshots */}
            {isLoading ? (
              <div className="space-y-3">
                <Typography variant="small" className="text-white font-medium">
                  Screenshots
                </Typography>
                <div className="text-center py-8">
                  <Typography variant="small" className="text-[#BCBCBC]">
                    Loading screenshots...
                  </Typography>
                </div>
              </div>
            ) : proofFiles.screenshots.length > 0 ? (
              <div className="space-y-3">
                <Typography variant="small" className="text-white font-medium">
                  Screenshots ({proofFiles.screenshots.length})
                </Typography>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {proofFiles.screenshots.map((screenshot, index) => (
                    <div key={screenshot.id} className="relative group">
                      <div className="aspect-square bg-[#1A1A1A] border border-[#404040] rounded-[8px] overflow-hidden">
                        {screenshot.data ? (
                          <img
                            src={screenshot.data}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleViewImage(screenshot.data!)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Typography variant="small" className="text-[#BCBCBC]">
                              Failed to load
                            </Typography>
                          </div>
                        )}
                      </div>
                      {screenshot.data && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewImage(screenshot.data!)}
                              className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadFile(screenshot.data!, screenshot.filename)}
                              className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
                            >
                              <Download size={14} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : proofOfWork.screenshots.length > 0 ? (
              <div className="space-y-3">
                <Typography variant="small" className="text-white font-medium">
                  Screenshots ({proofOfWork.screenshots.length})
                </Typography>
                <div className="text-center py-8">
                  <Typography variant="small" className="text-[#BCBCBC]">
                    No screenshots available
                  </Typography>
                </div>
              </div>
            ) : null}

            {/* Files */}
            {isLoading ? (
              <div className="space-y-3">
                <Typography variant="small" className="text-white font-medium">
                  Files
                </Typography>
                <div className="text-center py-8">
                  <Typography variant="small" className="text-[#BCBCBC]">
                    Loading files...
                  </Typography>
                </div>
              </div>
            ) : proofFiles.files.length > 0 ? (
              <div className="space-y-3">
                <Typography variant="small" className="text-white font-medium">
                  Files ({proofFiles.files.length})
                </Typography>
                <div className="space-y-2">
                  {proofFiles.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-[#1A1A1A] border border-[#404040] rounded-[8px] p-3">
                      <div className="flex items-center space-x-3">
                        <FileText size={16} className="text-[#FEB64D]" />
                        <div>
                          <Typography variant="small" className="text-white">
                            {file.filename}
                          </Typography>
                          <Typography variant="small" className="text-[#9CA3AF]">
                            {file.data ? 'Ready' : 'Failed to load'}
                          </Typography>
                        </div>
                      </div>
                      {file.data && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // const fileType = getFileType(file.data!);
                              // const extension = getFileExtension(fileType);
                              const fullFilename = file.filename;
                              handleViewFile(file.data!, fullFilename);
                            }}
                            className="h-8 px-3 text-blue-400 hover:bg-blue-400/10 hover:text-blue-400 text-xs"
                          >
                            <Eye size={12} className="mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // const fileType = getFileType(file.data!);
                              // const extension = getFileExtension(fileType);
                              const fullFilename = file.filename;
                              handleDownloadFile(file.data!, fullFilename);
                            }}
                            className="h-8 px-3 text-green-400 hover:bg-green-400/10 hover:text-green-400 text-xs"
                          >
                            <Download size={12} className="mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : proofOfWork.files.length > 0 ? (
              <div className="space-y-3">
                <Typography variant="small" className="text-white font-medium">
                  Files ({proofOfWork.files.length})
                </Typography>
                <div className="text-center py-8">
                  <Typography variant="small" className="text-[#BCBCBC]">
                    No files available
                  </Typography>
                </div>
              </div>
            ) : null}

            {/* Empty state */}
            {(!proofOfWork.description && 
              (!proofOfWork.screenshots || proofOfWork.screenshots.length === 0) && 
              (!proofOfWork.files || proofOfWork.files.length === 0)) && (
              <div className="text-center py-8">
                <FileText size={48} className="text-[#6B7280] mx-auto mb-4" />
                <Typography variant="small" className="text-[#6B7280]">
                  No proof of work submitted yet
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X size={20} />
            </Button>
            <img
              src={selectedImage}
              alt="Proof of work screenshot"
              className="max-w-full max-h-full object-contain rounded-[8px]"
            />
          </div>
        </div>
      )}
    </>
  );
}
