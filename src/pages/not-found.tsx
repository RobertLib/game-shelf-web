import { getDictionary } from "../dictionaries";
import { Link } from "react-router";

export default function NotFound() {
  const dict = getDictionary();

  return (
    <div className="container mx-auto px-6 py-14 text-center">
      <h1 className="mb-4 text-2xl font-bold">404 - {dict.notFound.title}</h1>
      <p className="mb-4">{dict.notFound.description}</p>
      <Link className="btn" to="/">
        {dict.notFound.backToHome}
      </Link>
    </div>
  );
}
