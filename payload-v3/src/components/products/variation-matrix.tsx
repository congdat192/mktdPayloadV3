"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { attributesAPI, productVariationsAPI } from "@/lib/payload-client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface VariationMatrixProps {
    productId: string
    onSuccess?: () => void
}

export function VariationMatrix({ productId, onSuccess }: VariationMatrixProps) {
    const [attributes, setAttributes] = useState<any[]>([])
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
    const [selectedTerms, setSelectedTerms] = useState<Record<string, string[]>>({})
    const [generatedVariations, setGeneratedVariations] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    // Bulk edit states
    const [bulkPrice, setBulkPrice] = useState("")
    const [bulkStock, setBulkStock] = useState("")

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const res = await attributesAPI.getAll({ limit: 100 })
                setAttributes(res.docs)
            } catch (error) {
                console.error("Failed to fetch attributes:", error)
            }
        }
        fetchAttributes()
    }, [])

    const handleAttributeToggle = (attributeId: string) => {
        setSelectedAttributes(prev =>
            prev.includes(attributeId)
                ? prev.filter(id => id !== attributeId)
                : [...prev, attributeId]
        )
        // Reset terms for this attribute if deselected
        if (selectedAttributes.includes(attributeId)) {
            const newTerms = { ...selectedTerms }
            delete newTerms[attributeId]
            setSelectedTerms(newTerms)
        }
    }

    const handleTermToggle = (attributeId: string, termValue: string) => {
        setSelectedTerms(prev => {
            const currentTerms = prev[attributeId] || []
            const newTerms = currentTerms.includes(termValue)
                ? currentTerms.filter(t => t !== termValue)
                : [...currentTerms, termValue]
            return { ...prev, [attributeId]: newTerms }
        })
    }

    const generateVariations = () => {
        if (selectedAttributes.length === 0) return

        // Get selected attributes with their selected terms
        const activeAttributes = selectedAttributes.map(attrId => {
            const attr = attributes.find(a => a.id === attrId)
            return {
                ...attr,
                selectedTerms: selectedTerms[attrId] || []
            }
        }).filter(attr => attr.selectedTerms.length > 0)

        if (activeAttributes.length === 0) return

        // Helper to generate Cartesian product
        const cartesian = (args: any[][]) => {
            const result: any[] = []
            const max = args.length - 1
            const helper = (arr: any[], i: number) => {
                for (let j = 0, l = args[i].length; j < l; j++) {
                    const a = arr.slice(0)
                    a.push(args[i][j])
                    if (i === max) result.push(a)
                    else helper(a, i + 1)
                }
            }
            helper([], 0)
            return result
        }

        // Prepare arrays of terms for cartesian product
        const termsArrays = activeAttributes.map(attr =>
            attr.selectedTerms.map((termValue: string) => {
                const term = attr.options.find((o: any) => o.value === termValue)
                return {
                    attributeId: attr.id,
                    attributeName: attr.name,
                    term: term
                }
            })
        )

        const combinations = cartesian(termsArrays)

        const newVariations = combinations.map(combo => ({
            name: combo.map((c: any) => c.term.label).join(" - "),
            attributes: combo.map((c: any) => ({
                attribute: c.attributeId,
                value: c.term.value
            })),
            price: 0,
            stock: 0,
            sku: ""
        }))

        setGeneratedVariations(newVariations)
    }

    const applyBulkEdit = () => {
        setGeneratedVariations(prev => prev.map(v => ({
            ...v,
            price: bulkPrice ? Number(bulkPrice) : v.price,
            stock: bulkStock ? Number(bulkStock) : v.stock
        })))
    }

    const handleSave = async () => {
        setGenerating(true)
        try {
            // Create variations sequentially to verify each one
            for (const variation of generatedVariations) {
                await productVariationsAPI.create({
                    product: productId,
                    ...variation
                })
            }
            setGeneratedVariations([])
            setSelectedAttributes([])
            setSelectedTerms({})
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error("Failed to save variations:", error)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Variations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Attribute Selection */}
                    <div className="space-y-4">
                        <Label>1. Select Attributes</Label>
                        <div className="flex flex-wrap gap-4">
                            {attributes.map(attr => (
                                <div key={attr.id} className="border p-4 rounded-lg space-y-3 min-w-[200px]">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`attr-${attr.id}`}
                                            checked={selectedAttributes.includes(attr.id)}
                                            onCheckedChange={() => handleAttributeToggle(attr.id)}
                                        />
                                        <Label htmlFor={`attr-${attr.id}`} className="font-semibold">
                                            {attr.name}
                                        </Label>
                                    </div>

                                    {selectedAttributes.includes(attr.id) && (
                                        <div className="pl-6 space-y-2">
                                            {attr.options.map((opt: any) => (
                                                <div key={opt.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`term-${attr.id}-${opt.value}`}
                                                        checked={selectedTerms[attr.id]?.includes(opt.value)}
                                                        onCheckedChange={() => handleTermToggle(attr.id, opt.value)}
                                                    />
                                                    <Label htmlFor={`term-${attr.id}-${opt.value}`} className="text-sm">
                                                        {opt.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button onClick={generateVariations} disabled={selectedAttributes.length === 0}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Preview Variations
                    </Button>

                    {/* Generated Preview */}
                    {generatedVariations.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-end gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label>Bulk Price</Label>
                                    <Input
                                        type="number"
                                        value={bulkPrice}
                                        onChange={(e) => setBulkPrice(e.target.value)}
                                        placeholder="Enter price"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bulk Stock</Label>
                                    <Input
                                        type="number"
                                        value={bulkStock}
                                        onChange={(e) => setBulkStock(e.target.value)}
                                        placeholder="Enter stock"
                                    />
                                </div>
                                <Button variant="secondary" onClick={applyBulkEdit}>
                                    Apply to All
                                </Button>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Variation Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {generatedVariations.map((variation, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{variation.name}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={variation.price}
                                                        onChange={(e) => {
                                                            const newVars = [...generatedVariations]
                                                            newVars[index].price = Number(e.target.value)
                                                            setGeneratedVariations(newVars)
                                                        }}
                                                        className="w-32"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={variation.stock}
                                                        onChange={(e) => {
                                                            const newVars = [...generatedVariations]
                                                            newVars[index].stock = Number(e.target.value)
                                                            setGeneratedVariations(newVars)
                                                        }}
                                                        className="w-32"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={variation.sku}
                                                        onChange={(e) => {
                                                            const newVars = [...generatedVariations]
                                                            newVars[index].sku = e.target.value
                                                            setGeneratedVariations(newVars)
                                                        }}
                                                        placeholder="Auto-generated"
                                                        className="w-40"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setGeneratedVariations(prev => prev.filter((_, i) => i !== index))
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={generating}>
                                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create {generatedVariations.length} Variations
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
