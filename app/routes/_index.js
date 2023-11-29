import { Link, useLoaderData } from "@remix-run/react";
import electron from "../electron.server";
import { FolderPlus, FolderOpen, FolderCog } from 'lucide-react';

export function loader() {
  return {
    userDataPath: electron.app.getPath( "userData" ),
  };
}

export default function Index() {
  // fix to make screen transitions work.
  // See: https://www.jacobparis.com/content/remix-animated-page-transitions
  const data = useLoaderData() || {};

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
  return (
    <main className="welcome">
      <img src="/images/metallurgy-logo.png" alt="Metallurgy Logo" />
      <h1>Welcome to Metallurgy</h1>
      <p>Metallurgy, a specialized CMS tailored for Metalsmith, transforms the content management experience with its emphasis on simplicity and accessibility. Moving away from conventional code editors, it offers a form-based user interface along with an WYSIWYG Markdown editor. Additionally, Metallurgy ensures secure and organized content storage by keeping all data in a GitHub repository, facilitating easy version control and collaboration.</p>
      <ul className="projects">
        <li>
          <Link to="/open-project"><FolderOpen />Open a Project</Link>
        </li>
        <li>
          <Link to="/new-project"><FolderPlus />Create a New Project</Link>
        </li>
        <li className="listHeader"><FolderCog />Recent</li>
        { recentProjects.map( ( project, index ) => (
          <li className="recent" key={ index }>
            <Link to={ project.path }>{ project.name }</Link>
          </li>
        ) ) }
      </ul>
      <p>User data path: { data.userDataPath }</p>
    </main>
  );
}


