import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Get the currently authenticated user from Payload
 * Returns null if not authenticated
 */
export async function getAuthUser() {
    const payload = await getPayload({ config })
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    if (!token) {
        return null
    }

    try {
        const headers = new Headers()
        headers.set('cookie', `payload-token=${token.value}`)

        const { user } = await payload.auth({
            headers: headers
        })
        return user
    } catch (error) {
        console.error('Auth error:', error)
        return null
    }
}

/**
 * Require authentication for a route
 * Redirects to /admin/login if not authenticated
 * Returns the authenticated user
 */
export async function requireAuth() {
    const user = await getAuthUser()

    if (!user) {
        redirect('/admin/login')
    }

    return user
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: any, role: string): boolean {
    return user?.role === role
}

/**
 * Require a specific role
 * Redirects to /admin if user doesn't have the role
 */
export async function requireRole(role: string) {
    const user = await requireAuth()

    if (!hasRole(user, role)) {
        redirect('/admin')
    }

    return user
}
