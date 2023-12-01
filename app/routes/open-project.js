import { Link, useLoaderData, useActionData, Form } from "@remix-run/react";
import useLocalStorage from "../hooks/useLocalStorage";


export default function OpenProject() {

  const dataPath = useLocalStorage( "userDataPath" );
  console.log( "dataPath: ", dataPath );

  return (
    <main className="new-project">
      <h1>Open Project Screen</h1>
      <Link to="/">Back</Link>
    </main>
  );
};