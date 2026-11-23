"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types/database.types";

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

export function PaginationControls({
  meta,
  onPageChange,
  onLimitChange,
  disabled = false,
}: PaginationControlsProps) {
  const { page, limit, totalItems, totalPages } = meta;
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          Menampilkan{" "}
          <strong className="font-medium text-foreground">
            {startItem}–{endItem}
          </strong>{" "}
          dari{" "}
          <strong className="font-medium text-foreground">{totalItems}</strong>{" "}
          data
        </span>

        <div className="flex items-center gap-1.5">
          <span>Baris:</span>
          {[10, 20, 50].map((size) => (
            <Button
              key={size}
              type="button"
              variant={limit === size ? "default" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              disabled={disabled}
              onClick={() => onLimitChange(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Sebelumnya
        </Button>

        <span className="min-w-[85px] text-center text-sm font-medium">
          Hal {page} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
