import TurndownService from 'turndown'
import * as cheerio from 'cheerio'

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
})

/**
 * Convert WordPress HTML content to Lexical JSON format
 * This is a simplified version - Lexical format is complex
 * For production, consider using a proper HTML-to-Lexical converter
 */
export function convertHTMLToLexical(html: string): any {
    // Clean up the HTML
    const $ = cheerio.load(html)

    // Remove WordPress-specific classes and attributes
    $('[class^="wp-"]').removeAttr('class')
    $('[id^="wp-"]').removeAttr('id')

    const cleanHtml = $.html()

    // Convert to Markdown first (easier to work with)
    const markdown = turndownService.turndown(cleanHtml)

    // Simple Lexical structure
    // For production, use proper converter or keep as HTML
    return {
        root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [
                {
                    type: 'paragraph',
                    format: '',
                    indent: 0,
                    version: 1,
                    children: [
                        {
                            type: 'text',
                            format: 0,
                            text: markdown,
                            version: 1,
                        },
                    ],
                },
            ],
        },
    }
}

/**
 * Generate slug from title (Vietnamese-friendly)
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD') // Normalize Vietnamese characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

/**
 * Extract excerpt from HTML content
 */
export function extractExcerpt(html: string, maxLength: number = 200): string {
    const $ = cheerio.load(html)
    const text = $.text().trim()

    if (text.length <= maxLength) return text

    return text.substring(0, maxLength).trim() + '...'
}

/**
 * Parse WordPress Yoast SEO meta
 */
export function parseYoastSEO(wpPost: any): {
    metaTitle?: string
    metaDescription?: string
    canonicalUrl?: string
} {
    const yoastMeta = wpPost.yoast_head_json || {}

    return {
        metaTitle: yoastMeta.title,
        metaDescription: yoastMeta.description,
        canonicalUrl: yoastMeta.canonical,
    }
}

/**
 * Sleep helper for rate limiting
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Progress logger
 */
export class ProgressLogger {
    private total: number
    private current: number = 0
    private startTime: number

    constructor(total: number, private label: string) {
        this.total = total
        this.startTime = Date.now()
    }

    increment() {
        this.current++
        const percentage = Math.round((this.current / this.total) * 100)
        const elapsed = Math.round((Date.now() - this.startTime) / 1000)
        const eta = Math.round((elapsed / this.current) * (this.total - this.current))

        console.log(
            `[${percentage}%] ${this.current}/${this.total} ${this.label} | ` +
            `Elapsed: ${elapsed}s | ETA: ${eta}s`
        )
    }

    complete() {
        const totalTime = Math.round((Date.now() - this.startTime) / 1000)
        console.log(`✅ Completed ${this.total} ${this.label} in ${totalTime}s`)
    }
}
