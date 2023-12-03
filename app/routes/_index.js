import { Link, useLoaderData } from "@remix-run/react";
import electron from "../electron.server";
import { FolderPlus, FolderOpen, FolderCog } from 'lucide-react';
import { useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export function loader() {
  return {
    userDataPath: electron.app.getPath( "userData" ),
  };
}

export default function Index() {
  // fix to make screen transitions work.
  // See: https://www.jacobparis.com/content/remix-animated-page-transitions
  const data = useLoaderData() || {};
  // store the userDataPath in sessionStorage
  useEffect( () => {
    // clear session storage - blank slate
    sessionStorage.clear();
    sessionStorage.setItem( "userDataPath", data.userDataPath );
  }, [] );

  // This is to test the recent projects list. Delete this later.//////////////
  const recentProjects = [
    {
      name: "Project 1",
      path: "/projects/1",
    },
    {
      name: "Project 2",
      path: "/projects/2",
    },
    {
      name: "Project 3",
      path: "/projects/3",
    },
    {
      name: "Project 4",
      path: "/projects/4",
    },
    {
      name: "Project 5",
      path: "/projects/5",
    },
  ];
  /////////////////////////////////////////////////////////////////////////////

  return (
    <main className="welcome">
      <h1>Metallurgy</h1>
      <p>Content Management for Metalsmith refined</p>

      <ul className="projects">
        <li className="listHeader">Start</li>
        <li>
          <Link to="/open-project"><FolderOpen />Open a Project</Link>
        </li>
        <li>
          <Link to="/new-project"><FolderPlus />Create a New Project</Link>
        </li>
        <li className="preview">
          <Link to="/"><FolderPlus />Clone Github Repo as New Project (Coming soon...)</Link>
        </li>
        <li className="listHeader">Recent</li>
        { recentProjects.map( ( project, index ) => (
          <li className="recent" key={ index }>
            { project.name }
            <Link to={ project.path }>{ project.path }</Link>
          </li>
        ) ) }
      </ul>

    </main>
  );
}


