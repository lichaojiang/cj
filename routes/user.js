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
router.post('/', cors(bconst.corsOptions), auth(), crud('user', user));

// user info
router.get('/info', cors(bconst.corsOptions), auth(), async (req, res) => {
    let userInfo;
    try {
        userInfo = await user.getUserInfo(req.user.user_id, req.user.organization_id);
    } catch (err) {
        let err_status = bres.findStatus(err);
        console.log(err_status);
        console.log(err.stack);
        return bres.send(res, null, err_status);
    }
    bres.send(res, userInfo);
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
router.get('/success', cors(bconst.corsOptions), async (req, res) => {
    const bcrypt = require('bcrypt');
    let saltRounds = 2;
    try {
        bcrypt.hash(req.user.user_id.toString(), saltRounds, (err, hash) => {
            if (err) 
                return bres.send(res, null, bres.ERROR);
            
            // generate token for frontend
            bres.send(res, {token: hash})
        });
    } catch (err) {
        let err_status = bres.findStatus(err);
        console.log(err_status);
        console.log(err.stack);
        bres.send(res, null, err_status);
    }
})

// login failure
router.get('/failure', cors(bconst.corsOptions), (req, res) => {
    bres.send(res, 'Login failed');
})

passport.serializeUser((user, done) => {
    done(null, user);
}); 
  
passport.deserializeUser((user, done) => {
    done(null, user)
});

module.exports = router;
