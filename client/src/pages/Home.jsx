// client/src/pages/Home.jsx
import { useEffect, useState } from "react";

function Home() {
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
    <div>
      <h2>Home – Blog Posts</h2>
      <p>We will show list of posts here.</p>

      <section style={{ marginTop: "1rem" }}>
        <h3>Backend status</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
        {!health && !error && <p>Checking server...</p>}
      </section>
    </div>
  );
}

export default Home;
