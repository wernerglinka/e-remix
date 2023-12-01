import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import electron from "../../electron.server";
import { useState, useEffect } from "react";

import path from "path";
import fs from "fs";


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
 * @param {qobject} request 
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

    // redirect to the open project page
    return redirect( '/open-project' );
  }

  const folderActions = [ 'getProjectFolder', 'getContentFolder', 'getDataFolder' ];
  const folderMessages = {
    getProjectFolder: "Select the Project Folder",
    getContentFolder: "Select the Content Folder",
    getDataFolder: "Select the Data Folder",
  };
  const neededPath = {
    getProjectFolder: "projectPath",
    getContentFolder: "contentPath",
    getDataFolder: "dataPath",
  };

  if ( folderActions.includes( _action ) ) {
    const options = {
      message: folderMessages[ _action ],
      properties: [ "openDirectory" ],
    };

    const userChoice = await electron.dialog.showOpenDialog( options );
    if ( userChoice.canceled ) {
      return json( { message: "User canceled the dialog.", actionStatus: "canceled" } );
    }

    return json( { [ neededPath[ _action ] ]: userChoice.filePaths[ 0 ], actionStatus: "ok" } );
  }
  return "nothing's happening";
};


const SingleButtonForm = ( { addClasses = "", action, submitValue, buttonText } ) => (
  <Form style={ { display: "inline" } } method="post" action={ action }>
    <button className={ `btn ${ addClasses }` } type="submit" name="_action" value={ submitValue }>{ buttonText }</button>
  </Form >
);

const getFolderName = ( searchString, path ) => {
  if ( !path ) return "";
  const startIndex = path.indexOf( searchString );
  if ( startIndex !== -1 ) {
    return path.substring( startIndex );
  }
  return "";
};

export default function NewProject() {
  // fix to make screen transitions work.
  // See: https://www.jacobparis.com/content/remix-animated-page-transitions
  const { projectPath } = useLoaderData() || {};

  // Cache projectPath in a state variable
  const [ projectFolderPath, setProjectFolderPath ] = useState( projectPath );

  // contentPath and dataPath are returned from the action function.
  const { contentPath = "", dataPath = "" } = useActionData() || {};

  // Cache contentPath and dataPath in state variables
  const [ contentFolderPath, setContentFolderPath ] = useState( '' );
  const [ dataFolderPath, setDataFolderPath ] = useState( '' );

  useEffect( () => {
    // Retrieve data from sessionStorage on component mount
    const storedData = sessionStorage.getItem( 'contentPath' );
    if ( storedData ) {
      setContentFolderPath( storedData );
    } else {
      setContentFolderPath( contentPath );
      sessionStorage.setItem( 'contentPath', contentPath );
    }
  }, [ contentPath ] );

  useEffect( () => {
    // Retrieve data from sessionStorage on component mount
    const storedData = sessionStorage.getItem( 'dataPath' );
    if ( storedData ) {
      setDataFolderPath( storedData );
    } else {
      setDataFolderPath( dataPath );
      sessionStorage.setItem( 'dataPath', dataPath );
    }
  }, [ dataPath ] );

  // extracting the folder names from the paths
  const projectFolderName = projectFolderPath && projectFolderPath.split( "/" ).pop();
  const contentFolderName = getFolderName( projectFolderName, contentFolderPath );
  const dataFolderName = getFolderName( projectFolderName, dataFolderPath );

  return (
    <main className="new-project">
      <h1>New Project</h1>

      <div className="how-to-proceed">
        <h2>Project Structure</h2>
        <p>To start working on a new project we need the paths to the content folder which contains the markdown content and the data folder which contains metadata files that are being used to build pages.</p>

        <ul>
          <li><strong>Project folder :</strong> /{ projectFolderName }</li>
          { contentFolderName ? (
            <li><strong>Content folder :</strong> /{ contentFolderName }</li>
          ) : (
            <li>Select the content folder <SingleButtonForm action="/new-project" submitValue="getContentFolder" buttonText="Get Content Folder" /></li>
          ) }
          { dataFolderName ? (
            <li><strong>Data folder :</strong> /{ dataFolderName }</li>
          ) : (
            <li>Select the data folder <SingleButtonForm action="/new-project" submitValue="getDataFolder" buttonText="Get Data Folder" /></li>
          ) }
          {
            !( contentFolderName && dataFolderName ) && (
              <li className="decision-buttons" >
                <SingleButtonForm addClasses="secondary" action="/new-project" submitValue="startOver" buttonText="Start Over" />
              </li>
            )
          }
          {
            contentFolderName && dataFolderName && (
              <>
                <li className="decision-buttons" >
                  <Form style={ { display: "inline" } } method="post" action="/new-project">
                    <input type="hidden" name="projectPath" value={ projectFolderPath } />
                    <input type="hidden" name="contentPath" value={ contentFolderPath } />
                    <input type="hidden" name="dataPath" value={ dataFolderPath } />
                    <button className="btn primary" type="submit" name="_action" value="commitProjectData">Start Project</button>
                  </Form >

                  <SingleButtonForm addClasses="secondary" action="/new-project" submitValue="startOver" buttonText="Start Over" />
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