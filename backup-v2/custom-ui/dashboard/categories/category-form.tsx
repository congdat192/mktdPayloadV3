"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { categoriesAPI } from "@/lib/payload-client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MediaLibraryModal } from "@/components/media/media-library-modal"

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    type: z.enum(["post", "product"]),
    parent: z.string().optional().nullable(),
    image: z.any().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
    initialData?: any
}

export function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesAPI.getAll({ limit: 100 })
                // Filter out current category to prevent self-parenting
                const filtered = initialData
                    ? data.docs.filter((c: any) => c.id !== initialData.id)
                    : data.docs
                setCategories(filtered)
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            }
        }
        fetchCategories()
    }, [initialData])

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: initialData ? {
            ...initialData,
            parent: initialData.parent?.id || initialData.parent, // Handle populated or ID
        } : {
            name: "",
            slug: "",
            description: "",
            type: "product",
            parent: null,
            image: null,
        },
    })

    const onSubmit = async (data: CategoryFormValues) => {
        setLoading(true)
        try {
            // Clean up data
            const payload = {
                ...data,
                parent: data.parent === "none" ? null : data.parent
            }

            if (initialData) {
                await categoriesAPI.update(initialData.id, payload)
            } else {
                await categoriesAPI.create(payload)
            }
            router.push("/dashboard/categories")
            router.refresh()
        } catch (error) {
            console.error("Failed to save category:", error)
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
                    {initialData ? "Edit Category" : "Create Category"}
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
                                    placeholder="Category Name"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    placeholder="category-slug"
                                    {...form.register("slug")}
                                />
                                {form.formState.errors.slug && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.slug.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Category Description"
                                    {...form.register("description")}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                            <SelectItem value="product">Product Category</SelectItem>
                                            <SelectItem value="post">Post Category</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Parent Category</Label>
                                    <Select
                                        onValueChange={(value: any) => form.setValue("parent", value)}
                                        defaultValue={form.watch("parent") || "none"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thumbnail</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {form.watch("image") ? (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                            <img
                                                src={(form.watch("image") as any)?.url}
                                                alt="Thumbnail"
                                                className="h-full w-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute right-2 top-2"
                                                onClick={() => form.setValue("image", null)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : null}
                                    <MediaLibraryModal
                                        onSelect={(media) => form.setValue("image", media)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Category
                    </Button>
                </div>
            </form>
        </div>
    )
}
