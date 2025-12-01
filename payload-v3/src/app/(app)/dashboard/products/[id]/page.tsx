"use client"

import { useEffect, useState } from "react"
import { ProductForm } from "../product-form"
import { productsAPI } from "@/lib/payload-client"
import { Loader2 } from "lucide-react"

import { useParams } from "next/navigation"

export default function EditProductPage() {
    const params = useParams()
    const id = params.id as string
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productsAPI.getById(id)
                setProduct(data)
            } catch (error) {
                console.error("Failed to fetch product:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchProduct()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!product) {
        return <div>Product not found</div>
    }

    return <ProductForm initialData={product} />
}
