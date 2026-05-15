import { useState, useRef, useCallback } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<unknown>;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 100 }: UsePullToRefreshOptions) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isAtTop = useCallback(() => {
    const scrollTop = Math.max(
      window.pageYOffset || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0
    );
    const containerScrollTop = containerRef.current?.scrollTop || 0;
    return scrollTop <= 1 && containerScrollTop <= 1;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAtTop() && !refreshing) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  }, [isAtTop, refreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || refreshing) return;
    if (!isAtTop()) {
      isDragging.current = false;
      setPulling(false);
      setPullDistance(0);
      return;
    }
    const diff = e.touches[0].clientY - startY.current;

    if (diff > 15) {
      e.preventDefault();
      setPulling(true);
      setPullDistance(Math.min(diff * 0.45, 140));
    } else if (diff < -5) {
      isDragging.current = false;
      setPulling(false);
      setPullDistance(0);
    }
  }, [refreshing, isAtTop]);

  const onTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch {
        // ignore
      }
      setRefreshing(false);
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  return { pulling, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd, containerRef };
}
