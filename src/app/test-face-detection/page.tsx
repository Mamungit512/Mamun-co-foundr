"use client";

import React, { useState } from 'react';
import FaceDetectionUploader from '@/components/FaceDetectionUploader';

export default function TestPage() {
  // Doğrulanmış dosyayı tutacak state
  const [verifiedFile, setVerifiedFile] = useState<File | null>(null);

  const handleSubmitSimulation = () => {
    if (verifiedFile) {
      alert(`Simülasyon: "${verifiedFile.name}" dosyası sunucuya gönderiliyor...`);
      // Gerçek uygulamada burada bir API isteği yapılır.
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">
        ML Face Detection Test Page
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* SOL TARAF: Bizim ML Bileşenimiz */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">1. Component Usage</h2>
          <p className="text-sm text-gray-400 mb-6">
            Please upload a photo containing a clear human face below.
          </p>
          
          {/* --- ML COMPONENT --- */}
          <FaceDetectionUploader 
            onValidationSuccess={(file) => {
              console.log("Verified file received:", file);
              setVerifiedFile(file);
            }}
            onValidationFail={(error) => {
              console.warn("Validation error:", error);
              setVerifiedFile(null);
            }}
          />
          {/* -------------------- */}
        </div>

        {/* SAĞ TARAF: Sonuç Gösterimi (Simülasyon) */}
        <div className={`bg-gray-800 p-6 rounded-xl border transition-all duration-300 h-fit ${verifiedFile ? 'border-green-500 shadow-lg shadow-green-900/20' : 'border-gray-700 opacity-50'}`}>
           <h2 className="text-xl font-semibold mb-4 text-green-400">2. Integration Example</h2>
           
           {!verifiedFile ? (
             <div className="flex flex-col items-center justify-center h-48 text-gray-500">
               <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
               </svg>
               <p className="text-center">Waiting for a valid face photo...</p>
               <p className="text-xs mt-2">This section will activate once verification passes.</p>
             </div>
           ) : (
             <div className="space-y-6 animate-fadeIn">
               <p className="text-sm text-green-300 bg-green-900/30 p-3 rounded-lg border border-green-800">
                 ✅ <strong>Success!</strong> A valid file has been received from the component on the left. It's ready to be submitted.
               </p>

               <div className="space-y-4">
                 <div>
                   <label className="block text-sm text-gray-400 mb-1">File Name</label>
                   <div className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm">
                     {verifiedFile.name}
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-400 mb-1">File Size</label>
                   <div className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm">
                     {(verifiedFile.size / 1024).toFixed(2)} KB
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-400 mb-1">File Type</label>
                   <div className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm">
                     {verifiedFile.type}
                   </div>
                 </div>

                 <button 
                    onClick={handleSubmitSimulation}
                    className="w-full py-3 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center"
                 >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SIMULATE SUBMIT
                 </button>
               </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}