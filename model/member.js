const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    id: {
        type: String, required: true, immutable: true
    },
    name: {
        type: String, required: true, immutable: true
    },
    position: {
        type: String, required: true
    },
    section: {
        type: String, required: true, immutable: true
    },
    email: {
        type: String, required: true, immutable: true
    },
    folderName: String,
    oSirk: Array,
    mSirk: Array,
    exempted: Boolean
});

module.exports = mongoose.model('members', memberSchema);