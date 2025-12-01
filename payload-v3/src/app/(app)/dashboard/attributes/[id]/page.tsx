"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AttributeForm } from "../attribute-form"
import { attributesAPI } from "@/lib/payload-client"
import { Loader2 } from "lucide-react"

export default function EditAttributePage() {
    const params = useParams()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await attributesAPI.getById(params.id as string)
                setData(response)
            } catch (error) {
                console.error("Failed to fetch attribute:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchData()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) {
        return <div>Attribute not found</div>
    }

    return <AttributeForm initialData={data} />
}
