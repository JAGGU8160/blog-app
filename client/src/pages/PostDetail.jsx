// client/src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api";
import Breadcrumb from "../components/Breadcrumb";

function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiRequest(`/posts/${slug}`)
      .then((data) => setPost(data))
      .catch((err) => setMsg(err.message));
  }, [slug]);

  if (msg) return <p className="text-red-500 text-sm">{msg}</p>;
  if (!post) return <p>Loading post...</p>;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Posts", to: "/" },
          { label: post.title },
        ]}
      />

      <h1 className="text-2xl font-bold mb-3">{post.title}</h1>

      <p className="text-sm text-slate-500 mb-4">
        By {post.author} • {new Date(post.created_at).toLocaleString()}
      </p>

      {post.image_url && (
        <img
          src={`http://localhost:5000${post.image_url}`}
          alt={post.title}
          className="w-full max-h-[400px] object-cover rounded-lg mb-6"
        />
      )}

      <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>
    </div>
  );
}

export default PostDetail;
