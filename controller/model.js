const Member = require('../model/member');
const Issue = require('../model/issue');

const model = {
    eb: [],
    members: [],
    issues: [],
    issue: {},
    initialize: async function() {
        this.eb = await this.getEB();
        this.members = await this.getMembers();
        this.issues = await this.getIsyu();
        this.issue = this.issues[this.issues.length - 1];
    },
    getMembers: async function() {
        const members =  await Member.find({
            $and: [
                { position: { $not: /Senyor/ } },
                { exempted: { $exists: false } } 
            ]
        });
        members.forEach(member => member.position += " ng " + member.section);

        return members;
    },

    getEB: async function() {
        return await Member.find({ $and: [{ exempted: { $exists: true } }] });
    },

    getIsyu: async function() {
        return await Issue.find();
    },

    createIsyu: async function(issue) {
        await Issue.create(issue)
        .then((issue) => {
            console.log('Inserted issues:', issue);
        })
        .catch((error) => {
            console.error('Error inserting issues:', error);
        });
        this.issues = await this.getIsyu();
    },

    oSirkFolders: [
        { name: "01. PERSONAL SCREENSHOT", pts: 1  },
        { name: "02. IG STORY"           , pts: 1  },
        { name: "03. FB-TWT SHARE"       , pts: 5  },
        { name: "04. INTERACTIVE ISYU"   , pts: 3  },
        { name: "05. REPLY-REACT"        , pts: 2  },
        { name: "06. PROFESSORS"         , pts: 5  },
        { name: "07. APP FB PAGE LIKE"   , pts: 10 },
        { name: "08. APP TWT-IG FOLLOW"  , pts: 10 },
        { name: "09. TELEGRAM"           , pts: 5  }
    ],

    mSirkFolders: [],
}



module.exports = model;