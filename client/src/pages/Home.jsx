// client/src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

function Home() {
  const [posts, setPosts] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    apiRequest("/posts")
      .then((data) => setPosts(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load posts");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        Home – Blog Posts
      </h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Layout: sidebar + content */}
      <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] gap-6 items-start">
        {/* Sidebar */}
        <aside className="mb-4 md:mb-0">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Categories
          </h3>
          <div className="flex md:flex-col flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full border transition 
                  ${
                    selectedCategory === cat
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Content: skeleton + posts */}
{/* POSTS LIST */}
{!loading && filteredPosts.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredPosts.map((post) => (
      <Link
        key={post.id}
        to={`/posts/${post.slug}`}
        className="group flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 
                   overflow-hidden hover:shadow-lg hover:-translate-y-[2px] transition 
                   cursor-pointer"
      >
        {post.image_url && (
          <img
            src={`http://localhost:5000${post.image_url}`}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition">
              {post.title}
            </h3>

            {post.category && (
              <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {post.category}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-3">
            By {post.author} • {new Date(post.created_at).toLocaleString()}
          </p>

          <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
            {post.content}
          </p>
        </div>
      </Link>
    ))}
  </div>
)}

      </div>
    </div>
  );
}

export default Home;
