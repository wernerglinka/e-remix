import { Link, useLoaderData } from "@remix-run/react";

export default function OpenProject() {

  return (
    <main className="open-project">
      <h1>Open Project Screen</h1>
      <Link to="/">Back</Link>
    </main>
  );
}