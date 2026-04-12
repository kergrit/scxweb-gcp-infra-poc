// Mark this as a client component
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select a file to upload.');
      return;
    }
    setStatus('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'File upload failed.');
      }

      setStatus(`Upload successful! File ${file.name} is now in the bucket.`);
      setFile(null);
      // Optionally, clear the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error(error);
      setStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <main className="container mx-auto p-8">
      <div className="mb-4">
        <Link href="/media" className="text-blue-500 hover:underline">
          &larr; Back to Media Gallery
        </Link>
      </div>
      <h1 className="text-4xl font-bold mb-8">Upload File</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Choose a file
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={!file || status.includes('Uploading')}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {status.includes('Uploading') ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </main>
  );
}
