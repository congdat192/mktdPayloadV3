"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { MediaLibraryModal } from "@/components/media/media-library-modal"
import { X, Image as ImageIcon } from "lucide-react"

export function ProductGallery() {
    const { watch, setValue } = useFormContext()
    const gallery = watch("gallery") || []

    const handleAddImage = (media: any) => {
        // Check if image already exists
        if (gallery.some((item: any) => item.image?.id === media.id)) return

        setValue("gallery", [...gallery, { image: media }])
    }

    const handleRemoveImage = (index: number) => {
        const newGallery = [...gallery]
        newGallery.splice(index, 1)
        setValue("gallery", newGallery)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((item: any, index: number) => (
                    <div
                        key={index}
                        className="relative aspect-square rounded-lg border overflow-hidden group"
                    >
                        <img
                            src={item.image?.url}
                            alt={item.image?.alt || "Gallery Image"}
                            className="w-full h-full object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
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
        </div>
    )
}
