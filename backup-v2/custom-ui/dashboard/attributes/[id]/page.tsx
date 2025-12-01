"use client"

import { useEffect, useState } from "react"
import { AttributeForm } from "../attribute-form"
import { attributesAPI } from "@/lib/payload-client"
import { Loader2 } from "lucide-react"

import { useParams } from "next/navigation"

export default function EditAttributePage() {
    const params = useParams()
    const id = params.id as string
    const [attribute, setAttribute] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAttribute = async () => {
            try {
                const data = await attributesAPI.getById(id)
                setAttribute(data)
            } catch (error) {
                console.error("Failed to fetch attribute:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchAttribute()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!attribute) {
        return <div>Attribute not found</div>
    }

    return <AttributeForm initialData={attribute} />
}
