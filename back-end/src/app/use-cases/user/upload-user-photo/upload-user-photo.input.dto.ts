export interface UploadUserPhotoInputDto {
    userId: string;
    fileBuffer: Buffer;
    originalName: string;
}
