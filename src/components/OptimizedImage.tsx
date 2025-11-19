import { cn } from '@/lib/utils';
// Image component removed - use <img> tags instead
import React, { useEffect, useRef, useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    blurDataURL?: string;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    className?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export default function OptimizedImage({
    src,
    alt,
    blurDataURL,
    priority = false,
    className = '',
    onLoad,
    onError,
    ...props
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before the image comes into view
                threshold: 0.1
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority, isInView]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setIsError(true);
        onError?.();
    };

    // Generate optimized src with quality parameter
    const getOptimizedSrc = (originalSrc: string) => {
        // If it's an external image, return as is
        if (originalSrc.startsWith('http')) {
            return originalSrc;
        }

        // For local images, you could add optimization parameters here
        // For now, return the original src
        return originalSrc;
    };

    return (
        <div
            ref={imgRef}
            className={cn(
                'relative overflow-hidden bg-gray-200',
                className
            )}
            style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined }}
        >
            {/* Placeholder/Blur */}
            {!isLoaded && !isError && (
                <div
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    style={{
                        backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: blurDataURL ? 'blur(10px)' : undefined
                    }}
                />
            )}

            {/* Error State */}
            {isError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-500">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm">Failed to load</p>
                    </div>
                </div>
            )}

            {/* Actual Image */}
            {isInView && !isError && (
                <img
                    src={getOptimizedSrc(src)}
                    alt={alt}
                    width={800}
                    height={600}
                    className={cn(
                        'transition-opacity duration-300 w-full h-full object-cover',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {/* Loading Spinner */}
            {isInView && !isLoaded && !isError && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}

// Hook for preloading images
export function useImagePreloader(urls: string[]) {
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

    useEffect(() => {
        const preloadImages = async () => {
            const promises = urls.map(url => {
                if (loadedImages.has(url) || loadingImages.has(url)) {
                    return Promise.resolve();
                }

                setLoadingImages(prev => new Set(prev).add(url));

                return new Promise<void>((resolve, reject) => {
                    const img = new window.Image();
                    img.onload = () => {
                        setLoadedImages(prev => new Set(prev).add(url));
                        setLoadingImages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(url);
                            return newSet;
                        });
                        resolve();
                    };
                    img.onerror = () => {
                        setLoadingImages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(url);
                            return newSet;
                        });
                        reject(new Error(`Failed to load ${url}`));
                    };
                    img.src = url;
                });
            });

            try {
                await Promise.allSettled(promises);
            } catch (error) {
                console.warn('Some images failed to preload:', error);
            }
        };

        preloadImages();
    }, [urls, loadedImages, loadingImages]);

    return {
        loadedImages,
        loadingImages,
        isLoaded: (url: string) => loadedImages.has(url),
        isLoading: (url: string) => loadingImages.has(url)
    };
}
