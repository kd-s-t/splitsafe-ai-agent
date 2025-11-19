import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Schema "./schema";

module {
    public type StoredFile = Schema.StoredFile;
    public type FileType = Schema.FileType;
    public type FileUploadRequest = Schema.FileUploadRequest;

    // Helper function to validate PDF file by checking base64 content
    private func validatePdfFile(base64Data: Text): Bool {
        // Check if base64 data is long enough to contain PDF header
        if (Text.size(base64Data) < 20) {
            Debug.print("❌ [FILE_STORAGE] Base64 data too short");
            return false;
        };

        // Check for PDF signature directly on the base64 data
        // PDF files start with %PDF, which is base64 encoded as "JVBERi0="
        if (Text.startsWith(base64Data, #text "JVBERi0")) {
            Debug.print("✅ [FILE_STORAGE] Valid PDF signature detected");
            return true;
        };

        // Check for other common PDF signatures
        if (Text.startsWith(base64Data, #text "JVBERi")) {
            Debug.print("✅ [FILE_STORAGE] Valid PDF signature detected (variant)");
            return true;
        };

        // Check for HTML content (common mistake)
        if (Text.startsWith(base64Data, #text "PCFET0NUWVBFIGh0bWw")) {
            Debug.print("❌ [FILE_STORAGE] HTML content detected instead of PDF");
            return false;
        };

        // Check for ZIP/Office documents
        if (Text.startsWith(base64Data, #text "UEsDBBQ")) {
            Debug.print("❌ [FILE_STORAGE] ZIP/Office document detected instead of PDF");
            return false;
        };

        // Check for image files
        if (Text.startsWith(base64Data, #text "R0lGOD") or 
            Text.startsWith(base64Data, #text "iVBORw0KGgo") or
            Text.startsWith(base64Data, #text "/9j/4AAQ")) {
            Debug.print("❌ [FILE_STORAGE] Image file detected instead of PDF");
            return false;
        };

        Debug.print("❌ [FILE_STORAGE] Unknown file type - not a valid PDF");
        return false;
    };

    public class FileStorage() {
        private var files = HashMap.HashMap<Text, StoredFile>(0, Text.equal, Text.hash);
        private var nextFileId = 1;

        public func uploadFile(request: FileUploadRequest, uploader: Principal) : Text {
            // Validate PDF files before storing
            if (request.fileType == #pdf) {
                if (not validatePdfFile(request.base64Data)) {
                    Debug.print("❌ [FILE_STORAGE] PDF validation failed for file: " # request.filename);
                    // For now, we'll still store the file but log the warning
                    // In production, you might want to throw an error here
                    Debug.print(" [FILE_STORAGE] Storing invalid PDF file anyway - consider rejecting");
                } else {
                    Debug.print("✅ [FILE_STORAGE] PDF validation passed for file: " # request.filename);
                };
            };

            let fileId = "file-" # Nat.toText(Int.abs(Time.now())) # "-" # Nat.toText(nextFileId);
            nextFileId += 1;

            let storedFile: StoredFile = {
                id = fileId;
                filename = request.filename;
                fileType = request.fileType;
                base64Data = request.base64Data;
                uploadedAt = Int.abs(Time.now());
                uploadedBy = uploader;
            };

            files.put(fileId, storedFile);
            Debug.print("📁 [FILE_STORAGE] File uploaded: " # fileId # " (" # request.filename # ")");
            return fileId;
        };

        public func deleteFile(fileId: Text, caller: Principal) : Bool {
            switch (files.get(fileId)) {
                case (?file) {
                    if (file.uploadedBy == caller) {
                        files.delete(fileId);
                        Debug.print("🗑️ [FILE_STORAGE] File deleted: " # fileId);
                        return true;
                    } else {
                        Debug.print("❌ [FILE_STORAGE] Unauthorized to delete file: " # fileId);
                        return false;
                    };
                };
                case null {
                    Debug.print("❌ [FILE_STORAGE] File not found for deletion: " # fileId);
                    return false;
                };
            };
        };

        public func getFileBase64(fileId: Text) : ?Text {
            switch (files.get(fileId)) {
                case (?file) {
                    Debug.print("📁 [FILE_STORAGE] Base64 data retrieved for: " # fileId);
                    return ?file.base64Data;
                };
                case null {
                    Debug.print("❌ [FILE_STORAGE] File not found for base64 retrieval: " # fileId);
                    return null;
                };
            };
        };

        public func getFileInfo(fileId: Text) : ?{
            id: Text;
            filename: Text;
            fileType: FileType;
            uploadedAt: Nat;
            uploadedBy: Principal;
        } {
            switch (files.get(fileId)) {
                case (?file) {
                    Debug.print("📁 [FILE_STORAGE] File info retrieved: " # fileId);
                    return ?{
                        id = file.id;
                        filename = file.filename;
                        fileType = file.fileType;
                        uploadedAt = file.uploadedAt;
                        uploadedBy = file.uploadedBy;
                    };
                };
                case null {
                    Debug.print("❌ [FILE_STORAGE] File not found for info retrieval: " # fileId);
                    return null;
                };
            };
        };

        public func getFilesByUser(user: Principal) : [StoredFile] {
            let userFiles = Array.init<StoredFile>(files.size(), {
                id = "";
                filename = "";
                fileType = #other;
                base64Data = "";
                uploadedAt = 0;
                uploadedBy = Principal.fromText("aaaaa-aa");
            });
            
            var index = 0;
            for ((_, file) in files.entries()) {
                if (file.uploadedBy == user) {
                    userFiles[index] := file;
                    index += 1;
                };
            };
            
            // Resize array to actual size
            let result = Array.init<StoredFile>(index, {
                id = "";
                filename = "";
                fileType = #other;
                base64Data = "";
                uploadedAt = 0;
                uploadedBy = Principal.fromText("aaaaa-aa");
            });
            
            var i = 0;
            while (i < index) {
                result[i] := userFiles[i];
                i += 1;
            };
            
            Array.freeze(result);
        };

        public func getFile(fileId: Text): ?StoredFile {
            files.get(fileId);
        };

        public func getAllFiles(): [StoredFile] {
            let entries = Iter.toArray(files.entries());
            Array.map<(Text, StoredFile), StoredFile>(entries, func((_, file)) { file });
        };

        public func getFileCount(): Nat {
            files.size();
        };
    };
};