import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface UploadResponse {
  success: boolean;
  message: string;
  transaction_count?: number;
  filename?: string;
}

export interface Upload {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  transaction_count?: number;
}

export const uploadService = {
  uploadTransactions: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUploads: async (): Promise<Upload[]> => {
    const response = await axios.get(`${API_URL}/api/uploads`);
    return response.data;
  },

  getUploadStatus: async (id: string): Promise<Upload['status']> => {
    const response = await axios.get(`${API_URL}/api/uploads/${id}/status`);
    return response.data.status;
  },
}; 