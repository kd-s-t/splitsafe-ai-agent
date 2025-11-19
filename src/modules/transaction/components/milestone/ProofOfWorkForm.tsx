"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Typography } from "@/components/ui/typography";
import { estimatePayloadSize, validateFileSize } from "@/lib/utils/imageCompression";
import { AlertTriangle, Camera, FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


interface ProofOfWorkFormProps {
  milestoneId: string;
  recipientId: string;
  recipientName: string;
  onClose: () => void;
  onSubmit: (data: ProofOfWorkData) => void;
}

export interface ProofOfWorkData {
  description: string;
  screenshots: File[];
  files: File[];
}

export function ProofOfWorkForm({
  milestoneId,
  recipientName,
  onClose,
  onSubmit
}: ProofOfWorkFormProps) {
  const [description, setDescription] = useState("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      toast.error("Error", { description: "Please select only image files for screenshots" });
      return;
    }

    // Validate file sizes
    const maxFileSizeKB = 2000; // 2MB per file
    for (const file of imageFiles) {
      const validation = validateFileSize(file, maxFileSizeKB);
      if (!validation.valid) {
        toast.error("Error", { description: validation.error || "File size validation failed" });
        return;
      }
    }

    setScreenshots(prev => [...prev, ...imageFiles]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Filter out image files - they should only go in screenshots
    const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      toast.error("Error", { description: "Please upload images in the Screenshots section above. This section is for documents, PDFs, and other files only." });
      return;
    }

    if (nonImageFiles.length === 0) {
      toast.error("Error", { description: "Please select non-image files (PDFs, documents, etc.) for this section." });
      return;
    }

    // Validate file sizes
    const maxFileSizeKB = 2000; // 2MB per file
    for (const file of nonImageFiles) {
      const validation = validateFileSize(file, maxFileSizeKB);
      if (!validation.valid) {
        toast.error("Error", { description: validation.error || "File size validation failed" });
        return;
      }
    }

    setFiles(prev => [...prev, ...nonImageFiles]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Error", { description: "Please provide a description of your work" });
      return;
    }

    console.log("📋 Submitting proof of work with data:", {
      description: description.trim(),
      screenshotsCount: screenshots.length,
      filesCount: files.length,
      screenshots: screenshots.map(f => ({ name: f.name, size: f.size, type: f.type })),
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    setIsSubmitting(true);
    try {
      await onSubmit({
        description: description.trim(),
        screenshots,
        files
      });
      toast.success("Success", { description: "Proof of work submitted successfully!" });
      onClose();
    } catch (error) {
      toast.error("Error", { description: "Failed to submit proof of work" });
      console.error("Proof of work submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] border border-[#404040] rounded-[12px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="large" className="text-white">
            Submit Proof of Work
          </Typography>
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
          {/* Milestone Info */}
          <div className="bg-[#1A1A1A] border border-[#333] rounded-[8px] p-4">
            <Typography variant="small" className="text-[#9CA3AF] mb-2">
              Milestone: {milestoneId}
            </Typography>
            <Typography variant="small" className="text-[#9CA3AF]">
              Recipient: {recipientName}
            </Typography>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Typography variant="small" className="text-white font-medium">
              Description *
            </Typography>
            <Typography variant="small" className="text-[#9CA3AF]">
              Describe what you accomplished in this milestone
            </Typography>
            <div className="bg-[#1A1A1A] border border-[#404040] rounded-[8px] overflow-hidden">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your work, achievements, and deliverables for this milestone..."
                className="w-full h-32 bg-[#1A1A1A] text-white p-3 border-none outline-none resize-none"
                style={{ minHeight: '120px' }}
              />
            </div>
          </div>

          {/* Screenshots Upload */}
          <div className="space-y-2">
            <Typography variant="small" className="text-white font-medium">
              Screenshots
            </Typography>
            <Typography variant="small" className="text-[#9CA3AF]">
              Upload screenshots or images showing your work
            </Typography>

            <div className="border-2 border-dashed border-[#404040] rounded-[8px] p-4 text-center hover:border-[#FEB64D] transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Camera size={24} className="text-[#FEB64D]" />
                <Typography variant="small" className="text-[#9CA3AF]">
                  Click to upload screenshots
                </Typography>
                <Typography variant="small" className="text-[#6B7280]">
                  PNG, JPG, GIF up to 2MB each (auto-compressed)
                </Typography>
              </label>
            </div>

            {/* Screenshot Preview */}
            {screenshots.length > 0 && (
              <div className="space-y-2">
                <Typography variant="small" className="text-white font-medium">
                  Uploaded Screenshots ({screenshots.length})
                </Typography>
                <div className="grid grid-cols-2 gap-2">
                  {screenshots.map((file, index) => (
                    <div key={index} className="relative bg-[#1A1A1A] border border-[#404040] rounded-[8px] p-2">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-[#FEB64D]" />
                        <Typography variant="small" className="text-white truncate flex-1">
                          {file.name}
                        </Typography>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScreenshot(index)}
                          className="text-red-400 hover:text-red-300 p-1 h-auto"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      <Typography variant="small" className="text-[#6B7280]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Files Upload */}
          <div className="space-y-2">
            <Typography variant="small" className="text-white font-medium">
              Additional Files
            </Typography>
            <Typography variant="small" className="text-[#9CA3AF]">
              Upload documents, PDFs, and other non-image files related to your work
            </Typography>

            <div className="border-2 border-dashed border-[#404040] rounded-[8px] p-4 text-center hover:border-[#FEB64D] transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload size={24} className="text-[#FEB64D]" />
                <Typography variant="small" className="text-[#9CA3AF]">
                  Click to upload files
                </Typography>
                <Typography variant="small" className="text-[#6B7280]">
                  Documents, PDFs, text files up to 2MB each (no images)
                </Typography>
              </label>
            </div>

            {/* Files Preview */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Typography variant="small" className="text-white font-medium">
                  Uploaded Files ({files.length})
                </Typography>
                <div className="space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#1A1A1A] border border-[#404040] rounded-[8px] p-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText size={16} className="text-[#FEB64D] flex-shrink-0" />
                        <Typography variant="small" className="text-white truncate">
                          {file.name}
                        </Typography>
                        <Typography variant="small" className="text-[#6B7280] flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 p-1 h-auto flex-shrink-0"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payload Size Indicator */}
          {(() => {
            const estimatedSize = estimatePayloadSize(description, screenshots, files);
            const estimatedSizeMB = estimatedSize / (1024 * 1024);
            const maxSizeMB = 1.5;
            const isOverLimit = estimatedSizeMB > maxSizeMB;

            return (
              <div className={`p-3 rounded-lg border ${isOverLimit
                ? 'bg-red-900/20 border-red-500/50'
                : estimatedSizeMB > maxSizeMB * 0.8
                  ? 'bg-yellow-900/20 border-yellow-500/50'
                  : 'bg-green-900/20 border-green-500/50'
                }`}>
                <div className="flex items-center space-x-2">
                  {isOverLimit && <AlertTriangle size={16} className="text-red-400" />}
                  <Typography variant="small" className={`font-medium ${isOverLimit ? 'text-red-400' :
                    estimatedSizeMB > maxSizeMB * 0.8 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                    Payload Size: {estimatedSizeMB.toFixed(2)}MB / {maxSizeMB}MB
                  </Typography>
                </div>
                <Typography variant="small" className="text-[#9CA3AF] mt-1">
                  {isOverLimit
                    ? 'Payload too large. Please reduce file sizes or remove some files.'
                    : estimatedSizeMB > maxSizeMB * 0.8
                      ? 'Approaching size limit. Consider compressing files.'
                      : 'Payload size is within limits.'
                  }
                </Typography>
                <div className="mt-2">
                  <div className="w-full bg-[#404040] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isOverLimit ? 'bg-red-500' :
                        estimatedSizeMB > maxSizeMB * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      style={{ width: `${Math.min(100, (estimatedSizeMB / maxSizeMB) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#404040]">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[#9CA3AF] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
              className="bg-[#FEB64D] hover:bg-[#FEB64D]/80 text-black font-medium disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Proof of Work'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
