const google = require('./google');
const model = require('./model');
const tool = require('./tool');

const cron = require('node-cron');

let isyu;
let lastUpdateTime = null;

async function initialize() {
    const getPromises = [];
    const oFolderList = await google.getList(model.issue.oSirk.folderID);
    // const mFolderList = await google.getList(model.issue.mSirk.folderID);
  
    oFolderList.forEach(folder => {
        if (folder.name === '01. BALITA') getPromises.push(getSectionList(folder.id, 'Balita'));
        if (folder.name === '02. ISPORTS') getPromises.push(getSectionList(folder.id, 'Isports'));
        if (folder.name === '03. BAYAN') getPromises.push(getSectionList(folder.id, 'Bayan'));
        if (folder.name === '04. BNK') getPromises.push(getSectionList(folder.id, 'BnK'));
        if (folder.name === '05. RETRATO') getPromises.push(getSectionList(folder.id, 'Retrato'));
        if (folder.name === '06. SINING') getPromises.push(getSectionList(folder.id, 'Sining'));
        if (folder.name === '07. IT') getPromises.push(getSectionList(folder.id, 'IT'));
    });
  
    // Wait for all getSectionList promises to resolve
    await Promise.all(getPromises);
    
    console.log('Initialization completed');
}

async function getSectionList(id, section) {
    const list = await google.getList(id);
    for (const folder of list) {
        const oSirkFolder = model.oSirkFolders[folder.name];
        if (oSirkFolder) await count(folder.id, section, oSirkFolder.pts); 
        // for (oSirkFolder of model.oSirkFolders) 
        //     if (oSirkFolder.name === folder.name) await count(folder.id, section, oSirkFolder.pts);
    };
}

async function count(id, section, pts) {
    const list = await google.getList(id);
    for (const member of model.members) {
        if (member.section === section) {
            const folder = list.find(folder => folder.name === member.folderName);
            if (folder) {
                const sirkCount = await computeSirk(folder.id, pts);
                const record = model.members.find(record => record.id === member.id);
                if (record.oSirk[isyu]) record.oSirk[isyu] = record.oSirk[isyu] + sirkCount;
                else record.oSirk[isyu] = sirkCount;
            }
        }
    };
}

async function computeSirk(id, pts) {
    let sirkPts = pts;
    return new Promise(async (resolve, reject) => {
        try {
            let sirk = 0;
            const folder = await google.getList(id);
            folder.forEach((file) => {
                if (file.type.includes('image')) {
                    if (isDoubleSirk(file.modifiedTime)) sirkPts = pts * 2;
                    sirk += sirkPts;
                }
            });
            resolve(sirk); 
        } catch (error) {
            reject(error);
        }
    });
}

function isDoubleSirk(time) {
    const fileTime = new Date(time);
    // const deadline = new Date(model.issue.oSirk.doubleDate);
    const deadline = new Date('2023-11-19T20:00:00.000Z');

    return fileTime <= deadline;
}

async function main() {
    await model.initialize();
    isyu = model.issue.name;
    await initialize();

    oSirkList.length = 0;
    mSirkList.length = 0;
    oSectionReports.length = 0;
    mSectionReports.length = 0;
    
    model.members.forEach(member => {
        if (member.oSirk[isyu]) 
            oSirkList.push({
                id: member.id,
                name: member.name,
                position: member.position,
                section: member.section,
                sirk: member.oSirk[isyu]
            });
        if (member.mSirk[isyu]) 
            mSirkList.push({
                id: member.id,
                name: member.name,
                position: member.position,
                section: member.section,
                sirk: member.sirk[isyu]
        });
    });
    oSirkList.sort((a, b) => parseFloat(b.sirk) - parseFloat(a.sirk));
    mSirkList.sort((a, b) => parseFloat(b.sirk) - parseFloat(a.sirk));
    oSectionReports = generateSectionReports(oSirkList);
    mSectionReports = generateSectionReports(mSirkList);

    model.updateMembers();
}

async function isWithinDateRange() {
    await model.setIsyu();
    
    const currentDate = new Date().toISOString();
    const oSirkStart = model.issue.oSirk.startDate;
    const oSirkEnd = model.issue.oSirk.endDate;
    const mSirkStart = model.issue.mSirk.startDate;
    const mSirkEnd = model.issue.mSirk.endDate;

    return (currentDate >= oSirkStart && currentDate <= oSirkEnd) || (currentDate >= mSirkStart && currentDate <= mSirkEnd);
}

cron.schedule('*/30 * * * *', () => {
    if (isWithinDateRange()) {
        lastUpdateTime = new Date().toLocaleString();
        
        console.log(lastUpdateTime);
        main();
    }
});

const oSirkList = [];
const mSirkList = [];
let oSectionReports = [];
let mSectionReports = [];

const report = {
    render: async function(req, res) {
        const email = req.user.emails[0].value;
        
        res.render('index', {
            issue: model.issue,
            admin: getAdmin(email),
            issues: model.issues,
            lastUpdateTime,
        });
    },

    store: function(req, res) {
        res.json({ 
            oSirkList, 
            mSirkList, 
            oSectionReports, 
            mSectionReports, 
        });
    },

    time: function(req, res) {
        res.json({ 
            time: tool.getTime(), 
            issue: model.issue, 
        });
    },
}

module.exports = report;

function getAdmin(email) {
    const eb = model.eb[email];
    if (eb && (eb.position === 'Punong Patnugot'                            || 
               eb.position === 'Pangalawang Patnugot'                       ||
               eb.position === 'Tagapamahalang Patnugot'                    ||
               eb.position === 'Patnugot ng Impormasyong Panteknolohiya'    ||
               eb.position.includes('Tagapamahala ng Opisina at Sirkulasyon'))) 
        return eb;
}

function generateSectionReports(records) {
    const reports = [
        { section: 'Balita' , sirk: '0' },
        { section: 'Isports', sirk: '0' },
        { section: 'Bayan'  , sirk: '0' },
        { section: 'BNK'    , sirk: '0' },
        { section: 'Retrato', sirk: '0' },
        { section: 'Sining' , sirk: '0' },
        { section: 'IT'     , sirk: '0' },
    ];

    for (const record of records) {
        let report = reports.find((report) => report.section === record.section);
        if (report) report.sirk = parseFloat(report.sirk) + parseFloat(record.sirk);
    }
    return reports;
}