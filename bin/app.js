const express = require( 'express' );
const helmet = require( 'helmet' );
const rateLimit = require( 'express-rate-limit' );
const bodyParser = require( 'body-parser' );
const mongoose = require( 'mongoose' );

const app = express();
const MongoUri = process.env.MONGO_URL + process.env.DATABASE;
mongoose.connect( MongoUri,  { useNewUrlParser: true, useUnifiedTopology: true } );

app.set( 'x-powered-by',false );
app.use( bodyParser.json() );

app.use( helmet() );

// limit user payload
app.use( express.json({ limit: '10kb' }) );
// Limit user requests per router
const limit = rateLimit({
    max: 100,// max requests
    windowMs: 60 * 60 * 1000, // 1 Hour
    message: 'Too many requests' // message to send
});
app.use( '/', limit ); // Setting limiter on specific route

// Pull in routes
require( './../routes/router' )( app );

module.exports = app;
