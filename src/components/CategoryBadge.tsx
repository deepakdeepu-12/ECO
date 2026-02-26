import { useEffect, useRef } from 'react';

interface CategoryBadgeProps {
    category: string;
    color: string;
}

export function CategoryBadge({ category, color }: CategoryBadgeProps) {
    const badgeRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (badgeRef.current) {
            badgeRef.current.style.backgroundColor = `${color}33`;
            badgeRef.current.style.borderColor = `${color}55`;
        }
        if (dotRef.current) {
            dotRef.current.style.color = color;
        }
    }, [color]);

    return (
        <div
            ref={badgeRef}
            className="category-badge-wrapper inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-white text-xs font-semibold capitalize"
        >
            <span ref={dotRef}>●</span>
            {category}
        </div>
    );
}
