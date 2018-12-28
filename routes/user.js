const express = require('express');
const router = express.Router(); 
const cors = require('cors');
const passport =require('passport');

const bconst = require('../lib/bConstants');
const user = require('../lib/bUser').user;
const crud = require('../lib/bCrudlib');

const auth = require('../lib/bUtils').userAuth;

router.options("/*", cors(bconst.corsOptions)); 

// user route
router.post('/', cors(bconst.corsOptions), auth(), crud({tableName: 'user', tableClass: user}));

// login route
router.post('/login', passport.authenticate('local', {
    successMessage: 'success',
    failureMessage: 'failure'
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
