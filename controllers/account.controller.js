const h = require( './helper.methods' );
const accountSchema = require('./../schema/account.schema');
const bcrypt = require( 'bcrypt' );
const config = process.env;
const jwt = require( 'jsonwebtoken' );
const moment = require( 'moment' );
const speakeasy = require( 'speakeasy' );
const QRCode = require( 'qrcode' );
const roles = require( './../config/roles' );
const validator = require( 'validator' );

const file = "account.controller";

const errMsg = require( './account.errMsg' );
const fields = '_id blocked deleted email username';

// TODO: Add undelete account fn
// TODO: ADD Regex to validatePassword
// TODO: Add bad Login and Recovery Phrase Count
// TODO: Reset password

const accountModel = {
    Create: {
      account: async account => {
        if( !accountMethod.disallowedName( account.username ) ) {
          account.timestamp = h.timestamp;
          const data = new accountSchema( account );
          try{
            const r = await data.save();
                return { "success": true, "data": r };
          } catch ( e ) {
            if ( e ) {
              if( e.code === 11000) {
                return { "msg": errMsg.usernameDuplicate, "success": false };
              } else {
                let msg = 'error occurred.';
                if( e && e.errors ) {
                  if ( e.errors ) {
                    if ( e.errors.email ) msg = errMsg.emailInvalid;
                    else if (e.errors.password ) msg = errMsg.passwordTooShort;
                    else if ( e.errors.username ) msg = errMsg.usernameTooShort;
                  } else {
                    console.log( 'UNHANDLED ERROR.' );
                    console.log( e );
                    return { "success": false };
                  }
                }
                return { "success": false, "msg": msg, "error": e };
              }
            }
          }
        }else{
          const msg = 'Username is not allowed.';
          return { "msg": msg, "success": false };
        }
      }
    },
    Read: {
      accountById: async uid => {
        try {
          const r = await accountSchema.find( { "_id": uid, "deleted": false }, fields );
            if ( r && r.length === 1 ) {
              const account = r[0];
              const result = {
                "_id": account._id.toString(),
                "blocked": account.blocked,
                "deleted": account.deleted,
                "email": account.email,
                "username": account.username
              };
              return { "data": result, "success": true };
            } else {
              return { "msg": errMsg.accountNotFound, "success": false };
            } 
        } catch ( e ) {
          h.log( file + ' => error in accountModel.Read.accountById', e, e.errors );
        }
      },
      accountByUsername: async username => {
        try {
          const r = await accountSchema.find( { "username": username, "deleted": false }, fields );
          if( r && r.length === 1 && h.isVal( r[0] ) ) {
            const result = {
              "_id": r[0]._id,
              "blocked": r[0].blocked,
              "deleted": r[0].deleted,
              "email": r[0].email,
              "username": r[0].username
            };
            return { "success": true, "data": result };
          } else return { "success": false, "msg": errMsg.accountNotFound };
        } catch ( e ) {
          h.log( file + ' => accountModel.Read.accountById', e );
          return e;
        }
      },
      all: async ( ) => {
        try {
          const r = await accountSchema.find( { "deleted": false }, fields );
          if( r && r.length > 0 && h.isVal( r[0] ) ) {
            // const result = {
            //   "_id": r[0]._id,
            //   "blocked": r[0].blocked,
            //   "deleted": r[0].deleted,
            //   "email": r[0].email,
            //   "username": r[0].username
            // };
            return { "success": true, "data": r };
          } else {
            console.log( 'no accounts found' );
            return { "success": false, "msg": errMsg.accountNotFound };
          }
        } catch ( e ) {
          h.log( file + ' => accountModel.Read.accountById', e);
          return e;
        }
      },
      passphrase: async uid => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`!@#$%^&*-_.';
          let phrase = '';
          for (var i = 0; i < 32; i++) {
            phrase += chars.substr( Math.floor( Math.random() * chars.length ), 1 );
          }
          const ink = await accountMethod.ink( phrase ); // ( hash, inkMsg )
            if( ink.hash ) {
              try {
                const r = await accountSchema.updateOne( { "_id": uid, "deleted": false }, { "recovery.phrase": ink.hash } );
                if( r.nModified === 1 ) return phrase;
                else return { "msg": errMsg.updateGenericFail, "success": false };
              } catch ( e ) {
                h.log( file + ' => accountModel.Update.password', e );
              }
            } else {
              console.log( ink.inkMsg );
              return { "msg": ink.inkMsg, "result": false };
            }
      },
      rolesById: async uid  => {
        try {
          const r = await accountSchema.findById( uid, 'roles' );
          if( r && h.isVal( r.roles ) ) {
            return { "data": r.roles, "success": true };
          } else {
            return { "msg": errMsg.accountNotFound, "success": false };
          } 
        } catch ( e ) {
          h.log( file + ' => accountModel.Read.rolesById', e );
        }
      },
      isInRole: async ( uid, role ) => {
        if( accountMethod.roleExists( role ) ) {
          try {
            const r = await accountSchema.findById( uid );
            if( r ) {
              const result = r.roles.includes( role );
              return { "success": result };
            } else if( !r || r.length === 0 ) {
              return { "msg": errMsg.accountNotFound, "success": false };
            } else {
              return { "msg": 'Unexpected result', "success": false };
            }
          } catch ( e ) {
            h.log( file + ' => accountModel.Read.accountById', e, next);
          }
        } else {
          return { "msg": errMsg.roleInvalid, "success": false };
        }
      },
      validateAccount: async ( username, password, ips, twoAToken ) => {
        const account = await accountMethod.getAccountByUsername( username, true );
          if( account.success ) {
            const twoAResult = ( account.data.twoAuth && account.data.twoAuth.enabled ) ? accountMethod.validate2a( account.data.twoAuth.qrUri, twoAToken ) : true;
            if( twoAResult ) {
              const result = await accountMethod.passwordCompare( password, account.data.password );
                if( result ){
                  const token = accountMethod.updateToken( account.data._id, ips );
                    // console.log( 'token stored.' );
                    return { "success": result, "token": token, "user": { "_id": account.data._id, "name": account.data.username } };
                } else {
                  return { "msg": errMsg.accountValidationFailure, "success": false };
                }
            } else {
              // console.log( 'enable2a ' + account.data.twoAuth.enabled );
              return { "msg": errMsg.accountValidationFailure, "success": false };
            }
          } else {
            return account;
          }
      },
      verifyToken: ( token, next ) => {
          jwt.verify( token, config.JWT_SECRET, ( e, decoded ) => {
            if( e ) {
              console.log('error in accountModel.Read.verifyToken');
              console.log( e );
              console.log( );
              console.log( 'token passed: ' + token );
              next({ "error": e, "msg": 'An error occurred', "success": false });
            } else if(moment().unix() > decoded.exp ){
              // time expired.
              next({ "success": false });
            } else {
              // there is time left
              const timeLeft = moment.unix( decoded.exp ).fromNow();
              next({ "success": true, "expiresIn": timeLeft });
            }
          });
      }
    },
    Update: {
      email: async ( uid, email ) => {
        if ( email ) {
          if ( !accountMethod.validateEmail( email ) ) {
            return { "msg": errMsg.emailInvalid, "success": false };
          } else {
            try {
              const r = await accountSchema.updateOne( { "_id": uid, "deleted": false }, { "email": email } );
              if( r.nModified === 1 ) return { "success": true };
            else {
              if( r.nModified === 0 ) return { "msg": errMsg.accountNotFound, "success": false };
              else return { "msg": errMsg.updateGenericFail, "success": false };
            }
            } catch ( e ) {
              h.log( file + ' => methods.Update.email', e );
            }
          }
        } else {
          return { "msg": 'Email cannot be blank', "success": false};
        }
      },
      generateQRCode: async uid => {
          const secret = speakeasy.generateSecret();
          QRCode.toDataURL(secret.otpauth_url, async(e, data_url) => {
            if( e ) {
              h.log( file + ' => accountMethod.Update.generateQRCode', e, next );
            } else{
              const result = await accountMethod.saveQR( uid, secret.base32 );
                if( result.success ) {
                  return { "secret": secret, "data_url": data_url, "success": true };
                } else {
                  return result ;
                }
            }
          });
      },
      passphraseProved: async ( uid, phrase ) => {
        try {
          const r = await accountSchema.findOne( { "_id": uid, "deleted": false } );
          if ( r && r.recovery ) {
            accountMethod.passwordCompare( phrase, r.recovery.phrase, async result => {
              if ( result ) {
                try {
                  const r = await accountSchema.updateOne( { "_id": uid, "deleted": false}, { "recovery.proved": true } );
                  if ( r.nModified === 1 ) {
                    return { "success": true };
                  } else {
                    if( r.length === 0 ) {
                      return { "msg": errMsg.accountNotFound, "success": false };
                    } else {
                      return { "msg": errMsg.updateGenericFail, "success": false };
                    }
                  }
                } catch ( e ) {
                  h.log( file + ' => accountModel.Update.passphraseProved', e, next );
                }
              } else {
                return { "msg": errMsg.accountValidationFailure, "success": false };
              }
            });
          } else if( !r || r.length === 0 ) {
            return { "msg": errMsg.accountNotFound, "success": false };
          } else {
            return { "msg": 'Unexpected result', "success": false };
          }
        } catch ( e ) {
          h.log( file + ' => accountModel.Update.passphrase reading account.', e );
        }
      },
      password: async ( uid, oldPassword, newPassword ) => {
        if( accountMethod.validatePassword( newPassword ) ) {
          const account = await accountMethod.getUserById( uid, false );
            if( account.success ) {
              accountMethod.passwordCompare( oldPassword, account.data.password, async compareResult => {
                if( compareResult ) {
                  const ink = await accountMethod.ink( newPassword ); // ( hash, inkMsg )
                    if ( ink.hash ) {
                      try {
                        const r = await accountSchema.updateOne( { "_id": uid }, { "password": ink.hash } );
                          if( r.nModified === 1 ) return { "success": true };
                          else return { "msg": errMsg.updateGenericFail, "success": false };
                      } catch ( e ) {
                        h.log( file + ' => accountModel.Update.password', e );
                      }
                    } else {
                      return { "success": false, "msg": ink.inkMsg };
                    }
                } else {
                  return { "msg": errMsg.accountValidationFailure, "success": false };
                }
              });
            } else {
              return account;
            }
        } else {
          return { "msg": errMsg.passwordTooShort, "success": false };
        }
      },
      recoverAccount: async ( username, recoveryPhrase ) => {
        try {
          const r = await accountSchema.find( { "username": username }, 'recovery' );
          if( r && r.length === 1 ){
            accountMethod.passwordCompare( recoveryPhrase, r[0].recovery.phrase, async result => {
              if( result ) {
                const update2aResult = await accountMethod.update2a( r[0]._id, false );
                  if( update2aResult.success )
                    return { "success": true };
                  else
                    return { "msg": errMsg.recoveryFailed, "success": false };
              } else {
                return { "msg": errMsg.recoveryFailed, "success": false };
              }
            });
          } else {
            return { "msg": errMsg.recoveryFailed, "success": false };
          }
        } catch ( e ) {
          h.log( file +' => accountMethod.recoverAccount', e, next );
        }
      },
      role: async ( uid, role ) => {
        if( accountMethod.roleExists( role ) ) {
          const acct = await accountModel.Read.accountById( uid );
            if( acct.success ) {
              if( acct.data.roles ) acct.data.roles.push(role);
              else acct.data.roles = [ role ];
              try {
                const r = await accountSchema.updateOne( { "_id": uid }, { "roles": acct.data.roles } );
                  if( r.nModified == 1 ) return { "success": true };
                  else return { "msg": 'Not a successful update.', "success": false };
              } catch ( e ) {
                h.log( file + " => accountModel.Update.role", e );
              }
            } else {
               return { "msg": 'No such user.', "success": false };
            }
        } else {
          return { "msg": errMsg.roleInvalid, "success": false };
        }
      },
      twoStep: async ( uid, token, twoA ) => {
        const account = await accountMethod.getUserById( uid, false );
          if( account.success ){
            if( account.data.recovery.proved ) {
              if( account.data.twoAuth && account.data.twoAuth.enabled && account.data.enabled.enabled != twoA ) {
                accountMethod.validate2a( account.data.secret, token, validated => {
                  if( validated ) {
                    accountMethod.update2a( uid, twoA, resultObj => {
                      next( resultObj );
                    });
                  } else {
                    next({ "msg": errMsg.accountValidationFailure, "success": false});
                  }
                });
              } else {
                accountMethod.update2a( uid, twoA, resultObj => {
                  next( resultObj );
                });
              }
            } else {
              next({ "msg": errMsg.recoveryPhraseNotProved, "success": false });
            }
          } else {
            next({ "msg": errMsg.accountNotFound, "success": false });
          }

      }
    },
    Delete: {
      accountSoftly: async ( username, password, ips, twoAToken ) => {
          const result = await accountModel.Read.validateAccount( username, password, ips, twoAToken );
            if( result.success ) {
              try {
                const r = await accountSchema.updateOne( { "username": username }, { "deleted": true } );
                if( r && r.nModified === 1 ) return { "success": true };
                else return { "msg": errMsg.updateGenericFail, "success": false };
              } catch ( e ) {
                h.log( file + ' => accountModel.Delete.accountSoftly', e );
              }
            } else {
              return result;
            }
      },
      accountHard: async ( uid, password, token ) => {
        try {

        } catch ( e ) {
          h.log( file + ' => methods.Delete.accountHard ', e );
        }
      }
    }
};
// Non Public Methods
pvtFields = '_id _type blocked deleted email username twoAuth.enabled password twoAuth recovery';
const accountMethod = {
    duplicateName: ( username, next ) => {
      accountModel.Read.accountByUsername( username, ( r ) => {
        next( r.success );
      });
    },
    disallowedName: username => {
        const nameList =[
            "admin",
            "administrator",
            "username"
        ];
        return ( nameList.indexOf( username ) > -1 );
    },
    getUserById: async ( uid, allowDeleted ) => {
      let params = { _id: uid };
      if( !allowDeleted ) params.deleted = false;
      try {
        const r = await accountSchema.findOne( params, pvtFields );
          if( r && r.recovery ) return { "data": r, "success": true };
          else if( !r || r.length === 0 ) return { "msg": errMsg.accountNotFound, "success": false };
          else return { "msg": errMsg.errorMsg, "success": false };
      } catch ( e ) {
        h.log( file + ' => accountMethod.getUserById', e );
      }
    },
    getAccountByUsername: async ( username, deleted ) => {
      let params = { "username": username };
      if( !deleted ) params.deleted = deleted;
      try {
        const r = await accountSchema.find( params, pvtFields );
          if( r.length === 1) return { "data": r[0], "success": true };
      else if( r.length === 0 )
        return { "msg": errMsg.accountNotFound, "success": false };
      else
        return { "msg": errMsg.errorMsg, "success": false };
      } catch ( e ) {
        h.log( file + ' => accountMethod.getAccountByUsername', e );
        return { "error": e, "msg": errMsg.errorMsg, "success": false };
      }
    },
    ink: ( password, next ) => {
      bcrypt.genSalt( 5, function( e, salt ) {
          if( e ) {
              console.error( e );
              next( false, e );
          } else {
              bcrypt.hash( password, salt, function( er, hash ) {
                  if( er ) {
                      console.error( er );
                      next( false, er );
                  }else{
                      next( hash, null );
                  }
              });
          }
      });
    },
    isVal: value => {
        return ( value && value !== null && value !== '' );
    },
    passwordCompare: async ( pwd, hash ) => {
      try {
        return await bcrypt.compare( pwd, hash );
      } catch ( e ) {
        h.log( file + ' => accountMethod.passwordCompare', e, next );
      }
    },
    preValidateModel: account => {
        let success = true, msg = '';
        if( !accountMethod.validateEmail( account.email ) ) {
          success = false;
          msg = errMsg.emailInvalid;
        }
        if( !accountMethod.validatePassword( account.password ) ) {
          success = false;
          msg += errMsg.passwordTooShort;
        }
        if( !accountMethod.validateUsername( account.username ) ) {
          success = false;
          msg += errMsg.usernameTooShort;
        }
        account._id = uuidv4();
        account._type = 'account';
        account.blocked = false;
        account.deleted = false;
        return ({ success, msg, account });
    },
    roleExists: role => {
        return roles.includes( role );
    },
    saveQR: async ( uid, secret ) => {
      try {
        const r = await accountSchema.updateOne( { "_id": uid, "deleted": false }, { "twoAuth.qrUri": secret } );
        if( r.nModified === 1 ) return { "success": true };
        else return { "msg": errMsg.updateGenericFail, "success": false };
      } catch ( e ) {
        h.log( file + ' => accountMethod.saveQR', e );
      }
    },
    update2a: async ( uid, twoA ) => {
      try {
        const r = await accountSchema.updateOne( { "_id": uid }, { "twoAuth.enabled": twoA } );
        if ( r.nModified === 1 ) return { "success": true };
        else if ( !r || r.nModified === 0 ) return { "success": false, "msg": errMsg.accountNotFound };
        else return { "msg": 'Not a successful update.', "success": false };
      } catch ( e ) {
        h.log( file + ' => accountModel.accountMethod update2a.', e );
      }
    },
    updateToken: ( uid, ips) => {
        const token = jwt.sign({ _id: uid, ips }, config.JWT_SECRET,
          { expiresIn: '7 days' } );
        // Pass back token to be stored by user.
        return token;
    },
    validate2a: ( secret, token ) => {
        const result = speakeasy.totp.verify({
            "secret": secret,
            "encoding": 'base32',
            "token": token
        });
        return result;
    },
    validateEmail: ( email ) => validator.isEmail( email ),
    validatePassword: password => {
        if( password.length < 8 ) return false;
        else return true;
        // TODO add regex here.
    },
    validateUsername: ( username ) => ( username.length >= 3 ),
};

module.exports = accountModel;
