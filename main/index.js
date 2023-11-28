const { initRemix } = require( 'remix-electron' );
const { app, BrowserWindow, dialog } = require( 'electron' );
const path = require( 'node:path' );
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require( 'electron-devtools-installer' );

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let win;

// Define a window map to store window identifiers
const windows = new Map();

function setWindowIdentifier( win, identifier ) {
  win.identifier = identifier;
  windows.set( identifier, win );
}

function unsetWindowIdentifier( win ) {
  windows.delete( win.identifier );
  win.identifier = null;
}

async function createWindow( url ) {
  mainWindow = new BrowserWindow( {
    width: isDev ? 1000 : 500,
    height: 600,
    resizable: true,
    titleBarStyle: 'hidden',
    show: false
  } );
  await mainWindow.loadURL( url );
  mainWindow.show();

  // set the window identifier, to be used for communication between renderer processes
  setWindowIdentifier( mainWindow, 'mainWindow' );

  // Show devtools automatically if in development
  if ( isDev ) {
    mainWindow.webContents.openDevTools();
  }
}

app.on( 'ready', () => {
  void ( async () => {
    try {
      if ( process.env.NODE_ENV === 'development' ) {
        await installExtension( REACT_DEVELOPER_TOOLS );
      }

      const url = await initRemix( {
        serverBuild: path.join( __dirname, '../build/index.js' )
      } );
      await createWindow( url );
    } catch ( error ) {
      dialog.showErrorBox( 'Error', getErrorStack( error ) );
      console.error( error );
    }
  } )();
} );

function getErrorStack( error ) {
  return error instanceof Error ? error.stack || error.message : String( error );
}
