# Peer2Peer-Forum

Installations:
You will have to install ionic, flask and mongodb 
Go to frontend directory and type "npm install ng2-pdf-viewer --save"

Front end:
In terminal/CMD, type the following before ionic serve to install the dependencies for downloading notes
ionic cordova plugin add cordova-plugin-file-transfer
ionic cordova plugin add cordova-plugin-file
ionic cordova plugin add cordova-plugin-document-viewer
npm install --save @ionic-native/file @ionic-native/document-viewer @ionic-native/file-transfer

To run the application, go to frontend directory and run 'ionic serve'.

Backend:
The database P2Pdb has three collections-notes,users and ideas. Sample JSONs have been included in the readme in the backend folder.

