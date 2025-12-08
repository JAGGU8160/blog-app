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
  const [search, setSearch] = useState("");

  // Load posts
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

  // Optional health check
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

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    return list;
  }, [posts, selectedCategory, search]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Discover stories, ideas, and experiences.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Read and write blogs about anything you love. Explore by
          category, search topics, and share your own perspective.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mt-2">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Layout: sidebar + content */}
      <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] gap-6 items-start">
        {/* Sidebar: categories */}
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

        {/* Content */}
        <section className="space-y-4">
          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 animate-pulse"
                >
                  <div className="h-40 bg-slate-200 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredPosts.length === 0 && (
            <p className="text-sm text-slate-600">
              No posts found for this filter. Try a different category or
              search term.
            </p>
          )}

          {/* Posts grid */}
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
                      By {post.author} •{" "}
                      {new Date(post.created_at).toLocaleString()}
                    </p>

                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
