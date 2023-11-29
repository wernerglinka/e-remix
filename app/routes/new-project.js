import { Link, useLoaderData } from "@remix-run/react";

export default function NewProject() {

  return (
    <main className="new-project">
      <h1>New Project Screen</h1>
      <Link to="/">Back</Link>
    </main>
  );
}