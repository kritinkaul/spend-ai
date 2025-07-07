import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Upload as UploadIcon, FileText, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, History } from 'lucide-react';
import { uploadService, type Upload, type UploadResponse } from '../services/upload';
import { cn } from '../lib/utils';
import { AxiosError } from 'axios';
import moment from 'moment';

function UploadHistoryComponent() {
  const queryClient = useQueryClient();

  const { data: uploads, isLoading } = useQuery<Upload[], AxiosError>(
    'uploads',
    () => uploadService.getUploads()
  );

  useEffect(() => {
    if (!uploads) return;

    const processingUploads = uploads.filter(u => u.status === 'pending' || u.status === 'processing');
    if (processingUploads.length === 0) return;

    const interval = setInterval(async () => {
      let hasChanged = false;
      for (const upload of processingUploads) {
        try {
          const newStatus = await uploadService.getUploadStatus(upload.id);
          if (newStatus !== upload.status) {
            hasChanged = true;
            queryClient.setQueryData<Upload[]>('uploads', (oldData) => {
                return oldData ? oldData.map(u => u.id === upload.id ? {...u, status: newStatus} : u) : [];
            });
          }
        } catch (error) {
          console.error(`Failed to get status for upload ${upload.id}`, error);
        }
      }
      if (hasChanged) {
        queryClient.invalidateQueries('uploads');
        // also invalidate analytics and transactions when an upload is completed
        const completed = queryClient.getQueryData<Upload[]>("uploads")?.some(u => u.status === 'completed');
        if(completed) {
            queryClient.invalidateQueries('analytics');
            queryClient.invalidateQueries('transactions');
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [uploads, queryClient]);

  if (isLoading) {
    return (
      <div className="card text-center">
        <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Loading upload history...</p>
      </div>
    );
  }

  if (!uploads || uploads.length === 0) {
    return (
      <div className="card text-center">
        <History className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-lg font-medium text-gray-900">No uploads yet</p>
        <p className="text-sm text-gray-500">Your uploaded files will appear here.</p>
      </div>
    );
  }

  const getStatusIcon = (status: Upload['status']) => {
    switch(status) {
      case 'completed': return <CheckCircle className="text-green-500" />;
      case 'failed': return <AlertCircle className="text-red-500" />;
      case 'processing': return <Loader2 className="text-blue-500 animate-spin" />;
      case 'pending': return <Loader2 className="text-gray-500 animate-spin" />;
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload History</h3>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {uploads.map((upload, uploadIdx) => (
            <li key={upload.id}>
              <div className="relative pb-8">
                {uploadIdx !== uploads.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={cn('h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white')}>
                      {getStatusIcon(upload.status)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {upload.filename}
                      </p>
                      <p className="text-xs text-gray-400">
                        {upload.transaction_count ? `${upload.transaction_count} transactions` : 'Processing...'}
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={upload.created_at}>{moment(upload.created_at).fromNow()}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function UploadPage() {
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { mutate: uploadFile, isLoading, isSuccess, isError, error, reset } = useMutation<
    UploadResponse,
    AxiosError<{ error: string }>,
    File
  >(
    (file: File) => {
      return uploadService.uploadTransactions(file);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('uploads');
      },
    }
  );
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const allowedTypes = ['text/csv', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a CSV or PDF file.');
      return;
    }
    
    setUploadedFile(file);
    uploadFile(file);
  };
  
  const handleReset = () => {
    setUploadedFile(null);
    reset();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Statement</h1>
        <p className="text-gray-600">Upload your bank statement to analyze your spending patterns.</p>
      </div>

      {/* Upload Area */}
      {(!isLoading && !isSuccess && !isError) && (
        <div className="card">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                Drop your file here
              </p>
              <p className="text-sm text-gray-500">
                or{' '}
                <label className="text-primary-600 hover:text-primary-500 cursor-pointer">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.pdf"
                    onChange={handleFileInput}
                  />
                </label>
              </p>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                CSV
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress/Result */}
      {uploadedFile && (
        <div className={cn(
          'card',
          isSuccess && 'border-green-200 bg-green-50',
          isError && 'border-red-200 bg-red-50',
          isLoading && 'border-blue-200 bg-blue-50'
        )}>
          <div className="flex items-center">
            {isSuccess && <CheckCircle className="h-8 w-8 text-green-600 mr-4" />}
            {isError && <AlertCircle className="h-8 w-8 text-red-600 mr-4" />}
            {isLoading && <Loader2 className="h-8 w-8 text-blue-600 mr-4 animate-spin" />}
            
            <div className="flex-1">
              <h3 className={cn(
                "text-lg font-semibold",
                isSuccess && 'text-green-900',
                isError && 'text-red-900',
                isLoading && 'text-blue-900'
              )}>
                {isLoading && `Uploading: ${uploadedFile.name}`}
                {isSuccess && 'Upload Successful!'}
                {isError && 'Upload Failed'}
              </h3>
              <p className={cn(
                "text-sm",
                isSuccess && 'text-green-700',
                isError && 'text-red-700',
                isLoading && 'text-blue-700'
              )}>
                {isLoading && `Processing... (${(uploadedFile.size / 1024).toFixed(2)} KB)`}
                {isSuccess && 'Your transactions have been processed and your dashboard is updated.'}
                {isError && (error?.response?.data?.error || 'An unknown error occurred.')}
              </p>
            </div>

            {(isSuccess || isError) && (
              <button onClick={handleReset} className="btn btn-secondary btn-sm ml-4">
                Upload another file
              </button>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Formats</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">CSV Files</h4>
            <p className="text-sm text-gray-600 mb-2">
              Export your bank statement as CSV. Make sure it includes the following columns:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li><strong>Date:</strong> Transaction date (YYYY-MM-DD format)</li>
              <li><strong>Description:</strong> Transaction description</li>
              <li><strong>Amount:</strong> Transaction amount (positive for credits, negative for debits)</li>
              <li><strong>Type:</strong> Transaction type (CREDIT or DEBIT)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">PDF Files</h4>
            <p className="text-sm text-gray-600 mb-2">
              Upload your bank statement in PDF format. The system will attempt to automatically extract transactions.
            </p>
            <p className="text-sm text-gray-500">Note: PDF parsing can be less reliable than CSV. For best results, use the CSV format if possible.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">💡 Tip</h5>
            <p className="text-sm text-blue-700">
              You can use the sample CSV file in the <code className="bg-blue-100 px-1 rounded">sample-data/</code> folder to test the upload functionality.
            </p>
          </div>
        </div>
      </div>

      <UploadHistoryComponent />
    </div>
  );
} 