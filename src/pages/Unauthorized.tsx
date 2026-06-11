import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-black">403</h1>

      <p className="mt-4 text-slate-500">
        You don't have permission to access this page.
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl"
      >
        Go Home
      </Link>
    </div>
  );
}