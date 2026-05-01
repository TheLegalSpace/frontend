// components/LegalInsights.tsx
import { ArrowUpRight, BookOpen, Calendar } from "lucide-react";
import Image from "next/image";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  reads: number;
  image: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Energy Investments in West Africa",
    excerpt:
      "Explore how energy consumption is evolving in West Africa, particularly in the wake of significant investments in infrastructure.",
    date: "March 29, 2026",
    author: "Adaeze Okafor",
    reads: 120,
    image: "/Article.png",
  },
  {
    id: 2,
    title: "Energy Investments in West Africa",
    excerpt:
      "Explore how energy consumption is evolving in West Africa, particularly in the wake of significant investments in infrastructure.",
    date: "March 29, 2026",
    author: "Adaeze Okafor",
    reads: 120,
    image: "/Article.png",
  },
  {
    id: 3,
    title: "Energy Investments in West Africa",
    excerpt:
      "Explore how energy consumption is evolving in West Africa, particularly in the wake of significant investments in infrastructure.",
    date: "March 29, 2026",
    author: "Adaeze Okafor",
    reads: 120,
    image: "/Article.png",
  },
];

export default function LegalInsights() {
  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 xl:px-16 bg-[#F9F9F9]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <p className="text-[#1A56DB] text-xs uppercase tracking-wider font-medium">
            Legal Insights
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] text-[#0A0A0A] font-serif leading-tight mt-2">
            Written by verified practitioners
          </h2>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:shadow-lg transition-shadow duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-5 md:p-6 space-y-3">
                {/* Date */}
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{article.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-snug">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Author */}
                <p className="text-gray-400 text-xs">
                  By <span className="text-gray-600">{article.author}</span>
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-blue-600 text-xs font-medium">
                    {article.reads} Reads
                  </span>
                  <a
                    href={`/articles/${article.id}`}
                    className="flex items-center gap-1 text-gray-500 text-xs font-medium hover:text-blue-600 transition-colors duration-200 group/link"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}