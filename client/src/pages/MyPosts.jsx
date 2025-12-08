// client/src/pages/MyPosts.jsx
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Breadcrumb from "../components/Breadcrumb";
import { AuthContext } from "../authContext";

function MyPosts() {
  const { authUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!authUser) {
      setMsg("You must be logged in to see your posts.");
      navigate("/login");
      return;
    }

    apiRequest("/posts/me/mine")
      .then(setPosts)
      .catch((err) => setMsg(err.message));
  }, [authUser, navigate]);

  if (!authUser) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Jaggu blogs" }]} />

      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold">Jaggu blogs</h2>
          <p className="text-xs text-slate-500">
            Posts written by {authUser.name}
          </p>
        </div>
        {posts.length > 0 && (
          <span className="text-xs text-slate-500">
            {posts.length} post{posts.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {msg && <p className="text-sm text-red-500">{msg}</p>}

      {posts.length === 0 ? (
        <p className="text-sm text-slate-600">
          You haven&apos;t written any blog posts yet. Create one from your
          dashboard.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.slug}`}
              className="group flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 
                         overflow-hidden hover:shadow-lg hover:-translate-y-[2px] transition cursor-pointer"
            >
              {post.image_url && (
                <img
                  src={`http://localhost:5000${post.image_url}`}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition mb-1">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
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
    </div>
  );
}

export default MyPosts;
