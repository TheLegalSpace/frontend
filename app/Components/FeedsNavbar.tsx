// components/FeedNavbar.tsx
import Image from "next/image";
import Link from "next/link";

// Same single-slash normalisation as services/api.ts — guards against a
// trailing "/" on API_URL producing "//api/v1/..." in the path.
const API_URL = (process.env.API_URL ?? "").replace(/\/+$/, "");
const API_PATH = (process.env.NEXT_PUBLIC_API_PATH ?? "/api/v1").replace(
  /^\/+|\/+$/g,
  "",
);
const API_BASE = API_URL ? `${API_URL}/${API_PATH}` : `/${API_PATH}`;

async function getFeedNavbarData() {
  const res = await fetch(`${API_BASE}/feed/sidebar`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error("Failed to fetch feed navbar");
  return res.json();
}

interface FeedNavbarItem {
  id: string;
  type: "firm" | "lawyer" | "article" | "event";
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  meta?: string;
}

export default async function FeedNavbar() {
  const items = await getFeedNavbarData();

  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Trending Section */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Trending Now
          </h3>
          <div className="space-y-4">
            {items.map((item: FeedNavbarItem) => (
              <Link
                key={item.id}
                href={item.url}
                className="flex items-center gap-3 group"
              >
                {item.image ? (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs text-gray-400">
                      {item.type[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-gray-400 truncate">
                      {item.subtitle}
                    </p>
                  )}
                  {item.meta && (
                    <p className="text-xs text-blue-600 mt-0.5">{item.meta}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
