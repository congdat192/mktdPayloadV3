"use client"

import { useState } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Category {
    id: string | number
    name: string
    slug: string
    order?: number
    depth?: number // Added depth property
    parent?: string | number | { id: string | number; name: string } | null
    createdAt?: string
    updatedAt?: string
}

interface SortableCategoryListProps {
    categories: Category[]
    onReorder: (newOrder: Category[]) => void
    onDelete: (id: string) => void
}

function SortableItem({ category, onDelete }: { category: Category; onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${(category.depth || 0) * 24}px`, // Indent based on depth
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center justify-between p-3 bg-background border rounded-md mb-2",
                isDragging && "opacity-50 border-primary"
            )}
        >
            <div className="flex items-center gap-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="h-5 w-5" />
                </div>
                <div>
                    <div className="font-medium flex items-center">
                        {(category.depth || 0) > 0 && (
                            <span className="text-muted-foreground mr-2">└─</span>
                        )}
                        {category.name}
                    </div>
                    <div className="text-xs text-muted-foreground">/{category.slug}</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/categories/${category.id}`}>
                        <Pencil className="h-4 w-4" />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(category.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export function SortableCategoryList({ categories, onReorder, onDelete }: SortableCategoryListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = categories.findIndex((item) => item.id === active.id)
            const newIndex = categories.findIndex((item) => item.id === over?.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = arrayMove(categories, oldIndex, newIndex)
                onReorder(newItems)
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2">
                    {categories.map((category) => (
                        <SortableItem
                            key={category.id}
                            category={category}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
