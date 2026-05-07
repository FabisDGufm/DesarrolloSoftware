import Parser from "rss-parser";

const parser = new Parser();

export class NewsService {
    private sources = [
        {
            name: "Soy502",
            url: "https://www.soy502.com/rss"
        },
        {
            name: "Prensa Libre",
            url: "https://www.prensalibre.com/feed/"
        }
    ];

    async getGuatemalaNews() {
        const allNews: any[] = [];

        for (const source of this.sources) {
            try {
                const feed = await parser.parseURL(source.url);

                const items = feed.items.map((item) => ({
                    authorId: 0,
                    postId: item.guid || item.link || crypto.randomUUID(),
                    text: item.title || "",
                    imageUrl: null,
                    createdAt: item.pubDate || new Date().toISOString(),
                    authorName: source.name,
                    type: "news",
                    university: null
                }));

                allNews.push(...items);
            } catch (err) {
                console.log(`Error loading RSS ${source.name}`, err);
            }
        }

        // ordenar por fecha
        return allNews.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }
}