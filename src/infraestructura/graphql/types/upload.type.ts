import { FileUpload } from "graphql-upload";

// Tipo Upload para usar en tus interfaces
export type Upload = Promise<FileUpload>;

// Tipos de respuesta para uploads
export interface FileUploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface BatchUploadResponse {
  successful: FileUploadResponse[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
}

// Configuraciones comunes para validaciones del frontend
export const UPLOAD_CONFIGS = {
  EVIDENCIAS: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    accept: "image/*,.pdf"
  },
  DOCUMENTOS: {
    maxFileSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ],
    accept: ".pdf,.doc,.docx,.xls,.xlsx"
  },
  IMAGENES: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    accept: "image/*"
  }
} as const;
