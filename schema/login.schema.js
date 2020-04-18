const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require( 'moment' );

const loginSchema = new Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account"
    },
    ips: [{
        ip:{
            type: String
        },
        forwardIp: {
            type: String
        },
        timestamp: {
            default: moment().format( 'YYYY-MM-DD HH' ),
            type: Date
        }
    }]
});

module.exports = mongoose.model( "login", loginSchema );

