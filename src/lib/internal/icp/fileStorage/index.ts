import { createSplitDappActor } from '../splitDapp';
import { FileInfo, FileStorageActor, FileType, StoredFile } from '../types';

/**
 * Upload a file to the storage system
 */
export async function uploadFile(
  filename: string,
  fileType: FileType,
  base64Data: string
): Promise<string> {
  try {
    const actor = await createSplitDappActor() as unknown as FileStorageActor;
    const fileId = await actor.uploadFile(filename, fileType, base64Data);
    return fileId;
  } catch (error) {
    throw error;
  }
}

/**
 * Get file information by ID
 */
export async function getFileInfo(fileId: string): Promise<FileInfo | null> {
  try {
    const actor = await createSplitDappActor() as unknown as FileStorageActor;
    const result = await actor.getFileInfo(fileId);
    
    if (result && Array.isArray(result) && result.length > 0) {
      const fileInfo = result[0];
      return {
        id: fileInfo.id,
        filename: fileInfo.filename,
        fileType: fileInfo.fileType,
        uploadedAt: fileInfo.uploadedAt,
        uploadedBy: fileInfo.uploadedBy.toString()
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get file base64 data by ID
 */
export async function getFileBase64(fileId: string): Promise<string | null> {
  try {
    const actor = await createSplitDappActor() as unknown as FileStorageActor;
    const result = await actor.getFileBase64(fileId);
    
    if (result && Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Delete a file by ID
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    const actor = await createSplitDappActor() as unknown as FileStorageActor;
    const result = await actor.deleteFile(fileId);
    return result;
  } catch {
    return false;
  }
}

/**
 * Get all files uploaded by the current user
 */
export async function getUserFiles(): Promise<StoredFile[]> {
  try {
    const actor = await createSplitDappActor() as unknown as FileStorageActor;
    const files = await actor.getFilesByUser();
    
    return files.map((file) => ({
      id: file.id,
      filename: file.filename,
      fileType: file.fileType,
      uploadedAt: file.uploadedAt,
      uploadedBy: file.uploadedBy.toString()
    }));
  } catch {
    return [];
  }
}

/**
 * Helper function to determine file type from filename
 */
export function getFileTypeFromFilename(filename: string): FileType {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'png':
      return { png: null };
    case 'jpg':
    case 'jpeg':
      return { jpeg: null };
    case 'pdf':
      return { pdf: null };
    case 'svg':
      return { svg: null };
    case 'txt':
      return { txt: null };
    case 'doc':
      return { doc: null };
    case 'docx':
      return { docx: null };
    default:
      return { other: null };
  }
}

/**
 * Get all screenshot files for proof of work
 */
export async function getFileBase64ScreenShotFiles(
  screenshotIds: string[]
): Promise<{ id: string; data: string | null; filename: string }[]> {
  try {
    const screenshots = await Promise.all(
      screenshotIds.map(async (id) => {
        const data = await getFileBase64(id);
        return {
          id,
          data,
          filename: `screenshot-${id}.jpg`
        };
      })
    );

    return screenshots;
  } catch {
    return screenshotIds.map(id => ({ id, data: null, filename: `screenshot-${id}.jpg` }));
  }
}

/**
 * Get all proof files for proof of work
 */
export async function getFileBase64AllProofFiles(
  fileIds: string[]
): Promise<{ id: string; data: string | null; filename: string }[]> {
  try {
    const files = await Promise.all(
      fileIds.map(async (id) => {
        const data = await getFileBase64(id);
        return {
          id,
          data,
          filename: `proof-${id}.pdf`
        };
      })
    );

    return files;
  } catch {
    return fileIds.map(id => ({ id, data: null, filename: `proof-${id}.pdf` }));
  }
}

/**
 * Get all proof of work files (screenshots and files) for a recipient
 */
export async function getProofOfWorkFiles(
  screenshotIds: string[], 
  fileIds: string[]
): Promise<{
  screenshots: { id: string; data: string | null; filename: string }[];
  files: { id: string; data: string | null; filename: string }[];
}> {
  try {
    const screenshots = await getFileBase64ScreenShotFiles(screenshotIds);

    const files = await getFileBase64AllProofFiles(fileIds);

    return { screenshots, files };
  } catch {
    return {
      screenshots: screenshotIds.map(id => ({ id, data: null, filename: `screenshot-${id}.jpg` })),
      files: fileIds.map(id => ({ id, data: null, filename: `proof-${id}.pdf` }))
    };
  }
}