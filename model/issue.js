const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    oSirk: {
        folderID: {
            type: String, required: true, immutable: true
        },
        startDate: {
            type: String, required: true
        },
        doubleDate: {
            type: String, required: true
        },
        endDate: {
            type: String, required: true
        }
    },
    mSirk: {
        folderID: {
            type: String, required: true, immutable: true
        },
        startDate: {
            type: String, required: true
        },
        doubleDate: {
            type: String, required: true
        },
        endDate: {
            type: String, required: true
        }
    }
});

module.exports = mongoose.model('issues', issueSchema);