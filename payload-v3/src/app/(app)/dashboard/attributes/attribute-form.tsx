"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { attributesAPI } from "@/lib/payload-client"
import { MediaLibraryModal } from "@/components/media/media-library-modal"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const attributeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    type: z.enum(["select", "color", "button", "image"]),
    options: z.array(z.object({
        label: z.string().min(1, "Label is required"),
        value: z.string().min(1, "Value is required"),
        color: z.string().optional(),
        image: z.any().optional(),
    })).default([]),
})

type AttributeFormValues = z.infer<typeof attributeSchema>

interface AttributeFormProps {
    initialData?: any
}

export function AttributeForm({ initialData }: AttributeFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<AttributeFormValues>({
        resolver: zodResolver(attributeSchema),
        defaultValues: initialData || {
            name: "",
            slug: "",
            type: "select",
            options: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "options",
    })

    const type = form.watch("type")

    const onSubmit = async (data: AttributeFormValues) => {
        setLoading(true)
        console.log("Submitting attribute data:", data)
        try {
            // Clean up payload
            const payload = {
                ...data,
                options: data.options.map(opt => ({
                    label: opt.label,
                    value: opt.value,
                    // Only send color if type is color
                    color: data.type === 'color' ? opt.color : null,
                    // Only send image ID if type is image
                    image: data.type === 'image' ? (opt.image?.id || opt.image) : null,
                    id: (opt as any).id // Preserve ID if editing existing option
                }))
            }

            if (initialData) {
                await attributesAPI.update(initialData.id, payload)
            } else {
                await attributesAPI.create(payload)
            }
            router.push("/dashboard/attributes")
            router.refresh()
        } catch (error) {
            console.error("Failed to save attribute:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {initialData ? "Edit Attribute" : "Create Attribute"}
                </h1>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Color, Size"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    placeholder="e.g. color, size"
                                    {...form.register("slug")}
                                />
                                {form.formState.errors.slug && (
                                    <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    onValueChange={(value: any) => form.setValue("type", value)}
                                    defaultValue={form.watch("type")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="select">Dropdown (Select)</SelectItem>
                                        <SelectItem value="button">Button / Label</SelectItem>
                                        <SelectItem value="color">Color Swatch</SelectItem>
                                        <SelectItem value="image">Image Swatch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Terms / Options</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ label: "", value: "" })}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Term
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                        <div className="grid gap-4 flex-1 md:grid-cols-2 lg:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label>Label</Label>
                                                <Input
                                                    placeholder="e.g. Red, XL"
                                                    {...form.register(`options.${index}.label`)}
                                                />
                                                {form.formState.errors.options?.[index]?.label && (
                                                    <p className="text-xs text-red-500">Required</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Value</Label>
                                                <Input
                                                    placeholder="e.g. red, xl"
                                                    {...form.register(`options.${index}.value`)}
                                                />
                                                {form.formState.errors.options?.[index]?.value && (
                                                    <p className="text-xs text-red-500">Required</p>
                                                )}
                                            </div>

                                            {type === 'color' && (
                                                <div className="space-y-2">
                                                    <Label>Color (Hex)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            className="w-12 p-1 h-10"
                                                            {...form.register(`options.${index}.color`)}
                                                        />
                                                        <Input
                                                            placeholder="#000000"
                                                            {...form.register(`options.${index}.color`)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {type === 'image' && (
                                                <div className="space-y-2">
                                                    <Label>Image/Texture</Label>
                                                    <div className="flex flex-col gap-2">
                                                        {form.watch(`options.${index}.image`) ? (
                                                            <div className="relative h-20 w-20 overflow-hidden rounded border">
                                                                <img
                                                                    src={(form.watch(`options.${index}.image`) as any)?.url}
                                                                    alt="Texture"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute right-1 top-1 h-6 w-6"
                                                                    onClick={() => form.setValue(`options.${index}.image`, null)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <MediaLibraryModal
                                                                onSelect={(media) => form.setValue(`options.${index}.image`, media)}
                                                                trigger={
                                                                    <Button type="button" variant="outline" size="sm">
                                                                        Select Image
                                                                    </Button>
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive mt-8"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No terms added yet. Click "Add Term" to start.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Attribute
                    </Button>
                </div>
            </form>
        </div>
    )
}
