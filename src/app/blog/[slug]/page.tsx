import { headers } from "next/dist/server/request/headers";
import { notFound } from "next/navigation";
import { FiCalendar, FiUser, FiTag, FiArrowLeft } from "react-icons/fi";
import { FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";
import dynamic from "next/dynamic";
import Header from "@/app/components/header";


const CopyLinkButton = dynamic(() => import("@/app/components/CopyLinkButton"), { ssr: true });

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  author?: string;
  authorBio?: string;
  authorImage?: string;
  readTime?: number;
}
interface BlogPostPageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const headersList = headers();
  const host = (await headersList).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const url = `${protocol}://${host}/api/blog?slug=${slug}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) return notFound();
  const post: BlogPost = await res.json();
if (!post?.title) return notFound();

if (post.image && !post.image.startsWith("http")) {
  const cleanPath = post.image.replace(/^\/?uploads\//, ""); // sanitize the path
  post.image = `${protocol}://${host}/uploads/${cleanPath}`;
}


  const relatedRes = await fetch(`${protocol}://${host}/api/blog?limit=3&excludeSlug=${slug}`, {
    cache: "no-store",
  });
  const relatedData = relatedRes.ok ? await relatedRes.json() : [];
  const relatedPosts: BlogPost[] = Array.isArray(relatedData)
    ? relatedData
    : relatedData.posts || relatedData.data || [];

  const generateTOC = (content: string) => {
    const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/g;
    const matches = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, "");
      const id = text.toLowerCase().replace(/[^\w]+/g, "-");
      matches.push({ id, text, level: `h${match[1]}` as "h2" | "h3" });
    }
    return matches;
  };

  const toc = generateTOC(post.content);

  return (
    <>
    <Header/>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
      <a href="/blog" className="flex items-center text-gray-600 hover:text-blue-600 mb-6">
        <FiArrowLeft className="mr-2" />
        Back to Blog
      </a>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Article */}
        <article className="lg:w-2/3">
          {post.image && (
            <div className="rounded-2xl overflow-hidden shadow mb-6">
              <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
            </div>
          )}

          <h1 className="text-4xl font-bold leading-tight text-gray-900 mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <FiUser />
              <span>{post.author || "Admin"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar />
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {post.readTime && <span>· {post.readTime} min read</span>}
          </div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-blue-700 px-3 py-1 text-xs rounded-full font-medium uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-xl border">
            <span className="text-gray-600">Share:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${protocol}://${host}/blog/${post.slug}`)}`}
              target="_blank"
              className="text-gray-500 hover:text-blue-400"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${protocol}://${host}/blog/${post.slug}`)}`}
              target="_blank"
              className="text-gray-500 hover:text-blue-600"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${protocol}://${host}/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              className="text-gray-500 hover:text-blue-700"
            >
              <FaLinkedin size={20} />
            </a>
            <CopyLinkButton url={`${protocol}://${host}/blog/${post.slug}`} />
          </div>

          {post.excerpt && (
            <blockquote className="border-l-4 border-blue-600 pl-4 text-blue-800 italic mb-8">
              {post.excerpt}
            </blockquote>
          )}

          <div className="prose lg:prose-xl max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:w-1/3 space-y-8 sticky top-20 self-start">
          {/* Author */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-100 flex justify-center items-center">
                {post.authorImage ? (
                  <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-gray-400" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{post.author || "Admin"}</h3>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{post.authorBio || "This author hasn't written a bio yet."}</p>
          </div>

          {/* TOC */}
          {toc.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Table of Contents</h3>
              <ul className="space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`text-gray-600 hover:text-blue-600 ${item.level === "h3" ? "pl-4" : ""}`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Posts */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Related Posts</h3>
            <div className="space-y-4">
              {relatedPosts.map((related) => (
                <a
                  href={`/blog/${related.slug}`}
                  key={related._id}
                  className="flex items-start gap-4 hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  {related.image && (
                    <img src={related.image} alt={related.title} className="w-16 h-16 object-cover rounded-md" />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 leading-snug">
                      {related.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(related.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}
