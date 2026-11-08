import React from 'react';
import { X, ExternalLink, Download, FileText, Hash, ShieldCheck } from 'lucide-react';

export const ReceiptViewerModal = ({ isOpen, onClose, receipt, expenseTitle }) => {
  if (!isOpen || !receipt) return null;

  const isPdf = receipt.fileType?.includes('pdf') || receipt.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = receipt.fileType?.includes('image') || /\.(jpg|jpeg|png|webp)$/i.test(receipt.fileName || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6C3CE8]" />
              Expense Receipt Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {expenseTitle || receipt.originalName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 min-h-[300px]">
          {isImage ? (
            <div className="max-w-full max-h-[500px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <img
                src={receipt.fileUrl}
                alt="Receipt Preview"
                className="max-h-[480px] w-auto object-contain mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x800/f1f5f9/475569?text=Receipt+Image+Preview';
                }}
              />
            </div>
          ) : isPdf ? (
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                PDF Receipt Document
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                {receipt.originalName || receipt.fileName}
              </p>
              <a
                href={receipt.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF in New Tab
              </a>
            </div>
          ) : (
            <div className="text-center p-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {receipt.originalName || receipt.fileName}
              </p>
            </div>
          )}
        </div>

        {/* File Security & Hash Info */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">File Verified</span>
            <span className="text-slate-400">•</span>
            <span>{receipt.fileSize ? `${(receipt.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</span>
            <span className="text-slate-400">•</span>
            <span>{receipt.fileType || 'Document'}</span>
          </div>

          {receipt.fileHash && (
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-mono text-[11px]" title="SHA-256 Checksum for duplicate prevention">
              <Hash className="w-3.5 h-3.5 text-[#6C3CE8]" />
              <span className="truncate max-w-[200px]">{receipt.fileHash}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <a
              href={receipt.fileUrl}
              download={receipt.originalName || receipt.fileName}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
