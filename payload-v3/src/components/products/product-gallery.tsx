"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { MediaLibraryModal } from "@/components/media/media-library-modal"
import { X, Image as ImageIcon, GripVertical } from "lucide-react"
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
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableImage({ item, index, onRemove }: { item: any; index: number; onRemove: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.image?.id || index })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative aspect-square rounded-lg border overflow-hidden group bg-background"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 z-10 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1 text-white"
            >
                <GripVertical className="h-4 w-4" />
            </div>
            <img
                src={item.image?.url}
                alt={item.image?.alt || "Gallery Image"}
                className="w-full h-full object-cover"
            />
            <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={onRemove}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    )
}

export function ProductGallery() {
    const { watch, setValue } = useFormContext()
    const gallery = watch("gallery") || []

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleAddImage = (media: any) => {
        if (gallery.some((item: any) => item.image?.id === media.id)) return
        setValue("gallery", [...gallery, { image: media }])
    }

    const handleRemoveImage = (index: number) => {
        const newGallery = [...gallery]
        newGallery.splice(index, 1)
        setValue("gallery", newGallery)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = gallery.findIndex((item: any) => (item.image?.id || item) === active.id)
            const newIndex = gallery.findIndex((item: any) => (item.image?.id || item) === over?.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                setValue("gallery", arrayMove(gallery, oldIndex, newIndex))
            }
        }
    }

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={gallery.map((item: any, index: number) => item.image?.id || index)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {gallery.map((item: any, index: number) => (
                            <SortableImage
                                key={item.image?.id || index}
                                item={item}
                                index={index}
                                onRemove={() => handleRemoveImage(index)}
                            />
                        ))}

                        <div className="aspect-square flex items-center justify-center border-2 border-dashed rounded-lg">
                            <MediaLibraryModal
                                trigger={
                                    <Button variant="ghost" className="h-full w-full flex flex-col gap-2">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Add Image</span>
                                    </Button>
                                }
                                onSelect={handleAddImage}
                            />
                        </div>
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}
