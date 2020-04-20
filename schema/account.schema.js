const bcrypt = require( 'bcryptjs' );
const errMsg = require( './../controllers/account.errMsg' );
const moment = require( 'moment' );
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const legalize = require( 'validator' );

const accountSchema = new Schema({
    username: {
      required: true,
      type: String,
      unique: true,
      validate: {
        validator: v => ( v.length > 3 ),
        message: errMsg.usernameTooShort
      }
    },
    password: {
      required: true,
      type: String,
      validate: {
        validator: v => ( v.length > 3 ),
        message: errMsg.passwordTooShort
      }
    },
    email: {
      required: true,
      type: String,
      validate: {
        validator: v => legalize.isEmail( v ),
        message: errMsg.emailInvalid
    }
    },
    blocked: {
      default: false,
      type: Boolean
    },
    deleted: {
      default: false,
      type: Boolean
    },
    recovery: {
      phrase: String,
      proved: Boolean
    },
    roles: Array,
    secret: String,
    timestamp: {
      origin: {
        default: moment().format( 'YYYY-MM-DD HH' ),
        type: String
      },
      updated: {
        default: moment().format( 'YYYY-MM-DD HH' ),
        type: String 
      }
    },
    twoAuth:{
      enabled: Boolean,
      qrUri: String
    }
});

accountSchema.methods.verifyPassword = function( password, next ) {
  bcrypt.compare( password, this.password, ( e, isMatch) => {
    if (e) return next( e );
    else return next ( null, isMatch );
  });
};

accountSchema.pre( 'save', function( next ) {

  let user = this;

  if ( user.isModified( 'username' ) ) user.username = user.username.trim();
  
  if( user.isModified( 'email' ) ) user.email = user.email.trim().toLowerCase();

  if ( user.isModified( 'password' ) ) {
    private.ink( user.password, ( hash ) => {
      user.password = hash;
      // user.save();
      return next();
    }); 
  } else {
    return next();
  }
});

const private = {
  ink: ( password, next ) => {
    bcrypt.genSalt( 5, ( error, salt ) => {
      if ( error ) {
        console.log( 'error salting' );
        console.log( error );
        next( error );
      } else {
        bcrypt.hash( password, salt, ( e, hash ) => {
          if ( e ) {
            console.log( 'Error saving. ');
            console.log( e );
            next( e );
          } else {
            next( hash );
          }
        });
      }
    });
  }
};

module.exports = mongoose.model( 'account', accountSchema );
