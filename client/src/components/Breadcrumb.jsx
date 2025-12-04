import { Link } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="text-sm text-slate-500 mb-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="hover:text-sky-600 transition font-medium"
          >
            Home
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="mx-2 text-slate-400">/</span>

            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-sky-600 transition font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-700 font-semibold">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
