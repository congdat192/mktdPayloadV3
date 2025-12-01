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
    options: z.array(
        z.object({
            label: z.string().min(1, "Label is required"),
            value: z.string().min(1, "Value is required"),
        })
    ),
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

    const onSubmit = async (data: AttributeFormValues) => {
        setLoading(true)
        try {
            if (initialData) {
                await attributesAPI.update(initialData.id, data)
            } else {
                await attributesAPI.create(data)
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
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Attribute Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Color, Size"
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
                                        placeholder="e.g. color, size"
                                        {...form.register("slug")}
                                    />
                                    {form.formState.errors.slug && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.slug.message}
                                        </p>
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
                                            <SelectItem value="select">Select (Dropdown)</SelectItem>
                                            <SelectItem value="color">Color</SelectItem>
                                            <SelectItem value="button">Button (Label)</SelectItem>
                                            <SelectItem value="image">Image</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Terms (Options)</CardTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ label: "", value: "" })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Term
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-4 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs">Label</Label>
                                            <Input
                                                {...form.register(`options.${index}.label`)}
                                                placeholder="e.g. Red, XL"
                                            />
                                            {form.formState.errors.options?.[index]?.label && (
                                                <p className="text-xs text-red-500">
                                                    {form.formState.errors.options[index]?.label?.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs">Value</Label>
                                            <Input
                                                {...form.register(`options.${index}.value`)}
                                                placeholder="e.g. red, xl"
                                            />
                                            {form.formState.errors.options?.[index]?.value && (
                                                <p className="text-xs text-red-500">
                                                    {form.formState.errors.options[index]?.value?.message}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mt-8 text-red-500 hover:text-red-700"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No terms added yet. Click "Add Term" to start.
                                    </div>
                                )}
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
                        Save Attribute
                    </Button>
                </div>
            </form>
        </div>
    )
}
