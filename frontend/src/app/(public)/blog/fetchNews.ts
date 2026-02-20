// Server-side RSS fetcher — runs ONLY on the server (no CORS issues)

export interface Article {
    title: string
    link: string
    description: string
    pubDate: string
    source: string
    category: string
    image: string | null
    emoji: string
    readTime: string
}

const RSS_FEEDS = [
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Technology', category: 'Technology', emoji: '📡' },
    { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', category: 'Technology', emoji: '🚀' },
    { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', category: 'Technology', emoji: '💻' },
    { url: 'https://news.google.com/rss/search?q=education+Nigeria+JAMB+WAEC+students&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News', category: 'Education', emoji: '🎓' },
    { url: 'https://news.google.com/rss/search?q=artificial+intelligence+education+students&hl=en&gl=US&ceid=US:en', source: 'Google News', category: 'AI & Education', emoji: '🤖' },
]

function extractTag(xml: string, tag: string): string | null {
    const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i')
    const cdataMatch = cdataRe.exec(xml)
    if (cdataMatch) return cdataMatch[1].trim()
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
    const match = re.exec(xml)
    return match ? match[1].trim() : null
}

function extractImage(itemXml: string): string | null {
    const mediaContent = /media:content[^>]+url=["']([^"']+)["']/i.exec(itemXml)
    if (mediaContent) return mediaContent[1]
    const mediaThumbnail = /media:thumbnail[^>]+url=["']([^"']+)["']/i.exec(itemXml)
    if (mediaThumbnail) return mediaThumbnail[1]
    const enclosure = /enclosure[^>]+url=["']([^"']*\.(jpg|jpeg|png|webp)[^"']*)["']/i.exec(itemXml)
    if (enclosure) return enclosure[1]
    return null
}

function cleanHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function estimateReadTime(text: string): string {
    return `${Math.max(1, Math.ceil(text.split(' ').length / 200))} min read`
}

async function fetchSingleFeed(feed: typeof RSS_FEEDS[0]): Promise<Article[]> {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(feed.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'PrepGenius-AI-Blog/1.0 (RSS Reader)', Accept: 'application/rss+xml,application/xml,text/xml,*/*' },
            next: { revalidate: 28800 },
        })
        clearTimeout(timeout)
        if (!res.ok) return []

        const xml = await res.text()
        const articles: Article[] = []
        const pattern = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g
        let match

        while ((match = pattern.exec(xml)) !== null) {
            const item = match[1]
            const title = extractTag(item, 'title')
            const link = extractTag(item, 'link') || (/href=["']([^"']+)["']/.exec(item)?.[1]) || null
            const description = extractTag(item, 'description') || extractTag(item, 'summary') || ''
            const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || new Date().toISOString()
            if (!title || !link) continue

            const cleanDesc = cleanHtml(description).slice(0, 300)
            articles.push({
                title: cleanHtml(title).slice(0, 120),
                link: link.startsWith('http') ? link : `https://${link}`,
                description: cleanDesc,
                pubDate: new Date(pubDate).toISOString(),
                source: feed.source,
                category: feed.category,
                image: extractImage(item),
                emoji: feed.emoji,
                readTime: estimateReadTime(cleanDesc),
            })
            if (articles.length >= 5) break
        }
        return articles
    } catch {
        return []
    }
}

export async function fetchNewsArticles(): Promise<{ articles: Article[]; fetchedAt: string }> {
    const results = await Promise.allSettled(RSS_FEEDS.map(fetchSingleFeed))
    const all: Article[] = []
    for (const r of results) {
        if (r.status === 'fulfilled') all.push(...r.value)
    }
    const seen = new Set<string>()
    const articles = all
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .filter(a => {
            const key = a.title.slice(0, 60).toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        .slice(0, 12)

    return { articles, fetchedAt: new Date().toISOString() }
}
