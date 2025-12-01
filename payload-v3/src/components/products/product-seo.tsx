"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MediaLibraryModal } from "@/components/media/media-library-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProductSEO() {
    const { register, watch, setValue, formState: { errors } } = useFormContext()

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="seo.metaTitle">Meta Title</Label>
                <Input
                    id="seo.metaTitle"
                    placeholder="SEO Title"
                    {...register("seo.metaTitle")}
                />
                <p className="text-xs text-muted-foreground">
                    Leave empty to use the product name.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="seo.metaDescription">Meta Description</Label>
                <Textarea
                    id="seo.metaDescription"
                    placeholder="SEO Description"
                    maxLength={160}
                    {...register("seo.metaDescription")}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Max 160 characters</span>
                    <span>{watch("seo.metaDescription")?.length || 0}/160</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label>OG Image (Social Share Image)</Label>
                <div className="flex flex-col gap-4">
                    {watch("seo.ogImage") ? (
                        <div className="relative aspect-video w-[200px] overflow-hidden rounded-lg border">
                            <img
                                src={(watch("seo.ogImage") as any)?.url}
                                alt="OG Image"
                                className="h-full w-full object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute right-2 top-2 h-6 w-6 p-0"
                                onClick={() => setValue("seo.ogImage", null)}
                            >
                                ×
                            </Button>
                        </div>
                    ) : null}
                    <MediaLibraryModal
                        onSelect={(media) => setValue("seo.ogImage", media)}
                        trigger={<Button type="button" variant="outline">Select Image</Button>}
                    />
                </div>
            </div>

            <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Search Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        <div className="text-xl text-blue-600 truncate">
                            {watch("seo.metaTitle") || watch("name") || "Product Title"}
                        </div>
                        <div className="text-sm text-green-700 truncate">
                            {typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}/products/{watch("slug") || "product-slug"}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                            {watch("seo.metaDescription") || "No description provided."}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">JSON-LD Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify({
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": watch("name") || "Product Name",
                            "description": watch("seo.metaDescription") || "Product Description",
                            "sku": watch("sku"),
                            "offers": {
                                "@type": "Offer",
                                "price": watch("price"),
                                "priceCurrency": "VND",
                                "availability": watch("stockQuantity") > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                            }
                        }, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
