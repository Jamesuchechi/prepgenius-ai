import { NextResponse } from 'next/server'

// Cache for 8 hours (28800 seconds) via ISR
export const revalidate = 28800

interface Article {
    title: string
    link: string
    description: string
    pubDate: string
    source: string
    category: string
    image: string | null
    emoji: string
}

const RSS_FEEDS = [
    {
        url: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
        source: 'BBC Technology',
        category: 'Technology',
        emoji: '📡',
    },
    {
        url: 'https://techcrunch.com/feed/',
        source: 'TechCrunch',
        category: 'Technology',
        emoji: '🚀',
    },
    {
        url: 'https://www.theverge.com/rss/index.xml',
        source: 'The Verge',
        category: 'Technology',
        emoji: '💻',
    },
    {
        url: 'https://news.google.com/rss/search?q=education+Nigeria+JAMB+WAEC+students&hl=en-NG&gl=NG&ceid=NG:en',
        source: 'Google News',
        category: 'Education',
        emoji: '🎓',
    },
    {
        url: 'https://news.google.com/rss/search?q=artificial+intelligence+education&hl=en&gl=US&ceid=US:en',
        source: 'Google News',
        category: 'AI & Education',
        emoji: '🤖',
    },
]

// Extract a tag value from XML string
function extractTag(xml: string, tag: string): string | null {
    // Handle CDATA
    const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i')
    const cdataMatch = cdataRe.exec(xml)
    if (cdataMatch) return cdataMatch[1].trim()

    // Normal tags
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
    const match = re.exec(xml)
    return match ? match[1].trim() : null
}

// Try to extract image from various RSS image fields
function extractImage(itemXml: string): string | null {
    // <media:content url="...">
    const mediaContent = /media:content[^>]+url=["']([^"']+)["']/i.exec(itemXml)
    if (mediaContent) return mediaContent[1]

    // <media:thumbnail url="...">
    const mediaThumbnail = /media:thumbnail[^>]+url=["']([^"']+)["']/i.exec(itemXml)
    if (mediaThumbnail) return mediaThumbnail[1]

    // <enclosure type="image/..." url="...">
    const enclosure = /enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i.exec(itemXml)
    if (enclosure) return enclosure[1]
    const enclosure2 = /enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i.exec(itemXml)
    if (enclosure2) return enclosure2[1]

    // <og:image> in content
    const ogImage = /og:image[^>]+content=["']([^"']+)["']/i.exec(itemXml)
    if (ogImage) return ogImage[1]

    // img src inside description
    const imgSrc = /<img[^>]+src=["']([^"']+)["']/i.exec(itemXml)
    if (imgSrc) return imgSrc[1]

    return null
}

// Remove HTML tags and decode basic entities
function cleanHtml(html: string): string {
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

// Rough estimate of read time
function estimateReadTime(description: string): string {
    const words = description.split(' ').length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return `${minutes} min read`
}

async function fetchFeed(feedConfig: typeof RSS_FEEDS[0]): Promise<Article[]> {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout per feed

        const res = await fetch(feedConfig.url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'PrepGenius-AI-Blog/1.0 (RSS Reader)',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            },
            next: { revalidate: 28800 },
        })
        clearTimeout(timeout)

        if (!res.ok) return []

        const xml = await res.text()
        const articles: Article[] = []

        // Parse <item> elements (RSS 2.0) and <entry> elements (Atom)
        const itemPattern = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g
        let match

        while ((match = itemPattern.exec(xml)) !== null) {
            const itemXml = match[1]

            const title = extractTag(itemXml, 'title')
            const link = extractTag(itemXml, 'link') ||
                (/href=["']([^"']+)["']/.exec(itemXml)?.[1]) || null
            const description = extractTag(itemXml, 'description') ||
                extractTag(itemXml, 'summary') ||
                extractTag(itemXml, 'content:encoded') || ''
            const pubDate = extractTag(itemXml, 'pubDate') ||
                extractTag(itemXml, 'published') ||
                extractTag(itemXml, 'updated') ||
                new Date().toISOString()
            const image = extractImage(itemXml)

            if (!title || !link) continue

            const cleanDesc = cleanHtml(description || '').slice(0, 300)

            articles.push({
                title: cleanHtml(title).slice(0, 120),
                link: link.startsWith('http') ? link : `https://${link}`,
                description: cleanDesc,
                pubDate: new Date(pubDate).toISOString(),
                source: feedConfig.source,
                category: feedConfig.category,
                image: image || null,
                emoji: feedConfig.emoji,
            })

            if (articles.length >= 5) break // Max 5 per feed
        }

        return articles
    } catch (err) {
        console.error(`Failed to fetch feed [${feedConfig.source}]:`, err)
        return []
    }
}

export async function GET() {
    try {
        // Fetch all feeds in parallel
        const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed))

        const allArticles: Article[] = []
        for (const result of results) {
            if (result.status === 'fulfilled') {
                allArticles.push(...result.value)
            }
        }

        // Sort by date descending, deduplicate by title
        const seen = new Set<string>()
        const deduped = allArticles
            .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
            .filter(article => {
                const key = article.title.slice(0, 60).toLowerCase()
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })

        // Return top 12
        const articles = deduped.slice(0, 12).map(a => ({
            ...a,
            readTime: estimateReadTime(a.description),
        }))

        return NextResponse.json({
            articles,
            fetchedAt: new Date().toISOString(),
            total: articles.length,
        })
    } catch (err) {
        console.error('RSS aggregation error:', err)
        return NextResponse.json({ articles: [], fetchedAt: new Date().toISOString(), total: 0 }, { status: 200 })
    }
}
