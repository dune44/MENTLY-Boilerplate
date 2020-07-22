const auth = require('../../middleware/auth');
const accountController = require('./../../controllers/account.controller');

const accountRoutes = ( app, h ) => {
    /*
        Account Read
        Will return one users account info.
    */
    app.get('/api/account', (req, res) => {
        res.json({ "msg": 'No information available here.' });
    });

    /*
        Account Creation
        Expects Username, Password and Email
    */
    app.post('/api/account', async (req, res) => {
        const account = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        };
        const r = await accountController.Create.account( account );
        const result = {
            "success": r.success,
            "account": {
                "_id": r.data._id,
                "username": r.data.username,
                "email": r.data.email
            }
        };
        res.status( 201 ).send( result );
    });

    // Auth user updates account here.
    app.put('/api/account', auth, async (req, res) => {
        res.status(400).send('route not written.');
    });

    // Auth user can soft delete account here.
    app.delete('/api/account', auth, async (req, res) => {
        res.status(400).send('route not written.');
    });

    /*
        Login
        Expects username and password.
    */
    app.post('/api/account/login', async (req, res) => {
        const ip = h.getUserIp( req );
        accountController.Read.validateAccount( req.body.username, req.body.password, ip, null, ( result ) => {
            res.json( result );
        });
    });
};

module.exports = accountRoutes;