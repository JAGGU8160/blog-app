// client/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";
import Breadcrumb from "../components/Breadcrumb";


function Dashboard() {
    const navigate = useNavigate();
  const { authUser, logoutUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", content: "", imageUrl: "" ,category: "General",});
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("image", imageFile);

    const token = localStorage.getItem("authToken");

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Image upload failed");
    }

    return data.imageUrl;
  };

  // load user info
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMsg("You are not logged in.");
      return;
    }

    apiRequest("/auth/me")
      .then((data) => setUser(data.user))
      .catch((err) => setMsg(err.message));
  }, []);

  // load my posts
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    apiRequest("/posts/me/mine")
      .then((data) => setMyPosts(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({ title: "", content: "", imageUrl: "", category: "General" });
    setImageFile(null);
    setEditingId(null);
  };


  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      let imageUrl = null;

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImage();
        setUploading(false);
      }

      if (editingId) {
        // UPDATE
        const updated = await apiRequest(`/posts/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            imageUrl,
            category: form.category,
          }),
        });


        setMyPosts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setMsg("Post updated successfully!");
      } else {
        // CREATE
        const newPost = await apiRequest("/posts", {
          method: "POST",
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            imageUrl,
            category: form.category,
          }),
        });

        setMyPosts((prev) => [newPost, ...prev]);
        setMsg("Post created successfully!");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setMsg(err.message);
      setUploading(false);
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      imageUrl: "",
      category: post.category || "General",
    });
    setImageFile(null);
    setMsg(`Editing: "${post.title}"`);
  };

  const handleDeletePost = async (id) => {
    const ok = window.confirm("Delete this post permanently?");
    if (!ok) return;

    try {
    await apiRequest(`/posts/${id}`, {
      method: "DELETE",
    });

      setMyPosts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
      setMsg("Post deleted.");
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

    const handleLogout = () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setUser(null);
      setMsg("Logged out.");
    };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
        {msg && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-2">
            {msg}
          </p>
        )}
        <p className="text-sm text-slate-600">
          Please log in to manage your posts.
        </p>
      </div>
    );
  }

  return (
    <><Breadcrumb items={[{ label: "Dashboard" }]} />
    <div className="space-y-6">
      {/* Top card: welcome + logout */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-sm text-slate-600">
              Welcome, <span className="font-medium">{user.name}</span> (
              {user.email})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        {msg && (
          <p className="text-sm text-sky-700 bg-sky-50 border border-sky-100 rounded-md px-3 py-2 mt-2">
            {msg}
          </p>
        )}
      </div>

      {/* Create / Edit post card */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {editingId ? "Edit post" : "Create new post"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form className="space-y-3" onSubmit={handleSubmitPost}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Title
            </label>
            <input
              name="title"
              placeholder="Post title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                      focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option>General</option>
            <option>Technology</option>
            <option>Health</option>
            <option>Politics</option>
            <option>Business</option>
            <option>Travel</option>
            <option>Education</option>
          </select>
        </div>


          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 
                         file:rounded-md file:border-0 file:text-xs file:font-medium 
                         file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Content
            </label>
            <textarea
              name="content"
              placeholder="Write your content..."
              value={form.content}
              onChange={handleChange}
              rows={6}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium 
                       text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed 
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
          >
            {uploading
              ? "Uploading..."
              : editingId
              ? "Save changes"
              : "Create Post"}
          </button>
        </form>
      </div>

      {/* My posts list with Edit/Delete */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h3 className="text-lg font-semibold mb-3">My Posts</h3>

        {myPosts.length === 0 ? (
          <p className="text-sm text-slate-600">
            You haven&apos;t created any posts yet.
          </p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            {myPosts.map((post) => (
              <li
                key={post.id}
                className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-none last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{post.title}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>

                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {post.category || "General"}
                </span>


                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div></>
  );
}

export default Dashboard;
