export interface UploadWorkerPhotoInputDto {
    workerId: string;
    fileBuffer: Buffer;
    originalName: string;
}
