import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => {
        console.error(err);
        setError("Cannot connect to backend");
      });
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Blog App – MERN + PostgreSQL</h1>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Backend status</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
        {!health && !error && <p>Checking server...</p>}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <Home />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Coming soon</h2>
        <ul>
          <li>Home page – list of blog posts</li>
          <li>Post detail page</li>
          <li>Login / Register</li>
          <li>Dashboard for creating posts</li>
        </ul>
      </section>
    </div>
  );
}

export default App;
