'use client';

import { ArrowRight, Check, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker with fallback
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
} catch (error) {
  console.error('Failed to set PDF.js worker:', error);
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
  onDownload?: () => void;
  onApprove?: () => void;
  onTransfer?: () => void;
  showActions?: boolean;
  isApproving?: boolean;
}

export default function PDFViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title = "Contract Document",
  onDownload,
  onApprove,
  onTransfer,
  showActions = true,
  isApproving = false
}: PDFViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    console.error('PDF URL that failed:', pdfUrl?.substring(0, 200));
    setError(`Failed to load PDF document: ${error.message}`);
    setLoading(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  // Add timeout mechanism
  useEffect(() => {
    if (isOpen && loading) {
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError('PDF loading timeout. The file might be corrupted or too large.');
          setLoading(false);
        }
      }, 15000); // 15 second timeout
      
      setTimeoutId(timeoutId);
      
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [isOpen, loading]);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  if (!isOpen) return null;

  // Debug logging

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium mb-2">Error Loading PDF</p>
                <p className="text-sm mb-4">{error}</p>
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    The PDF viewer is having trouble loading this document. This might be due to browser compatibility or network issues.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => {
                      // Convert base64 to blob URL for better browser compatibility
                      const byteCharacters = atob(pdfUrl.split(',')[1]);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], { type: 'application/pdf' });
                      const blobUrl = URL.createObjectURL(blob);
                      window.open(blobUrl, '_blank');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>Open in New Tab</span>
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = pdfUrl;
                      link.download = `${title}.pdf`;
                      link.click();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* PDF Controls */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Use mouse wheel or arrow keys to navigate
                </div>
              </div>

              {/* PDF Content */}
              <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div className="flex justify-center">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="shadow-lg"
                    options={{
                      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                      cMapPacked: true,
                      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                    }}
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={Math.min(800, window.innerWidth - 100)}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<div className="text-center p-4">Loading page...</div>}
                      error={<div className="text-center p-4 text-red-600">Error loading page</div>}
                    />
                  </Document>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {showActions && !loading && !error && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {onApprove && (
                  <button
                    onClick={onApprove}
                    disabled={isApproving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApproving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                )}
                {onTransfer && (
                  <button
                    onClick={onTransfer}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <ArrowRight size={16} />
                    <span>Transfer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
