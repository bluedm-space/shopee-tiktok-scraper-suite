'use client';

import { useState } from 'react';
import { uploadOrders } from '@/utils/upload';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('⏳ Uploading...');
    const result = await uploadOrders(file);
    setStatus(result.success ? '✅ Uploaded!' : `❌ Failed: ${result.message}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="file"
        accept=".csv,.txt"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
