import { Link, useLoaderData, useActionData, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import electron from "../electron.server";
import { useState, useEffect, useRef } from "react";
import useLocalStorage from "../hooks/useLocalStorage";


/**
 * @returns {object} includes the path to the project folder
 * @description The loader is just called once, when the page is first loaded.
 *    It's used to show a dialog to select a project folder. Once the project
 *    folder is selected, the path to the folder is returned in the JSON object.
 */
export async function loader( { request } ) {
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
 * 
 * @param {*} param0 
 * @returns 
 */
export const action = async ( { request } ) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries( formData );

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

const SingleButtonForm = ( { action, submitValue, buttonText } ) => (
  <Form style={ { display: "inline" } } method="post" action={ action }>
    <button className="btn" type="submit" name="_action" value={ submitValue }>{ buttonText }</button>
  </Form>
);

export default function OpenProject() {
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
  const contentFolderName = contentFolderPath && contentFolderPath.split( "/" ).pop();
  const dataFolderName = dataFolderPath && dataFolderPath.split( "/" ).pop();

  return (
    <main className="open-project">
      <h1>Open Project</h1>

      <div className="how-to-proceed">
        <p>You selected the following project folder: .../{ projectFolderName }</p>
        <p>Select the folders containing your content and the data folder.</p>
        <ul>
          { contentFolderName ? (
            <li>You selected the following content folder: .../{ contentFolderName }</li>
          ) : (
            <li>Select the content folder <SingleButtonForm action="/open-project" submitValue="getContentFolder" buttonText="Get Content Folder" /></li>
          ) }
          { dataFolderName ? (
            <li>You selected the following data folder: .../{ dataFolderName }</li>
          ) : (
            <li>Select the data folder <SingleButtonForm action="/open-project" submitValue="getDataFolder" buttonText="Get Data Folder" /></li>
          ) }
        </ul>
      </div>
    </main>
  );



  return null;
}