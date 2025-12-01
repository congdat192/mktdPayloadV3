"use client"

import { useEffect, useState } from "react"
import { CategoryForm } from "../category-form"
import { categoriesAPI } from "@/lib/payload-client"
import { Loader2 } from "lucide-react"

import { useParams } from "next/navigation"

export default function EditCategoryPage() {
    const params = useParams()
    const id = params.id as string
    const [category, setCategory] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const data = await categoriesAPI.getById(id)
                setCategory(data)
            } catch (error) {
                console.error("Failed to fetch category:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchCategory()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!category) {
        return <div>Category not found</div>
    }

    return <CategoryForm initialData={category} />
}
