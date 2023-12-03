import { useLoaderData, useActionData } from "@remix-run/react";
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
 * @returns {object} includes the path to the project folder
 * @description The loader is just called once, when the page is first loaded.
 *    It's used to show a dialog to select a project folder. Once the project
 *    folder is selected, the path to the folder is returned in the JSON object.
 */
export async function loader() {
  // Show a dialog to select a project folder.
  const options = {
    message: "Select a Project Folder",
    properties: [ "openDirectory" ],
  };
  const userChoice = await electron.dialog.showOpenDialog( options );

  // If the user canceled the dialog, redirect to the welcome screen.
  if ( userChoice.canceled ) {
    return redirect( '/' );
  }

  // Return the path to the selected folder.
  return json( { projectPath: userChoice.filePaths[ 0 ] } );
};

// Don't call the loader after the first time.
export const shouldRevalidate = () => false;


/**
 * @function action
 * @param {object} request 
 * @returns {*} Returns either a redirect or a JSON object
 * @note In a Remix server action, we are using node's path module. We directly
 *     require the path module from Node.js, not through Electron. This is 
 *     because Electron's path module is essentially the same as Node.js's 
 *     path module, but intended for use in Electron's main and renderer processes.
 *     Other, electron services like dialog, are imported from the electron.server.js file.
 */
export const action = async ( { request } ) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries( formData );

  if ( _action === "startOver" ) {
    // redirect to the welcome page to start all over
    return redirect( '/' );
  }

  if ( _action === "commitProjectData" ) {
    // get the project data from the form data and convert into JSON
    const projectData = {
      projectPath: formData.get( "projectPath" ),
      contentPath: formData.get( "contentPath" ),
      dataPath: formData.get( "dataPath" ),
    };

    // Create a directory for the project data file
    const filePath = path.join( projectData.projectPath, "/.metallurgy/projectData.json" );
    const directoryPath = path.dirname( filePath );

    // Ensure the directory exists
    if ( !fs.existsSync( directoryPath ) ) {
      fs.mkdirSync( directoryPath, { recursive: true } );
    }

    // Write the project data to the ".metallurgy" directory.
    const fileContent = JSON.stringify( projectData );
    fs.writeFileSync( filePath, fileContent );

    // prepare the search params for the redirect
    const searchParams = new URLSearchParams( {
      projectPath: projectData.projectPath,
      contentPath: projectData.contentPath,
      dataPath: projectData.dataPath,
    } );

    // redirect to the open project page
    return redirect( `/open-project/?${ searchParams }` );
  }

  if ( _action === "getProjectFolder" || _action === "getContentFolder" || _action === "getDataFolder" ) {
    let userInstruction;
    let pathLabel;
    if ( _action === "getProjectFolder" ) {
      userInstruction = "Get Project Folder";
      pathLabel = "projectPath";
    }
    if ( _action === "getContentFolder" ) {
      userInstruction = "Get Content Folder";
      pathLabel = "contentPath";
    }
    if ( _action === "getDataFolder" ) {
      userInstruction = "Get Data Folder";
      pathLabel = "dataPath";
    }
    const options = {
      message: userInstruction,
      properties: [ "openDirectory" ],
    };
    const userChoice = await electron.dialog.showOpenDialog( options );

    if ( userChoice.canceled ) {
      return json( { message: "User canceled the dialog." } );
    }

    return json( { [ pathLabel ]: userChoice.filePaths[ 0 ] } );
  }
  return "nothing's happening";
};


export default function NewProject() {
  // " ... || {} " fix to make screen transitions work.
  // See: https://www.jacobparis.com/content/remix-animated-page-transitions
  const { projectPath } = useLoaderData() || {};

  // Cache projectPath in a state variable
  const [ projectFolderPath, setProjectFolderPath ] = useState( projectPath );

  // contentPath and dataPath are returned from the action function.
  const { contentPath = "", dataPath = "" } = useActionData() || {};

  // Cache contentPath and dataPath in state variables
  const [ contentFolderPath, setContentFolderPath ] = useState( '' );
  const [ dataFolderPath, setDataFolderPath ] = useState( '' );

  // Store the contentPath and dataPath in sessionStorage
  // so we don't lose them when we navigate to the open-project page.
  useEffect( () => {
    const storedData = sessionStorage.getItem( 'contentPath' );
    if ( storedData ) {
      // if there is stored data, update the state variable
      setContentFolderPath( storedData );
    } else {
      // if there is no stored data, update the state variable
      setContentFolderPath( contentPath );
      // and store the data in sessionStorage
      sessionStorage.setItem( 'contentPath', contentPath );
    }
  }, [ contentPath ] );

  useEffect( () => {
    const storedData = sessionStorage.getItem( 'dataPath' );
    if ( storedData ) {
      // if there is stored data, update the state variable
      setDataFolderPath( storedData );
    } else {
      // if there is no stored data, update the state variable
      setDataFolderPath( dataPath );
      // and store the data in sessionStorage
      sessionStorage.setItem( 'dataPath', dataPath );
    }
  }, [ dataPath ] );

  // extracting the folder names from the paths to show in the UI
  const projectFolderName = projectFolderPath && projectFolderPath.split( "/" ).pop();
  const contentFolderName = getFolderName( projectFolderName, contentFolderPath );
  const dataFolderName = getFolderName( projectFolderName, dataFolderPath );

  // Prepare the fields for the form that will be submitted once we have all the data
  // needed to create the project settings file.
  const fields = [
    { name: "projectPath", value: projectFolderPath },
    { name: "contentPath", value: contentFolderPath },
    { name: "dataPath", value: dataFolderPath },
  ];


  return (
    <main className="new-project">
      <h1>Metallurgy</h1>
      <p>Define a New Project</p>

      <div>
        <p>To start working on a new project we need the paths to the content folder which contains the markdown content and the data folder which contains metadata files that are being used to build pages.</p>

        <ul>
          <li><strong>Project folder :</strong> /{ projectFolderName }</li>
          { contentFolderName ? (
            <li><strong>Content folder :</strong> /{ contentFolderName }</li>
          ) : (
            <li>Select the content folder
              <SingleButtonForm
                action="/new-project"
                submitValue="getContentFolder"
                buttonText="Get Content Folder"
              />
            </li>
          ) }
          { dataFolderName ? (
            <li><strong>Data folder :</strong> /{ dataFolderName }</li>
          ) : (
            <li>Select the data folder
              <SingleButtonForm
                action="/new-project"
                submitValue="getDataFolder"
                buttonText="Get Data Folder"
              />
            </li>
          ) }
          {
            !( contentFolderName && dataFolderName ) && (
              <li className="decision-buttons" >
                <SingleButtonForm
                  addClasses="secondary"
                  action="/new-project"
                  submitValue="startOver"
                  buttonText="Start Over"
                />
              </li>
            )
          }
          {
            contentFolderName && dataFolderName && (
              <>
                <li className="decision-buttons" >
                  <SingleButtonForm
                    addClasses="primary"
                    action="/new-project"
                    submitValue="commitProjectData"
                    buttonText="Start Project"
                    fields={ fields }
                  />
                  <SingleButtonForm
                    addClasses="secondary"
                    action="/new-project"
                    submitValue="startOver"
                    buttonText="Start Over"
                  />
                </li>
              </>
            )
          }
        </ul>
      </div>
    </main>
  );



  return null;
}