// Server Component — RSS fetching happens here on the server, no CORS/proxy issues
import { fetchNewsArticles } from './fetchNews'
import BlogClient from './BlogClient'

export const revalidate = 28800 // Refresh every 8 hours

export default async function BlogPage() {
    const { articles, fetchedAt } = await fetchNewsArticles()
    return <BlogClient initialArticles={articles} fetchedAt={fetchedAt} />
}
