'use client';

import { useEffect, useState } from 'react';
import UploadForm from '@/components/UploadForm';

interface BatchMeta {
  batchId: string;
  filename: string;
  createdAt: string;
  totalOrders: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
}

export default function UploadAndStatusPage() {
  const [batches, setBatches] = useState<BatchMeta[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/batches');
      const data = await res.json();
      setBatches(data.sort((a: BatchMeta, b: BatchMeta) =>
        b.createdAt.localeCompare(a.createdAt)
      ));
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const latest = batches[0];

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📦 ระบบอัปโหลดและติดตามคำสั่งซื้อ Shopee</h1>

      {/* 🔼 แบบเดิม */}
      <UploadForm />

      {/* ⏳ แสดงสถานะล่าสุด */}
      {latest && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">⏳ สถานะล่าสุด</h2>
          <p>
            {latest.batchId} – {latest.totalOrders} orders –
            <span className={`ml-2 font-semibold ${latest.status === 'done' ? 'text-green-600' : 'text-yellow-600'}`}>
              {latest.status}
            </span>
            {latest.status === 'done' && (
              <a
                href={`/api/batches/download/${latest.batchId}`}
                className="ml-4 text-blue-600 underline"
              >
                ⬇️ Download
              </a>
            )}
          </p>
        </div>
      )}

      {/* 📜 ประวัติย้อนหลัง */}
      <div>
        <h2 className="text-xl font-semibold mb-2">📜 ประวัติงานย้อนหลัง</h2>
        <ul className="space-y-1">
          {batches.slice(1).map((batch) => (
            <li key={batch.batchId}>
              <span>{batch.batchId}</span> – {batch.totalOrders} orders –
              <span className={`ml-2 ${batch.status === 'done' ? 'text-green-600' : 'text-yellow-600'}`}>
                {batch.status}
              </span>
              {batch.status === 'done' && (
                <a
                  href={`/api/batches/download/${batch.batchId}`}
                  className="ml-4 text-blue-600 underline"
                >
                  ⬇️ Download
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
