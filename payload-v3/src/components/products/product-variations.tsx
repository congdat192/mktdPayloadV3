"use client"

import { useState, useEffect } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { productVariationsAPI } from "@/lib/payload-client"
import { MediaLibraryModal } from "@/components/media/media-library-modal"
import { VariationMatrix } from "./variation-matrix"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductVariationsProps {
    productId?: string
}

export function ProductVariations({ productId }: ProductVariationsProps) {
    const [variations, setVariations] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchVariations = async () => {
        if (!productId) return

        setLoading(true)
        try {
            const data = await productVariationsAPI.getAll({ productId })
            setVariations(data.docs)
        } catch (error) {
            console.error("Failed to fetch variations:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVariations()
    }, [productId])

    const handleUpdateVariation = async (id: string, data: any) => {
        try {
            await productVariationsAPI.update(id, data)
            setVariations(variations.map(v => v.id === id ? { ...v, ...data } : v))
        } catch (error) {
            console.error("Failed to update variation:", error)
            alert("Failed to update variation.")
        }
    }

    const handleDeleteVariation = async (id: string) => {
        if (!confirm("Are you sure you want to delete this variation?")) return
        try {
            await productVariationsAPI.delete(id)
            setVariations(variations.filter(v => v.id !== id))
        } catch (error) {
            console.error("Failed to delete variation:", error)
        }
    }

    if (!productId) {
        return (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Please save the product before adding variations.
            </div>
        )
    }

    return (
        <Tabs defaultValue="manage" className="w-full">
            <TabsList>
                <TabsTrigger value="manage">Manage Variations ({variations.length})</TabsTrigger>
                <TabsTrigger value="generate">Generate New</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="space-y-4 mt-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : variations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No variations yet. Use "Generate New" tab to create variations.
                    </div>
                ) : (
                    <Accordion type="multiple" className="space-y-4">
                        {variations.map((variation, index) => {
                            const variationId = String(variation.id || index)
                            const displayId = variationId.substring(0, 8)

                            return (
                                <AccordionItem key={variationId} value={variationId} className="border rounded-lg px-4">
                                    <div className="flex items-center justify-between py-4">
                                        <AccordionTrigger className="hover:no-underline py-0">
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium">
                                                    #{displayId} - {variation.name || Object.values(variation.attributes || {}).join(", ")}
                                                </span>
                                                {variation.image && (
                                                    <img src={variation.image.url} alt="" className="h-8 w-8 rounded object-cover border" />
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 ml-2"
                                            onClick={() => handleDeleteVariation(variation.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pt-4 pb-4 border-t space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>SKU</Label>
                                                <Input
                                                    defaultValue={variation.sku}
                                                    onBlur={(e) => handleUpdateVariation(variation.id, { sku: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Price</Label>
                                                <Input
                                                    type="number"
                                                    defaultValue={variation.price}
                                                    onBlur={(e) => handleUpdateVariation(variation.id, { price: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Stock Quantity</Label>
                                                <Input
                                                    type="number"
                                                    defaultValue={variation.stock || variation.stockQuantity}
                                                    onBlur={(e) => handleUpdateVariation(variation.id, { stock: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Image</Label>
                                                <div className="flex items-center gap-4">
                                                    {variation.image && (
                                                        <img src={variation.image.url} className="h-10 w-10 rounded border object-cover" />
                                                    )}
                                                    <MediaLibraryModal
                                                        onSelect={(media) => handleUpdateVariation(variation.id, { image: media.id })}
                                                        trigger={<Button variant="outline" size="sm">Select Image</Button>}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                )}
            </TabsContent>

            <TabsContent value="generate" className="mt-4">
                <VariationMatrix productId={productId} onSuccess={fetchVariations} />
            </TabsContent>
        </Tabs>
    )
}
