import { useLoaderData, useActionData, Link, useFetcher } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import electron from "../../electron.server";
import { useState, useEffect } from "react";

import getFolderName from "../../utils/getFolderName";
import SingleButtonForm from "../../components/SingleButtonForm";

import path from "path";
import fs from "fs";

import styles from "./styles.css";
export const links = () => [
  { rel: "stylesheet", href: styles },
];

/**
 * @function loader
 * @param {*} param0 
 * @returns a project data object
 * @description The loader is just called once, when the page is first loaded.
 *     It checks if the URL has any search parameters. If it does, it returns
 *     the project data object. If it does not, it shows a dialog to select a
 *     project folder. It checks if the projects folder has a .metallurgy folder
 *     with a projectData.json file. If it does, it returns the project data object.
 *     If it does not, it shows a message that the selected folder does not have
 *     a .metallurgy folder with a projectData.json file.
 */
export async function loader( { request } ) {
  // Create a URL object from the request URL
  const url = new URL( request.url );
  // Check if there are any search parameters
  const hasSearchParams = url.searchParams.toString() !== '';
  let projectData = {};
  // If there are search parameters, return the project data object.
  if ( hasSearchParams ) {
    projectData = {
      projectPath: url.searchParams.get( 'projectPath' ),
      contentPath: url.searchParams.get( 'contentPath' ),
      dataPath: url.searchParams.get( 'dataPath' ),
    };
  } else {
    // If there are no search parameters, show a dialog to select a project folder.
    const options = {
      message: "Select a Project Folder",
      properties: [ "openDirectory" ],
    };
    const userChoice = await electron.dialog.showOpenDialog( options );

    // If the user canceled the dialog, redirect to the welcome screen.
    if ( userChoice.canceled ) {
      return redirect( '/' );
    }

    const projectPath = userChoice.filePaths[ 0 ];
    // check if the project folder has a .metallurgy folder
    const configPath = path.join( projectPath, '.metallurgy/projectData.json' );
    const hasConfig = fs.existsSync( configPath );

    if ( hasConfig ) {
      // get the project data from .metallury/projectData.json
      projectData = JSON.parse( fs.readFileSync( configPath, 'utf8' ) );
    } else {
      // If the project folder does not have a .metallurgy folder, redirect to the welcome screen.
      // display a message that the project folder does not have a .metallurgy folder
      await electron.dialog.showMessageBox( {
        type: 'error',
        title: 'No .metallurgy folder',
        message: 'The selected folder does not have a `.metallurgy/projectData.json` file. Please select a different folder or start a New Project.',
      } );

      return redirect( '/' );
    }
  }

  //get the file names for the content and data directories
  const contentFiles = fs.readdirSync( projectData.contentPath );
  const dataFiles = fs.readdirSync( projectData.dataPath );
  const project = {
    ...projectData,
    contentFiles,
    dataFiles,
  };

  // Return the path to the selected folder.
  return json( project );

}

// Don't call the loader after the first time.
export const shouldRevalidate = () => false;

export const action = async ( { request } ) => {
  const formData = await request.formData();

  return json( { msg: "hello" } );
};

export default function OpenProject() {
  // " ... || {} " fix to make screen transitions work.
  // See: https://www.jacobparis.com/content/remix-animated-page-transitions
  const project = useLoaderData() || {};

  const { msg } = useActionData() || {};

  // extract the project name from the project path
  const projectName = project.projectPath.split( '/' ).pop();

  console.log( project );


  return (
    <main className="new-project">
      <h1>Open Project</h1>
      <ul>
        <li><strong>Project Name:</strong>{ projectName }</li>
        <li>Content Pages</li>

        <li>Data Files</li>


      </ul>

      <Link to="/">Back</Link>
    </main>
  );
};