/*
    wire up a simple place to add all of your route files 
    and pass them your app variable from Express.
*/
const h = require( './helper.route' );

module.exports = ( app, h ) => {
    require('./routes/account.router')(app);
};