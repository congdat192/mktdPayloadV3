"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { postsAPI, categoriesAPI } from "@/lib/payload-client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MediaLibraryModal } from "@/components/media/media-library-modal"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductSEO } from "@/components/products/product-seo"

const postSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
    featuredImage: z.any().optional(),
    categories: z.array(z.string()).optional(),
    seo: z.object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.any().optional(),
    }).optional(),
})

type PostFormValues = z.infer<typeof postSchema>

interface PostFormProps {
    initialData?: any
}

export function PostForm({ initialData }: PostFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesAPI.getAll({ type: 'post' })
                setCategories(data.docs)
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            }
        }
        fetchCategories()
    }, [])

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: initialData || {
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            status: "draft",
            categories: [],
        },
    })

    const onSubmit = async (data: PostFormValues) => {
        setLoading(true)
        try {
            if (initialData) {
                await postsAPI.update(initialData.id, data)
            } else {
                await postsAPI.create(data)
            }
            router.push("/dashboard/posts")
            router.refresh()
        } catch (error) {
            console.error("Failed to save post:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormProvider {...form}>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {initialData ? "Edit Post" : "Create Post"}
                    </h1>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2 space-y-6">
                            <Tabs defaultValue="content" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="content">Content</TabsTrigger>
                                    <TabsTrigger value="seo">SEO</TabsTrigger>
                                </TabsList>

                                <TabsContent value="content" className="space-y-4 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Content</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="Enter post title"
                                                    {...form.register("title")}
                                                />
                                                {form.formState.errors.title && (
                                                    <p className="text-sm text-red-500">
                                                        {form.formState.errors.title.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="slug">Slug</Label>
                                                <Input
                                                    id="slug"
                                                    placeholder="post-slug"
                                                    {...form.register("slug")}
                                                />
                                                {form.formState.errors.slug && (
                                                    <p className="text-sm text-red-500">
                                                        {form.formState.errors.slug.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Content</Label>
                                                <RichTextEditor
                                                    value={form.watch("content") || ""}
                                                    onChange={(value) => form.setValue("content", value)}
                                                />
                                                {form.formState.errors.content && (
                                                    <p className="text-sm text-red-500">
                                                        {form.formState.errors.content.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Excerpt</Label>
                                                <Textarea
                                                    placeholder="Short summary..."
                                                    {...form.register("excerpt")}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="seo" className="space-y-4 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>SEO Configuration</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ProductSEO />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Publishing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                            onValueChange={(value: any) =>
                                                form.setValue("status", value)
                                            }
                                            defaultValue={form.watch("status")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Featured Image</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col gap-4">
                                        {form.watch("featuredImage") ? (
                                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                                <img
                                                    src={
                                                        typeof form.watch("featuredImage") === "string"
                                                            ? ""
                                                            : (form.watch("featuredImage") as any)?.url
                                                    }
                                                    alt="Featured"
                                                    className="h-full w-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute right-2 top-2"
                                                    onClick={() => form.setValue("featuredImage", null)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : null}
                                        <MediaLibraryModal
                                            onSelect={(media) => form.setValue("featuredImage", media)}
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
                            Save Post
                        </Button>
                    </div>
                </form>
            </div>
        </FormProvider>
    )
}
