const model = require('./model');
const google = require('./google');

const admin = {
    render: function(req, res) {
        res.render('admin');
    },
    createIsyu: async function(req, res) {
        const isyuName = req.body.isyu.toUpperCase();
        const oStartDate = 1;
        const oDoubleDate = 1; 
        const oEndDate = 1;
        const mStartDate = 1;
        const mDoubleDate = 1; 
        const mEndDate = 1;

        if (!model.issues[isyuName]) {

            const oSirkFolderID = '1wUfExn2sX5a2ySuuFrBPx6E8HtgDeQS1'; // Online Sirk Folder
            const mSirkFolderID = '19l-OzZxU9HyecBHSQHqxRAah2b0HDiqB'; // Manual Sirk Folder
    
            const isyuFolderName = "0" + (Object.keys(model.issues).length + 1) + ". " + isyuName + " ISYU";
            // const issueNumber = Object.keys(model.issues).length + 1;
            // const formattedIssueNumber = issueNumber < 10 ? "0" + issueNumber : issueNumber.toString();
            // const isyuFolderName = formattedIssueNumber + ". " + isyuName + " ISYU";
            // const isyuFolderName = `${Object.keys(model.issues).length + 1 < 10 ? "0" : ""}${Object.keys(model.issues).length + 1}. ${isyuName} ISYU`;

    
            const issue = {
                name: isyuName,
                oSirk: {
                    folderID: await google.createFolder(isyuFolderName, oSirkFolderID),
                    startDate: oStartDate,
                    doubleDate: oDoubleDate,
                    endDate: oEndDate,
                },
                mSirk: {
                    folderID: 'await google.createFolder(isyuFolderName, mSirkFolderID)',
                    startDate: mStartDate,
                    doubleDate: mDoubleDate,
                    endDate: mEndDate,
                },
            }

            model.createIsyu(issue);

            const sections = [
                { name: 'BALITA'  , oFolders: [], mFolders: [] }, 
                { name: 'ISPORTS' , oFolders: [], mFolders: [] }, 
                { name: 'BAYAN'   , oFolders: [], mFolders: [] },  
                { name: 'BNK'     , oFolders: [], mFolders: [] }, 
                { name: 'RETRATO' , oFolders: [], mFolders: [] },  
                { name: 'SINING'  , oFolders: [], mFolders: [] }, 
                { name: 'IT'      , oFolders: [], mFolders: [] },  
            ];

            for (const [index, section] of sections.entries()) {
                section.oID = await google.createFolder(`0${index + 1}. ${section.name}`, issue.oSirk.folderID);
                for (const name of Object.entries(model.oSirkFolders)) section.oFolders.push(await google.createFolder(name, section.oID));
                // section.mID = await google.createFolder(`0${index + 1}. ${section.name}`, issue.mSirk.folderID);
                // for (const name of Object.entries(model.mSirkFolders)) section.mFolders.push(await google.createFolder(name, section.mID));
            }

            for (const member of model.members) {
                const sectionFolders = sections.find((section) => member.section.toUpperCase() === section.name);
                for (const folder of sectionFolders.oFolders) await google.createFolder(member.folderName, folder);
                // for (const folder of sectionFolders.mFolders) await google.createFolder(member.folderName, folder);
            }
        }

        res.redirect('/');
    }
}

module.exports = admin;