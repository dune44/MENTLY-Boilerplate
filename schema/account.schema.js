const bcrypt = require( 'bcryptjs' );
const moment = require( 'moment' );
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    username: {
      required: true,
      type: String,
      unique: true
    },
    password: {
      required: true,
      validate: validatePassword,
      type: String
    },
    email: {
      required: true,
      type: String
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
        type: Date
      },
      updated: {
        default: moment().format( 'YYYY-MM-DD HH' ),
        type: Date
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

accountSchema.pre('save', function( next ) {
  let user = this;
  if ( !user.isModified( 'password' ) ) return next();

  if ( user.isModified( 'username' ) ) user.username = user.username.trim();
  else if ( user.isModified( 'username' ) && !validate.username( user.username ) ) return next();

  if( user.isModified( 'email' ) ) user.email = user.email.trim();
  
  if ( validate.password( this.password ) ) {
    bcrypt.genSalt( 5, ( error, salt ) => {
      if ( error ) return next( error );
      bcrypt.hash(user.password, salt, null, ( e, hash ) => {
        if (e) return next( e );
        else {
          user.password = hash;
          return next();
        }
      });
    });
  }
});


const validate = {
  username: ( value ) => ( value.length > 2 ),
  password: ( value ) => ( value.length > 30 )
};

module.exports = mongoose.model( "account", accountSchema );
