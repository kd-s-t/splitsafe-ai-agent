/**
 * Image compression utilities for proof of work submissions
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  maxSizeKB: 500 // 500KB per image
};

/**
 * Compress an image file to reduce its size
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const { maxWidth = 1920, maxHeight = 1080 } = options;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Check if compressed size is acceptable
          const sizeKB = blob.size / 1024;
          if (options.maxSizeKB && sizeKB > options.maxSizeKB) {
            // Try with lower quality
            const lowerQuality = Math.max(0.1, (options.quality || 0.8) - 0.2);
            canvas.toBlob(
              (lowerBlob) => {
                if (!lowerBlob) {
                  reject(new Error('Failed to compress image to acceptable size'));
                  return;
                }
                const compressedFile = new File([lowerBlob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              },
              'image/jpeg',
              lowerQuality
            );
          } else {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }
        },
        'image/jpeg',
        options.quality || 0.8
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get file size in KB
 */
export function getFileSizeKB(file: File): number {
  return file.size / 1024;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file size limits
 */
export function validateFileSize(file: File, maxSizeKB: number = 2000): { valid: boolean; error?: string } {
  const sizeKB = getFileSizeKB(file);
  
  if (sizeKB > maxSizeKB) {
    return {
      valid: false,
      error: `File "${file.name}" is too large (${formatFileSize(file.size)}). Maximum allowed: ${formatFileSize(maxSizeKB * 1024)}`
    };
  }
  
  return { valid: true };
}

/**
 * Calculate total payload size estimate
 */
export function estimatePayloadSize(
  description: string,
  screenshots: File[],
  files: File[]
): number {
  // Estimate base64 overhead (roughly 33% increase)
  const descriptionSize = description.length * 1.33;
  const screenshotsSize = screenshots.reduce((total, file) => total + file.size * 1.33, 0);
  const filesSize = files.reduce((total, file) => total + file.size * 1.33, 0);
  
  return descriptionSize + screenshotsSize + filesSize;
}
