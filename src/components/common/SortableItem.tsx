import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export const SortableItem = ({ id, children, newlyAddedId, animationsEnabled }: { id: string, children: React.ReactNode, newlyAddedId: string | null, animationsEnabled: boolean }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    const isNew = id === newlyAddedId;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? '' : 'transition-shadow duration-150'} ${isNew ? `ring-2 ring-[var(--primary)] ring-offset-2 rounded-xl ${animationsEnabled ? 'animate-pulse' : ''}` : ''}`}
        >
            <div className="flex items-stretch gap-0.5 group">
                <div
                    {...attributes}
                    {...listeners}
                    className="w-7 flex items-center justify-center cursor-grab hover:text-[var(--primary)] text-slate-300 dark:text-slate-600 touch-none hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200 flex-shrink-0"
                    title="Arrastar para reorganizar"
                >
                    <GripVertical size={16} strokeWidth={2.5} />
                </div>
                {children}
            </div>
        </div>
    );
};
