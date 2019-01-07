const express = require('express');
const router = express.Router(); 
const cors = require('cors');
const passport =require('passport');

const bconst = require('../lib/bConstants');
const user = require('../lib/bUser').user;
const crud = require('../lib/bCrudlib');
const bres = require('../lib/bResponse');

const auth = require('../lib/bUtils').userAuth;

router.options("/*", cors(bconst.corsOptions)); 

// user route
router.post('/', cors(bconst.corsOptions), auth(), crud({tableName: 'user', tableClass: user}));

// user info
router.get('/info', cors(bconst.corsOptions), auth(), (req, res) => {
    bres.send(res, req.user);
})

// login route
router.post('/login', cors(bconst.corsOptions), passport.authenticate('local', {
    successRedirect: '/user/success',
    failureRedirect: '/user/failure'
}));

// logout route
router.post('/logout', cors(bconst.corsOptions), (req, res) => {
    req.logout();
    bres.send(res, 'success');
});

// login success
router.get('/success', cors(bconst.corsOptions), (req, res) => {
    const bcrypt = require('bcrypt');
    let saltRounds = 2;
    bcrypt.hash(req.user.email, saltRounds, (err, hash) => {
        if (err) 
            bres.send(res, null, bres.ERROR);
        
        bres.send(res, {token: hash})
    });
})

// login failure
router.get('/failure', cors(bconst.corsOptions), (req, res) => {
    bres.send(res, 'Login failed');
})

passport.serializeUser((user_id, done) => {
    done(null, user_id);
}); 
  
passport.deserializeUser((sessionUser, done) => {
    let userTable = new user('user');
    return userTable.getUserInfo(sessionUser.user_id, (userInfo) => {
        done(null, userInfo);
    }).catch(err => {
        console.log(err);
    });
});

module.exports = router;
