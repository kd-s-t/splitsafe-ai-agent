import React from 'react';

interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    apiCallTime: number;
    memoryUsage: number;
}

class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetrics> = new Map();
    private observers: PerformanceObserver[] = [];

    constructor() {
        this.initializeObservers();
    }

    private initializeObservers() {
        if ('PerformanceObserver' in window) {
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                    }
                }
            });

            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch {
            }

            const layoutShiftObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if ((entry as PerformanceEntry & { value?: number }).value && (entry as PerformanceEntry & { value: number }).value > 0.1) {
                    }
                }
            });

            try {
                layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.push(layoutShiftObserver);
            } catch {
            }
        }
    }

    measureFunction<T extends unknown[], R>(
        fn: (...args: T) => R,
        name: string
    ): (...args: T) => R {
        return (...args: T): R => {
            const start = performance.now();
            const result = fn(...args);
            const end = performance.now();

            const existing = this.metrics.get(name) || {
                loadTime: 0,
                renderTime: 0,
                apiCallTime: 0,
                memoryUsage: 0
            };

            existing.renderTime = end - start;
            this.metrics.set(name, existing);

            return result;
        };
    }

    async measureAsyncFunction<T extends unknown[], R>(
        fn: (...args: T) => Promise<R>,
        name: string
    ): Promise<(...args: T) => Promise<R>> {
        return async (...args: T): Promise<R> => {
            const start = performance.now();
            const result = await fn(...args);
            const end = performance.now();

            const existing = this.metrics.get(name) || {
                loadTime: 0,
                renderTime: 0,
                apiCallTime: 0,
                memoryUsage: 0
            };

            existing.apiCallTime = end - start;
            this.metrics.set(name, existing);

            return result;
        };
    }

    getMetrics(): Map<string, PerformanceMetrics> {
        return new Map(this.metrics);
    }

    getMemoryUsage(): number {
        if ('memory' in performance) {
            return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
        }
        return 0;
    }

    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

export const performanceMonitor = new PerformanceMonitor();
export function measureRenderTime() {
    return function <P extends object>(Component: React.ComponentType<P>) {
        return React.memo(function MeasuredComponent(props: P) {
            React.useEffect(() => {
                // Performance measurement could be implemented here
            });

            return React.createElement(Component, props);
        });
    };
}

export function debounce<T extends unknown[]>(
    func: (...args: T) => void,
    wait: number
): (...args: T) => void {
    let timeout: NodeJS.Timeout;

    return (...args: T) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function throttle<T extends unknown[]>(
    func: (...args: T) => void,
    limit: number
): (...args: T) => void {
    let inThrottle: boolean;

    return (...args: T) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function batchUpdates(updates: (() => void)[]): void {
    updates.forEach(update => update());
}

export function preloadResource(url: string, type: 'image' | 'script' | 'style' = 'image'): Promise<void> {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = type;

        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to preload ${url}`));

        document.head.appendChild(link);
    });
}

export function lazyLoadImage(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image ${src}`));
        img.src = src;
    });
}

export function virtualizeList<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    scrollTop: number
): { visibleItems: T[]; startIndex: number; endIndex: number } {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

    return {
        visibleItems: items.slice(startIndex, endIndex),
        startIndex,
        endIndex
    };
}
