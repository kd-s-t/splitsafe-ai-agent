module {
    public type FileType = {
        #png;
        #jpg;
        #jpeg;
        #pdf;
        #svg;
        #txt;
        #doc;
        #docx;
        #other;
    };

    public type StoredFile = {
        id: Text;
        filename: Text;
        fileType: FileType;
        base64Data: Text;
        uploadedAt: Nat;
        uploadedBy: Principal;
    };

    public type FileUploadRequest = {
        filename: Text;
        fileType: FileType;
        base64Data: Text;
    };
}
