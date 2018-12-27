const express = require('express');
const router = express.Router(); 
const cors = require('cors');
const passport =require('passport');

const bconst = require('../lib/bConstants');
const buser = require('../lib/bUser');
const bcrud = require('../lib/bCrudlib');
const bauth = require('../lib/bUtils').userAuth;

router.options("/*", cors(bconst.corsOptions)); 

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

// user route
router.post('/', cors(bconst.corsOptions), bauth(), bcrud({tableName: 'user', tableClass: buser}));

// login route
router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/success',
    failureRedirect: '/user/failure'
}));

// logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/apps/bivcloud');
});

// login success
router.get('/success', cors(bconst.corsOptions), (req, res) => {
    res.send('success');
})

// login failure
router.get('/failure', cors(bconst.corsOptions), (req, res) => {
    res.status(401).send('Unauthorized');
})

passport.serializeUser((user_id, done) => {
    done(null, user_id);
}); 
  
passport.deserializeUser((user_id, done) => {
    done(null, user_id);
});

module.exports = router;
