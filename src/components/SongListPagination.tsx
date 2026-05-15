import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface SongListPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SongListPagination({ currentPage, totalPages, onPageChange }: SongListPaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg bg-muted text-muted-foreground disabled:opacity-30 transition-colors hover:bg-primary/15 hover:text-primary"
        aria-label="第一頁"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg bg-muted text-muted-foreground disabled:opacity-30 transition-colors hover:bg-primary/15 hover:text-primary"
        aria-label="上一頁"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && <span className="text-xs text-muted-foreground px-1">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`min-w-[36px] h-9 rounded-lg text-sm font-body font-medium transition-colors ${
            p === currentPage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary"
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span className="text-xs text-muted-foreground px-1">…</span>}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg bg-muted text-muted-foreground disabled:opacity-30 transition-colors hover:bg-primary/15 hover:text-primary"
        aria-label="下一頁"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg bg-muted text-muted-foreground disabled:opacity-30 transition-colors hover:bg-primary/15 hover:text-primary"
        aria-label="最後一頁"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
