'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  const getPageNumbers = (): (number | 'ellipsis-left' | 'ellipsis-right')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [1];
    if (safePage > 3) pages.push('ellipsis-left');
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push('ellipsis-right');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 [html.light-theme_&]:border-slate-200 text-xs">
      <div className="text-[11px] font-bold text-gray-400 [html.light-theme_&]:text-slate-600">
        Showing <span className="text-white [html.light-theme_&]:text-slate-900">{startItem}–{endItem}</span> of{' '}
        <span className="text-white [html.light-theme_&]:text-slate-900">{totalItems}</span> {itemLabel}
        <span className="text-gray-500 [html.light-theme_&]:text-slate-400 ml-1">({pageSize}/page)</span>
      </div>

      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] [html.light-theme_&]:bg-slate-100 hover:bg-white/[0.14] [html.light-theme_&]:hover:bg-slate-200 border border-white/10 [html.light-theme_&]:border-slate-300 text-gray-200 [html.light-theme_&]:text-slate-800 font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Prev</span>
        </button>

        {getPageNumbers().map((p) => {
          if (p === 'ellipsis-left' || p === 'ellipsis-right') {
            return (
              <span key={p} className="px-2 text-gray-500 [html.light-theme_&]:text-slate-400 select-none">
                …
              </span>
            );
          }

          const isActive = p === safePage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[30px] h-[30px] px-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 border border-rose-500/40'
                  : 'bg-white/[0.06] [html.light-theme_&]:bg-slate-100 hover:bg-white/[0.14] [html.light-theme_&]:hover:bg-slate-200 border border-white/10 [html.light-theme_&]:border-slate-300 text-gray-300 [html.light-theme_&]:text-slate-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] [html.light-theme_&]:bg-slate-100 hover:bg-white/[0.14] [html.light-theme_&]:hover:bg-slate-200 border border-white/10 [html.light-theme_&]:border-slate-300 text-gray-200 [html.light-theme_&]:text-slate-800 font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <span className="hidden xs:inline sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Helper to slice an array for a given 1-based page and pageSize (default 10)
 */
export function paginateItems<T>(items: T[], currentPage: number, pageSize: number = 10): T[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
