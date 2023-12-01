import { Link, useLoaderData } from "@remix-run/react";
import useLocalStorage from "../hooks/useLocalStorage";

export default function NewProject() {

  const dataPath = useLocalStorage( "userDataPath" );
  console.log( "dataPath: ", dataPath );

  return (
    <main className="new-project">
      <h1>New Project Screen</h1>
      <Link to="/">Back</Link>
    </main>
  );
};