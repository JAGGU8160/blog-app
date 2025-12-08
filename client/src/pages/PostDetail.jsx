// client/src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api";
import Breadcrumb from "../components/Breadcrumb";

function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest(`/posts/${slug}`)
      .then((data) => {
        setPost(data);
        setMsg("");
      })
      .catch((err) => setMsg(err.message || "Failed to load post"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading post...</p>;
  }

  if (msg) {
    return <p className="text-sm text-red-500">{msg}</p>;
  }

  if (!post) return null;

  const created = new Date(post.created_at);
  const formattedDate = created.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Posts", to: "/" },
          { label: post.title },
        ]}
      />

      {/* Header */}
      <header className="space-y-3">
        {post.category && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium">
            {post.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>By {post.author}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{formattedDate}</span>
          {/* optional “read time” placeholder */}
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>~ 1 min read</span>
        </div>
      </header>

      {/* Image */}
      {post.image_url && (
        <div className="overflow-hidden rounded-2xl shadow-sm border border-slate-100">
          <img
            src={`http://localhost:5000${post.image_url}`}
            alt={post.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Content */}
      <article className="prose prose-slate max-w-none prose-p:leading-relaxed">
        <p className="whitespace-pre-line text-[15px]">
          {post.content}
        </p>
      </article>
    </div>
  );
}

export default PostDetail;
