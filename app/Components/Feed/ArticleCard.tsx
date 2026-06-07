// ArticleCard.tsx
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
    <div className="flex gap-3 border border-[#E6EAED] rounded-xl overflow-hidden bg-white">
      {/* Dark thumbnail */}
      <div className="w-16 h-16 bg-gray-900 flex flex-col items-center justify-center shrink-0">
        <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
          Article
        </span>
        <span className="text-sm font-bold text-gray-400">
          {article.reads}
        </span>
        <span className="text-[8px] text-gray-500">Reads</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-2 pr-3 flex flex-col justify-between">
        <p className="text-sm font-semibold text-gray-900 leading-5 line-clamp-2 font-['Instrument_Serif']">
          {article.title}
        </p>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-['Geist']">
            <span>{article.date}</span>
            <span className="text-blue-600">{article.reads} Reads</span>
          </div>

          <a
            href={`/articles/${article.slug}`}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition font-['Geist']"
          >
            Read Article
          </a>
        </div>
      </div>
    </div>
  );
}