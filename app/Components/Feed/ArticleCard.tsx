"use client";

interface Article {
  title: string;
  date: string;
  reads: number;
  slug: string;
}

export default function ArticleCard({
  article,
}: {
  article: Article;
}) {
  return (
    <div className="flex gap-3 mt-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
      <div className="w-14 h-14 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Article
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-5">
          {article.title}
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500">
          <span>📅 {article.date}</span>
          <span>📖 {article.reads} Reads</span>

          <a
            href={`/articles/${article.slug}`}
            className="ml-auto text-blue-700 hover:underline"
          >
            📄 Read Article
          </a>
        </div>
      </div>
    </div>
  );
}