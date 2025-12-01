"use client"

import { useState, useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { attributesAPI } from "@/lib/payload-client"
import { Badge } from "@/components/ui/badge"

export function ProductAttributes() {
    const { control, register, watch, setValue } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "attributes",
    })
    const [globalAttributes, setGlobalAttributes] = useState<any[]>([])

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const data = await attributesAPI.getAll()
                setGlobalAttributes(data.docs)
            } catch (error) {
                console.error("Failed to fetch attributes:", error)
            }
        }
        fetchAttributes()
    }, [])

    const handleAddAttribute = (globalAttrId: string) => {
        const globalAttr = globalAttributes.find((a) => a.id === globalAttrId)
        if (globalAttr) {
            append({
                name: globalAttr.name,
                slug: globalAttr.slug,
                visible: true,
                variation: true,
                options: [], // Will be populated by user selection
                _globalId: globalAttr.id, // Internal reference
                _globalOptions: globalAttr.options, // Store options for selection
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Select onValueChange={handleAddAttribute}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Add existing attribute" />
                    </SelectTrigger>
                    <SelectContent>
                        {globalAttributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.id}>
                                {attr.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        append({
                            name: "Custom Attribute",
                            slug: "",
                            visible: true,
                            variation: true,
                            options: [],
                        })
                    }
                >
                    Add Custom Attribute
                </Button>
            </div>

            <Accordion type="multiple" className="space-y-4">
                {fields.map((field: any, index) => (
                    <AccordionItem
                        key={field.id}
                        value={field.id}
                        className="border rounded-lg px-4"
                    >
                        <div className="flex items-center justify-between py-4">
                            <AccordionTrigger className="hover:no-underline py-0">
                                <span className="font-medium">
                                    {watch(`attributes.${index}.name`) || "New Attribute"}
                                </span>
                            </AccordionTrigger>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 ml-2"
                                onClick={() => remove(index)}
                            >
                                Remove
                            </Button>
                        </div>
                        <AccordionContent className="pt-4 pb-4 space-y-4 border-t">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        {...register(`attributes.${index}.name`)}
                                        placeholder="Attribute Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug</Label>
                                    <Input
                                        {...register(`attributes.${index}.slug`)}
                                        placeholder="attribute-slug"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Values</Label>
                                {field._globalOptions ? (
                                    // If global attribute, show multi-select (simplified as text input for now, ideally a multi-select component)
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {field._globalOptions.map((opt: any) => {
                                                const currentOptions = watch(`attributes.${index}.options`) || []
                                                const isSelected = currentOptions.some((o: any) => o.value === opt.value)
                                                return (
                                                    <Badge
                                                        key={opt.value}
                                                        variant={isSelected ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            const newOptions = isSelected
                                                                ? currentOptions.filter((o: any) => o.value !== opt.value)
                                                                : [...currentOptions, opt]
                                                            setValue(`attributes.${index}.options`, newOptions)
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Click to select terms</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Enter values separated by | (e.g. Red | Blue)"
                                            onChange={(e) => {
                                                const values = e.target.value.split("|").map(v => {
                                                    const val = v.trim()
                                                    return { label: val, value: val.toLowerCase().replace(/\s+/g, '-') }
                                                }).filter(v => v.value)
                                                setValue(`attributes.${index}.options`, values)
                                            }}
                                            defaultValue={field.options?.map((o: any) => o.label).join(" | ")}
                                        />
                                        <p className="text-xs text-muted-foreground">Use | to separate values</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`visible-${index}`}
                                        checked={watch(`attributes.${index}.visible`)}
                                        onCheckedChange={(checked) =>
                                            setValue(`attributes.${index}.visible`, checked)
                                        }
                                    />
                                    <Label htmlFor={`visible-${index}`}>Visible on product page</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`variation-${index}`}
                                        checked={watch(`attributes.${index}.variation`)}
                                        onCheckedChange={(checked) =>
                                            setValue(`attributes.${index}.variation`, checked)
                                        }
                                    />
                                    <Label htmlFor={`variation-${index}`}>Used for variations</Label>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
