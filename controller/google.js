const { google } = require('googleapis');

const credentials = require('../lofty-entropy-377505-45db0db9d418.json'); // Replace with the actual path to your service account key JSON file
// const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
// const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const FOLDER_ID = '1F_XxfUK4qVBR3-74-rdDwWQnSZGFckum'; // Replace with the actual folder ID

const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    SCOPES
);

const googleAPI = {
    getList: async function(FOLDER_ID) {
        return new Promise((resolve, reject) => {
            jwtClient.authorize((err) => {
                if (err) {
                    console.error('Error authorizing service account:', err);
                    reject(err);
                    return;
                }
    
                const drive = google.drive({ version: 'v3', auth: jwtClient });
                const list = [];
    
                // List files in the folder
                drive.files.list(
                    {
                        q: `'${FOLDER_ID}' in parents`,
                        fields: 'files(id, name, mimeType, modifiedTime, createdTime)',
                    },
                    (err, response) => {
                        if (err) {
                            console.error('Error listing files:', err);
                            reject(err);
                            return;
                        }
    
                        const files = response.data.files;
                        if (files.length) {
                            files.forEach((file) => {
                                list.push({
                                    name: file.name,
                                    id: file.id,
                                    type: file.mimeType,
                                    modifiedTime: file.modifiedTime,
                                    createdTime: file.createdTime,
                                });
                            });
                            // console.log(list);
                            resolve(list); // Resolve the Promise with the list of files
                        } else {
                            // console.log('No files found.');
                            resolve(list); // Resolve with an empty list
                        }
                    }
                );
            });
        });
    },
    createFolder: async function(FOLDER_NAME, PARENT_FOLDER_ID) {
        try {
            const fileMetadata = {
                'name': FOLDER_NAME,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [PARENT_FOLDER_ID]
            };
            const drive = google.drive({ version: 'v3', auth: jwtClient });
            const folder = await drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            });
        
            console.log('Folder ID: ', folder.data.id);
            return folder.data.id;
        } catch (error) {
            console.error('Error creating folder:', error.message);
            throw error;
        }
    },
}

module.exports = googleAPI;