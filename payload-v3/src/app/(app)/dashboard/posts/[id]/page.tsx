"use client"

import { useEffect, useState } from "react"
import { PostForm } from "../post-form"
import { postsAPI } from "@/lib/payload-client"
import { Loader2 } from "lucide-react"

import { useParams } from "next/navigation"

export default function EditPostPage() {
  const params = useParams()
  const id = params.id as string
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postsAPI.getById(id)
        setPost(data)
      } catch (error) {
        console.error("Failed to fetch post:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return <div>Post not found</div>
  }

  return <PostForm initialData={post} />
}
