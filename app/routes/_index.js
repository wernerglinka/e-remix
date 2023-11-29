import { useLoaderData } from "@remix-run/react";
import electron from "../electron.server";

export function loader() {
  return {
    userDataPath: electron.app.getPath( "userData" ),
  };
}

export default function Index() {
  const data = useLoaderData();
  return (
    <main className="welcome">
      <img src="/images/metallurgy-logo.png" alt="Metallurgy Logo" />
      <h1>Welcome to Metallurgy</h1>
      <p>Metallurgy is a Metalsmith CMS. It is designed to make content management easy. Instead of working with a code editor Metallurgy provides a form-based user interface and WYSIWYG Markdown editors for text.</p>
      <p>User data path: { data.userDataPath }</p>
    </main>
  );
}
