const express = require('express');
const router = express();

const {authenticate, handleCallback, isAuth, logout} = require('./controller/authenticate.js');
const report = require('./controller/report.js');
const admin = require('./controller/admin.js');

router.get('/', isAuth, report.render);
router.get('/get-time', isAuth, report.time);

router.get('/auth/google', authenticate);
router.get('/auth/google/callback', handleCallback);

router.post('/createisyu', admin.createIsyu);

router.get('/logout', logout);

module.exports = router;