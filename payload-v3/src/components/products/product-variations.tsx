"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Loader2, Plus, Trash2, RefreshCw, Save } from "lucide-react"
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


interface ProductVariationsProps {
    productId?: string
}

export function ProductVariations({ productId }: ProductVariationsProps) {
    const { watch } = useFormContext()
    const [variations, setVariations] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    // Fetch existing variations
    useEffect(() => {
        if (!productId) return

        const fetchVariations = async () => {
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

        fetchVariations()
    }, [productId])

    const handleGenerateVariations = async () => {
        if (!productId) return
        setGenerating(true)

        try {
            // 1. Get attributes marked for variation
            const attributes = watch("attributes") || []
            const variationAttributes = attributes.filter((a: any) => a.variation && a.options && a.options.length > 0)

            if (variationAttributes.length === 0) {
                alert("No attributes selected for variation. Please add attributes and check 'Used for variations'.")
                setGenerating(false)
                return
            }

            // 2. Generate combinations (Cartesian product)
            const combinations = cartesian(variationAttributes.map((a: any) => a.options))

            // 3. Create variations
            const newVariations = []
            for (const combo of combinations) {
                // Map combo back to attribute names
                // combo is array of values [ {label: 'Red', value: 'red'}, {label: 'S', value: 's'} ]
                // We need to store it as { "Color": "Red", "Size": "S" } or similar structure expected by backend
                // The backend schema expects 'attributes' as JSON.

                const attributeValues: any = {}
                combo.forEach((opt: any, index: number) => {
                    attributeValues[variationAttributes[index].name] = opt.label
                })

                // Check if variation already exists (simple check)
                // In a real app, we'd check against existing variations state

                const variationData = {
                    product: productId,
                    attributes: attributeValues,
                    price: watch("price") || 0, // Default to parent price
                    stockStatus: "instock",
                    stockQuantity: 0,
                    sku: `${watch("slug")}-${combo.map((c: any) => c.value).join("-")}`
                }

                const created = await productVariationsAPI.create(variationData)
                newVariations.push(created.doc)
            }

            setVariations([...variations, ...newVariations])
            alert(`Generated ${newVariations.length} variations.`)

        } catch (error) {
            console.error("Failed to generate variations:", error)
            alert("Failed to generate variations.")
        } finally {
            setGenerating(false)
        }
    }

    const handleUpdateVariation = async (id: string, data: any) => {
        try {
            await productVariationsAPI.update(id, data)
            // Update local state
            setVariations(variations.map(v => v.id === id ? { ...v, ...data } : v))
            alert("Variation updated.")
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
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={handleGenerateVariations} disabled={generating}>
                    {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Generate Variations
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                                                #{displayId} - {Object.values(variation.attributes || {}).join(", ")}
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
                                                defaultValue={variation.stockQuantity}
                                                onBlur={(e) => handleUpdateVariation(variation.id, { stockQuantity: Number(e.target.value) })}
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
        </div>
    )
}

// Helper to generate cartesian product of arrays
function cartesian(args: any[]) {
    var r: any[] = [], max = args.length - 1;
    function helper(arr: any[], i: number) {
        for (var j = 0, l = args[i].length; j < l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(args[i][j]);
            if (i == max)
                r.push(a);
            else
                helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
}
