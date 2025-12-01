"use client"

import { useState } from "react"
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
import { productsAPI } from "@/lib/payload-client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MediaLibraryModal } from "@/components/media/media-library-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductAttributes } from "@/components/products/product-attributes"
import { ProductGallery } from "@/components/products/product-gallery"
import { ProductVariations } from "@/components/products/product-variations"
import { ProductSEO } from "@/components/products/product-seo"

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    salePrice: z.coerce.number().optional(),
    sku: z.string().optional(),
    stockStatus: z.enum(["instock", "outofstock", "onbackorder"]),
    stockQuantity: z.coerce.number().min(0).default(0),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    featuredImage: z.any().optional(),
    type: z.enum(["simple", "variable"]).default("simple"),
    attributes: z.array(z.any()).optional(),
    gallery: z.array(z.any()).optional(),
    seo: z.object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.any().optional(),
    }).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
    initialData?: any
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            name: "",
            slug: "",
            price: 0,
            stockStatus: "instock",
            stockQuantity: 0,
            description: "",
            shortDescription: "",
            type: "simple",
            attributes: [],
            gallery: [],
        },
    })

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true)
        try {
            if (initialData) {
                await productsAPI.update(initialData.id, data)
            } else {
                await productsAPI.create(data)
            }
            router.push("/dashboard/products")
            router.refresh()
        } catch (error) {
            console.error("Failed to save product:", error)
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
                        {initialData ? "Edit Product" : "Create Product"}
                    </h1>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2 space-y-6">
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="inline-flex w-full justify-start overflow-x-auto">
                                    <TabsTrigger value="general">General</TabsTrigger>
                                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                                    {form.watch("type") === "variable" && (
                                        <TabsTrigger value="variations">Variations</TabsTrigger>
                                    )}
                                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                                    <TabsTrigger value="seo">SEO</TabsTrigger>
                                </TabsList>

                                <TabsContent value="general" className="space-y-4 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>General Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Product Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Enter product name"
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
                                                    placeholder="product-slug"
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
                                                <RichTextEditor
                                                    value={form.watch("description") || ""}
                                                    onChange={(value) => form.setValue("description", value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="price">Price</Label>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        {...form.register("price")}
                                                    />
                                                    {form.formState.errors.price && (
                                                        <p className="text-sm text-red-500">
                                                            {form.formState.errors.price.message}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="salePrice">Sale Price</Label>
                                                    <Input
                                                        id="salePrice"
                                                        type="number"
                                                        {...form.register("salePrice")}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="inventory" className="space-y-4 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Inventory</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                                                <Input
                                                    id="sku"
                                                    placeholder="e.g. PROD-001"
                                                    {...form.register("sku")}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                                                    <Input
                                                        id="stockQuantity"
                                                        type="number"
                                                        {...form.register("stockQuantity")}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Stock Status</Label>
                                                    <Select
                                                        onValueChange={(value: any) =>
                                                            form.setValue("stockStatus", value)
                                                        }
                                                        defaultValue={form.watch("stockStatus")}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="instock">In Stock</SelectItem>
                                                            <SelectItem value="outofstock">Out of Stock</SelectItem>
                                                            <SelectItem value="onbackorder">On Backorder</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="attributes" className="space-y-4 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Attributes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ProductAttributes />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {form.watch("type") === "variable" && (
                                    <TabsContent value="variations" className="space-y-4 mt-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Variations</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ProductVariations productId={initialData?.id} />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                )}

                                <TabsContent value="gallery" className="space-y-4 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Product Gallery</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ProductGallery />
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
                                    <CardTitle>Organization</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Product Type</Label>
                                        <Select
                                            onValueChange={(value: any) => form.setValue("type", value)}
                                            defaultValue={form.watch("type")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="simple">Simple Product</SelectItem>
                                                <SelectItem value="variable">Variable Product</SelectItem>
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
                            Save Product
                        </Button>
                    </div>
                </form>
            </div>
        </FormProvider>
    )
}
