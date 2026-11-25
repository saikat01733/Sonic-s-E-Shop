'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, RefreshCw, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
  fit?: 'cover' | 'contain';
  description?: string;
  hint?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = 'Upload Image File',
  aspect = 'h-44',
  fit = 'cover',
  description,
  hint = 'Supports PNG, JPG, WEBP (Max 32MB via ImgBB CDN)',
}: ImageUploaderProps) {
  const displayHint = description || hint;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isManualUrl, setIsManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        onChange(json.url);
      } else {
        setError(json.error || 'Upload to ImgBB failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-extrabold text-gray-200 [html.light-theme_&]:text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-rose-400 [html.light-theme_&]:text-rose-600" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setIsManualUrl(!isManualUrl)}
          className="text-[11px] font-bold text-rose-400 [html.light-theme_&]:text-rose-600 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isManualUrl ? 'Switch to File Upload' : 'Enter URL manually'}</span>
        </button>
      </div>

      {isManualUrl ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://i.ibb.co/..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] [html.light-theme_&]:bg-slate-100 border border-white/15 [html.light-theme_&]:border-slate-300 text-xs text-white [html.light-theme_&]:text-slate-900 focus:outline-none focus:border-rose-500 placeholder:text-gray-500"
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {value ? (
            <div className={`relative ${aspect} w-full rounded-2xl overflow-hidden border border-white/15 [html.light-theme_&]:border-slate-300 bg-black/50 [html.light-theme_&]:bg-slate-100 group`}>
              <img
                src={value}
                alt="Uploaded preview"
                className={`w-full h-full ${fit === 'contain' ? 'object-contain p-3' : 'object-cover'}`}
                onError={(e: any) => (e.target.src = '/banner.webp')}
              />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative ${aspect} w-full rounded-2xl border-2 border-dashed border-white/20 [html.light-theme_&]:border-slate-300 hover:border-rose-500/60 bg-white/[0.03] [html.light-theme_&]:bg-slate-50 hover:bg-white/[0.06] [html.light-theme_&]:hover:bg-slate-100 transition-all flex flex-col items-center justify-center p-4 cursor-pointer text-center group`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-rose-400 animate-spin" />
                  <span className="text-xs font-bold text-rose-300 [html.light-theme_&]:text-rose-600">Uploading to ImgBB CDN...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 [html.light-theme_&]:text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white [html.light-theme_&]:text-slate-800 group-hover:text-rose-400 transition-colors">
                    Click to browse or drag & drop image
                  </span>
                  <span className="text-[10px] text-gray-400 [html.light-theme_&]:text-slate-500 mt-1 line-clamp-1">
                    {displayHint}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-400 font-semibold">{error}</p>
      )}
    </div>
  );
}

export default ImageUploader;
