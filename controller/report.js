const google = require('./google');
const model = require('./model');
const tool = require('./tool');

let isyu;

const sirk = [];

async function initialize() {
    const getPromises = [];
    const oFolderList = await google.getList(model.issue.oSirk.folderID);
    const mFolderList = await google.getList(model.issue.mSirk.folderID);
  
    oFolderList.forEach(folder => {
        if (folder.name === '01. BALITA') getPromises.push(getSectionList(folder.id, 'Balita'));
        if (folder.name === '02. ISPORTS') getPromises.push(getSectionList(folder.id, 'Isports'));
        if (folder.name === '03. BAYAN') getPromises.push(getSectionList(folder.id, 'Bayan'));
        if (folder.name === '04. BNK') getPromises.push(getSectionList(folder.id, 'BnK'));
        if (folder.name === '05. RETRATO') getPromises.push(getSectionList(folder.id, 'Retrato'));
        if (folder.name === '06. SINING') getPromises.push(getSectionList(folder.id, 'Sining'));
        if (folder.name === '07. IT') getPromises.push(getSectionList(folder.id, 'IT'));
    });

    mFolderList.forEach(folder => {

    });
  
    // Wait for all getSectionList promises to resolve
    await Promise.all(getPromises);
    sirk.sort((a, b) => parseFloat(b.sirk[isyu]) - parseFloat(a.sirk[isyu]));
    console.log('Initialization completed');
}

async function main() {
    await model.initialize();
    isyu = model.issue.name;
    await initialize();
}

main();

async function getSectionList(id, section) {
    const list = await google.getList(id);
    for (const folder of list) {
        for (oSirkFolder of model.oSirkFolders) 
            if (oSirkFolder.name === folder.name) await count(folder.id, section, oSirkFolder.pts);
    };
}

async function count(id, section, pts) {
    const list = await google.getList(id);
    for (const member of model.members) {
    // members.forEach(member => {
        if (!member.exempted || member.position.includes('Senyor')) {
            if (member.section === section) {
                const folder = list.find(folder => folder.name === member.folderName);
                if (folder) {
                    const sirkCount = await computeSirk(folder.id, pts);
                    const record = sirk.find(record => record.id === member.id);
                    // if (record) record.sirk[folder.id] = sirkCount;
                    if (record) {
                        if (record.sirk[isyu]) record.sirk = { [isyu]: record.sirk[isyu] + sirkCount };
                    }
                    else 
                        sirk.push({
                            id: member.id,
                            name: member.name,
                            position: member.position,
                            section: member.section,
                            sirk: { [isyu]: sirkCount }
                        });
                }
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
    const deadline = new Date(model.issue.oSirk.doubleDate);
    // const deadline = new Date('2023-11-04T20:00:00.000Z');

    return fileTime <= deadline;
}

const report = {
    render: async function(req, res) {
        const email = req.user.emails[0].value;
        const sectionReports = generateSectionReports(sirk);
        res.render('index', {
            sirkList: sirk,
            isyu: isyu,
            isAdmin: getAdmin(email),
            chartScript: appendChart(sectionReports)
        });
    },

    time: function(req, res) {
        const time = tool.getTime();
        res.json({ time });
    },
}
module.exports = report;

function getAdmin(email) {
    return model.eb.find(eb => eb.email === email                       && (
       !eb.position.includes('Senyor')                                  && 
        eb.position === 'Punong Patnugot'                               || 
        eb.position === 'Pangalawang Patnugot'                          ||
        eb.position === 'Tagapamahalang Patnugot'                       || 
        eb.position === 'Patnugot ng Impormasyong Panteknolohiya'       || 
        eb.position.includes('Tagapamahala ng Opisina at Sirkulasyon'   )));
} 

function appendChart(sectionReports) {
    return `
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function () {
                const data = ${JSON.stringify(sectionReports)};
                const labels = data.map((item) => item.section);
                const values = data.map((item) => item.sirk);

                const ctx = document.getElementById('myChart').getContext('2d');
                const myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Sirk',
                                data: values,
                                backgroundColor: [
                                    '#3C7F72',  // Balita 
                                    '#7A5EA8',  // Isports 
                                    '#242223',  // Bayan
                                    '#DC6874',  // BnK
                                    '#083b73',  // Retrato
                                    '#fad02c',  // Sining
                                    '#f9943b',  // IT
                                ],
                                borderColor: [
                                    '#63B98F',
                                    '#9C80C8',
                                    '#474746',
                                    '#E37E8B',
                                    '#2D6BBF',
                                    '#FEEC61',
                                    '#FFB561',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    },
                });
            });
        </script>
    `;
}

function generateSectionReports(records) {
    const reports = [
        { section: 'Balita',  sirk: '0' },
        { section: 'Isports', sirk: '0' },
        { section: 'Bayan',   sirk: '0' },
        { section: 'BNK',     sirk: '0' },
        { section: 'Retrato', sirk: '0' },
        { section: 'Sining',  sirk: '0' },
        { section: 'IT',      sirk: '0' },
    ];

    for (const record of records) {
        let report = reports.find((report) => report.section === record.section);
        if (report) report.sirk = parseFloat(report.sirk) + parseFloat(record.sirk[isyu]);
    }
    // console.log(reports);
    return reports;
}