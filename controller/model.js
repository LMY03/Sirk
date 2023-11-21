const Member = require('../model/member');
const Issue = require('../model/issue');

const model = {
    eb: {},
    members: [],
    issues: {},
    issue: {},
    initialize: async function() {
        await setEB();
        this.members = await getMembers();
        // await this.setIsyu();
        setOSirkFolders();
        setMSirkFolders();
    },

    updateMembers: async function() {
        for (const member of this.members) {
            if (!member.position.includes('Senyor') && !member.exempted) {
                const issueName = this.issue.name;
                if (member.oSirk[issueName] || member.mSirk[issueName]) {
                    try {
                        // Construct the update object
                        let updateObj = {};
                        if (member.oSirk[issueName]) updateObj['oSirk.' + issueName] = member.oSirk[issueName];
                        if (member.mSirk[issueName]) updateObj['mSirk.' + issueName] = member.mSirk[issueName];
    
                        await Member.updateOne(
                            { id  : member.id }, 
                            { $set: updateObj }
                        );
                    } catch (error) {
                        console.error("Error updating member:", error);
                    }
                }
            }
        }
    },    

    createIsyu: async function(issue) {
        await Issue.create(issue)
        .then((issue) => {
            console.log('Inserted issues:', issue);
        })
        .catch((error) => {
            console.error('Error inserting issues:', error);
        });
        await this.setIsyu();
    },

    editIsyu: async function(issue) {
        await this.setIsyu();
    },

    deleteIsyu: async function(issueName) {
        Issue.deleteOne( { name: issueName } );
        await this.setIsyu();
    },

    oSirkFolders: {},

    mSirkFolders: {},

    setIsyu: async function() {
        const issues = await Issue.find();

        issues.forEach(issue => {
            model.issues[issue.name] = issue;
        });

        model.issue = issues[issues.length - 1];
    },
}


async function setEB() {
    
    const ebs = await Member.find({ $and: [{ exempted: { $exists: true } }] });

    ebs.forEach(eb => {
        model.eb[eb.email] = eb;
    });
}

async function getMembers() {
    const members =  await Member.find({
        $and: [
            { position: { $not: /Senyor/ } },
            { exempted: { $exists: false } } 
        ]
    });
    members.forEach(member => member.position += " ng " + member.section);

    return members;
}

function setOSirkFolders() {
    const oSirkFolders = [
        { name: "01. PERSONAL SCREENSHOT", pts: 1  },
        { name: "02. IG STORY"           , pts: 1  },
        { name: "03. FB-TWT SHARE"       , pts: 5  },
        { name: "04. INTERACTIVE ISYU"   , pts: 3  },
        { name: "05. REPLY-REACT"        , pts: 2  },
        { name: "06. PROFESSORS"         , pts: 5  },
        { name: "07. APP FB PAGE LIKE"   , pts: 10 },
        { name: "08. APP TWT-IG FOLLOW"  , pts: 10 },
        { name: "09. TELEGRAM"           , pts: 5  },
    ];

    oSirkFolders.forEach(folder => {
        model.oSirkFolders[folder.name] = folder;
    });
}

function setMSirkFolders() {
    const mSirkFolders = [];

    mSirkFolders.forEach(folder => {
        model.mSirkFolders[folder.name] = folder;
    });
}

module.exports = model;