import axios from 'axios'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'

export const payloadClient = axios.create({
    baseURL: `${PAYLOAD_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
payloadClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('payload-token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ====================
// AUTH API
// ====================

export const authAPI = {
    login: async (email: string, password: string) => {
        const { data } = await payloadClient.post('/users/login', {
            email,
            password,
        })
        if (data.token) {
            localStorage.setItem('payload-token', data.token)
        }
        return data
    },

    me: async () => {
        const { data } = await payloadClient.get('/users/me')
        return data
    },

    logout: () => {
        localStorage.removeItem('payload-token')
        window.location.href = '/login'
    },
}

// ====================
// POSTS API
// ====================

export const postsAPI = {
    getAll: async (params?: {
        page?: number
        limit?: number
        search?: string
        status?: string
    }) => {
        const { data } = await payloadClient.get('/posts', { params })
        return data
    },

    getById: async (id: string) => {
        const { data } = await payloadClient.get(`/posts/${id}`)
        return data
    },

    create: async (postData: any) => {
        const { data } = await payloadClient.post('/posts', postData)
        return data
    },

    update: async (id: string, postData: any) => {
        const { data } = await payloadClient.patch(`/posts/${id}`, postData)
        return data
    },

    delete: async (id: string) => {
        const { data } = await payloadClient.delete(`/posts/${id}`)
        return data
    },
}

// ====================
// PRODUCTS API
// ====================

export const productsAPI = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await payloadClient.get('/products', { params })
        return data
    },

    getById: async (id: string) => {
        const { data } = await payloadClient.get(`/products/${id}`)
        return data
    },

    create: async (productData: any) => {
        const { data } = await payloadClient.post('/products', productData)
        return data
    },

    update: async (id: string, productData: any) => {
        const { data } = await payloadClient.patch(`/products/${id}`, productData)
        return data
    },

    delete: async (id: string) => {
        const { data } = await payloadClient.delete(`/products/${id}`)
        return data
    },
}

// ====================
// CATEGORIES API
// ====================

export const categoriesAPI = {
    getAll: async (params?: { type?: 'post' | 'product'; limit?: number; page?: number }) => {
        const { data } = await payloadClient.get('/categories', { params })
        return data
    },

    create: async (categoryData: any) => {
        const { data } = await payloadClient.post('/categories', categoryData)
        return data
    },

    getById: async (id: string) => {
        const { data } = await payloadClient.get(`/categories/${id}`)
        return data
    },

    update: async (id: string, categoryData: any) => {
        const { data } = await payloadClient.patch(`/categories/${id}`, categoryData)
        return data
    },

    delete: async (id: string) => {
        const { data } = await payloadClient.delete(`/categories/${id}`)
        return data
    },
}

// ====================
// MEDIA API
// ====================

export const mediaAPI = {
    upload: async (file: File, alt?: string) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', alt || file.name)

        const { data } = await payloadClient.post('/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return data
    },

    getAll: async (params?: { page?: number; limit?: number }) => {
        const { data } = await payloadClient.get('/media', { params })
        return data
    },
}

// ====================
// ATTRIBUTES API
// ====================

export const attributesAPI = {
    getAll: async (params?: { page?: number; limit?: number }) => {
        const { data } = await payloadClient.get('/product-attributes', { params })
        return data
    },

    getById: async (id: string) => {
        const { data } = await payloadClient.get(`/product-attributes/${id}`)
        return data
    },

    create: async (data: any) => {
        const { data: response } = await payloadClient.post('/product-attributes', data)
        return response
    },

    update: async (id: string, data: any) => {
        const { data: response } = await payloadClient.patch(`/product-attributes/${id}`, data)
        return response
    },

    delete: async (id: string) => {
        const { data } = await payloadClient.delete(`/product-attributes/${id}`)
        return data
    },
}

// ====================
// VARIATIONS API
// ====================

export const productVariationsAPI = {
    getAll: async (params?: { productId?: string }) => {
        const queryParams: any = { limit: 100 }
        if (params?.productId) {
            queryParams.where = {
                product: {
                    equals: params.productId,
                },
            }
        }
        const { data } = await payloadClient.get('/product-variations', { params: queryParams })
        return data
    },

    create: async (data: any) => {
        const { data: response } = await payloadClient.post('/product-variations', data)
        return response
    },

    update: async (id: string, data: any) => {
        const { data: response } = await payloadClient.patch(`/product-variations/${id}`, data)
        return response
    },

    delete: async (id: string) => {
        const { data } = await payloadClient.delete(`/product-variations/${id}`)
        return data
    },
}
