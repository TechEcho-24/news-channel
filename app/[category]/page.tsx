import Link from "next/link";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

const SITE_NAME = "The Echo";

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;
  const name = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${name} News`,
    description: `Latest ${name} news, stories, and analysis from ${SITE_NAME}. Stay updated with breaking ${name.toLowerCase()} headlines.`,
    openGraph: {
      title: `${name} News | ${SITE_NAME}`,
      description: `Latest ${name} news and analysis.`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryStr = resolvedParams.category || "";
  const categoryName = categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Category Header */}
        <div className="border-b-4 border-black pb-4 mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold capitalize tracking-tight font-inter">
            {categoryName} News
          </h1>
          <p className="text-xl text-gray-500 mt-4">
            The latest updates, stories, and analysis from the world of {categoryName.toLowerCase()}.
          </p>
        </div>

        {/* Featured Article for Category */}
        <div className="mb-16">
          <Link href={`/${categoryStr}/featured-article`} className="group block">
            <div className="relative aspect-[21/9] w-full bg-gray-100 mb-6 overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                 [Featured Image]
               </div>
            </div>
            <h2 className="text-[32px] font-medium leading-tight mb-4 group-hover:text-blue-600 transition-colors font-poppins">
              Major Industry Shift Expected in {categoryName} Sector This Year
            </h2>
            <p className="text-xl text-gray-600 mb-4 line-clamp-2 max-w-4xl">
              Analysts are predicting sweeping changes that could reshape how businesses and consumers interact in this fast-paced environment.
            </p>
            <div className="text-gray-500 text-sm flex items-center font-medium">
              <Clock size={16} className="mr-1" /> 2 hours ago
            </div>
          </Link>
        </div>

        {/* Latest Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Link key={item} href={`/${categoryStr}/article-${item}`} className="group block">
              <div className="aspect-[4/3] w-full bg-gray-100 mb-4 relative overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                   [Image]
                 </div>
              </div>
              <h3 className="text-xl font-bold leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                Key trends shaping the future of {categoryName.toLowerCase()} markets
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                A closer look at the data driving the latest decisions from top executives and policymakers.
              </p>
              <div className="text-gray-500 text-xs flex items-center font-medium">
                <Clock size={12} className="mr-1" /> {item * 3} hours ago
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
