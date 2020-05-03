const h = require( './helper.controller' );
const accountSchema = require('./../schema/account.schema');
const bcrypt = require( 'bcryptjs' );
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

const methods = {
    Create: {
      account: async account => {
        if( !private.disallowedName( account.username ) ) {
          const data = new accountSchema( account );
          try{
            const r = await data.save();
            return { "success": true, "data": r };
          } catch ( e ) {
            if ( e ) {
              if( e.code === 11000) {
                return { "msg": errMsg.usernameDuplicate, "success": false };
              } else {
                let msg = errMsg.errorMsg;
                if( e && e.errors ) {
                  if ( e.errors ) {
                    if ( e.errors.email ) msg = errMsg.emailInvalid;
                    else if (e.errors.password ) msg = errMsg.passwordTooShort;
                    else if ( e.errors.username ) msg = errMsg.usernameTooShort;
                  } else {
                    // UNHANDLED ERROR.
                    h.log( file + ' => Method.Create.account', e );
                  }
                }
                return { "success": false, "msg": msg, "error": e };
              }
            }
          }
        }else{
          return { "msg": errMsg.accountNotFound, "success": false };
        }
      }
    },
    Read: {
      accountById: ( uid, next ) => {
        try {
          accountSchema.find( { "_id": uid, "deleted": false }, fields, ( e, r ) => {
            if ( e ) {
              h.log( file + ' => error in methods.Read.accountById', e, e.errors );
            } else {
              if ( r && r.length === 1 ) {
                const account = r[0];
                const result = {
                  "_id": account._id.toString(),
                  "blocked": account.blocked,
                  "deleted": account.deleted,
                  "email": account.email,
                  "username": account.username
                };
                next({ "data": result, "success": true });
              } else {
                next({ "msg": errMsg.accountNotFound, "success": false });
              } 
            }
          });
        } catch ( error ) {
          throw new Error( error );
        }
      },
      accountByUsername: ( username, next ) => {
        accountSchema.find( { "username": username, "deleted": false }, fields, ( e, r ) => {
          if ( e ) {
            h.log( file + ' => methods.Read.accountById', e);
            return e;
          } else {
            if( r && r.length === 1 && h.isVal( r[0] ) ) {
              const result = {
                "_id": r[0]._id,
                "blocked": r[0].blocked,
                "deleted": r[0].deleted,
                "email": r[0].email,
                "username": r[0].username
              };
              next({ "success": true, "data": result });
            }
            else next({ "success": false, "msg": errMsg.accountNotFound });
          }
        });
      },
      all: ( next ) => {
        accountSchema.find( { "deleted": false }, fields, ( e, r ) => {
          if ( e ) {
            h.log( file + ' => methods.Read.accountById', e);
            return e;
          } else {
            if( r && r.length > 0 && h.isVal( r[0] ) ) {
              // const result = {
              //   "_id": r[0]._id,
              //   "blocked": r[0].blocked,
              //   "deleted": r[0].deleted,
              //   "email": r[0].email,
              //   "username": r[0].username
              // };
              next({ "success": true, "data": r });
            } else {
              console.log( 'no accounts found' );
              next({ "success": false, "msg": errMsg.accountNotFound });
            }
          }
        });
      },
      passphrase: ( uid, next ) => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`!@#$%^&*-_.';
          let phrase = '';
          for (var i = 0; i < 32; i++) {
            phrase += chars.substr( Math.floor( Math.random() * chars.length ), 1 );
          }
          private.ink( phrase, ( hash, inkMsg ) => {
            if( hash ) {
              accountSchema.updateOne( { "_id": uid, "deleted": false }, { "recovery.phrase": hash }, ( e, r ) => {
                if ( e ) {
                  h.log( file + ' => methods.Update.password', e, next );
                } else {
                  if( r.nModified === 1 ) next( phrase );
                  else next({ "msg": errMsg.updateGenericFail, "success": false });
                }
              });
            } else {
              console.log( inkMsg );
              next({ "msg": inkMsg, "result": false });
            }
          });
      },
      rolesById: ( uid, next)  => {
        accountSchema.findById( uid, 'roles', ( e, r ) => {
          if(e){
            h.log( file + ' => methods.Read.rolesById', e, next );
          }else{
            if( r && h.isVal( r.roles ) ) {
              next({ "data": r.roles, "success": true });
            } else {
              next({ "msg": errMsg.accountNotFound, "success": false });
            } 
          }
        });
      },
      isInRole: ( uid, role, next ) => {
        if( private.roleExists( role ) ) {
          accountSchema.findById( uid, ( e, r ) => {
            if(e){
              h.log( file + ' => methods.Read.accountById', e, next);
            }else{
              if( r ) {
                  const result = r.roles.includes( role );
                  next({ "success": result });
              } else if( !r || r.length === 0 ) {
                  next({ "msg": errMsg.accountNotFound, "success": false });
              } else {
                  next({ "msg": 'Unexpected result', "success": false });
              }
            }
          });
        } else {
          next({ "msg": errMsg.roleInvalid, "success": false });
        }
      },
      validateAccount: ( username, password, ips, twoAToken, next ) => {
        private.getAccountByUsername( username, true, ( account ) => {
          if( account.success ) {
            const twoAResult = ( account.data.twoAuth && account.data.twoAuth.enabled ) ? private.validate2a( account.data.twoAuth.qrUri, twoAToken ) : true;
            if( twoAResult ) {
              private.passwordCompare( password, account.data.password, ( result ) => {
                if( result ){
                  private.updateToken( account.data._id, ips, ( token ) => {
                    // console.log( 'token stored.' );
                    next({ "success": result, "token": token });
                  });
                } else {
                  next({ "msg": errMsg.accountValidationFailure, "success": false });
                }
              });
              
            } else {
              // console.log( 'enable2a ' + account.data.twoAuth.enabled );
              next({ "msg": errMsg.accountValidationFailure, "success": false });
            }
          } else {
            next( account );
          }
        });
      },
      verifyToken: ( token, next ) => {
          jwt.verify( token, process.env.JWT_SECRET, ( e, decoded ) => {
            if( e ) {
              console.log('error in methods.Read.verifyToken');
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
      email: ( uid, email, next ) => {
        if ( email ) {
          if ( !private.validateEmail( email ) ) {
            next({ "msg": errMsg.emailInvalid, "success": false });
          } else {
            accountSchema.updateOne( { "_id": uid, "deleted": false }, { "email": email }, ( e, r ) => {
              if(e){
                console.log('error in methods.Update.email');
                console.log(e);
                next({ "error": e, "msg": errMsg.errorMsg, "success": false });
              }else{
                if( r.nModified === 1 )
                  next({ "success": true });
                else {
                  if( r.nModified === 0 ) next({ "msg": errMsg.accountNotFound, "success": false });
                  else next({ "msg": errMsg.updateGenericFail, "success": false });
                }
              }
            });
          }
        } else {
          next({ "msg": 'Email cannot be blank', "success": false});
        }
      },
      generateQRCode: ( uid, next ) => {
          const secret = speakeasy.generateSecret();
          QRCode.toDataURL(secret.otpauth_url, function(e, data_url) {
            if( e ) {
              h.log( file + ' => methods.Update.generateQRCode', e, next );
            } else{
              private.saveQR( uid, secret.base32, ( result ) => {
                if( result.success ) {
                  next({ "secret": secret, "data_url": data_url, "success": true });
                } else {
                  next( result );
                }
              });
            }
          });
      },
      passphraseProved: ( uid, phrase, next ) => {
        accountSchema.findOne( { "_id": uid, "deleted": false }, ( e, r ) => {
          if ( e ) {
            h.log( file + ' => methods.Update.passphrase reading account.', e, next );
          } else {
            if ( r && r.recovery ) {
              private.passwordCompare( phrase, r.recovery.phrase, ( result ) => {
                if ( result ) {
                  accountSchema.updateOne( { "_id": uid, "deleted": false}, { "recovery.proved": true }, ( e, r ) => {
                    if ( e ) {
                      h.log( file + ' => methods.Update.passphraseProved', e, next );
                    } else {
                      if ( r.nModified === 1 ) {
                        next({ "success": true });
                      } else {
                        if( r.length === 0 ) {
                          next({ "msg": errMsg.accountNotFound, "success": false });
                        } else {
                          next({ "msg": errMsg.updateGenericFail, "success": false });
                        }
                      }
                    }
                  });
                } else {
                  next({ "msg": errMsg.accountValidationFailure, "success": false });
                }
              });
            } else if( !r || r.length === 0 ) {
              next({ "msg": errMsg.accountNotFound, "success": false });
            } else {
              next({ "msg": 'Unexpected result', "success": false });
            }
          }
        });
      },
      password: ( uid, oldPassword, newPassword, next ) => {
        if( private.validatePassword( newPassword ) ) {
          private.getUserById( uid, false, ( account ) => {
            if( account.success ) {
              private.passwordCompare( oldPassword, account.data.password, ( compareResult ) => {
                if( compareResult ) {
                  private.ink( newPassword, ( hash, inkMsg ) => {
                    if ( hash ) {
                      accountSchema.updateOne( { "_id": uid }, { "password": hash }, ( e, r ) => {
                        if(e){
                          h.log( file + ' => methods.Update.password', e, next );
                        }else{
                          if( r.nModified === 1 ) next({ "success": true });
                          else next({ "msg": errMsg.updateGenericFail, "success": false });
                        }
                      });
                    } else {
                      next({ "success": false, "msg": inkMsg });
                    }
                  });
                } else {
                  next({ "msg": errMsg.accountValidationFailure, "success": false });
                }
              });
            } else {
              next( account );
            }
          });
        } else {
          next({ "msg": errMsg.passwordTooShort, "success": false });
        }
      },
      recoverAccount: ( username, recoveryPhrase, next ) => {
          accountSchema.find( { "username": username }, 'recovery', (e, r) => {
            if(e){
              h.log( file +' => private.recoverAccount', e, next );
            }else{
              if( r && r.length === 1 ){
                private.passwordCompare( recoveryPhrase, r[0].recovery.phrase, ( result ) => {
                  if( result ) {
                    private.update2a( r[0]._id, false, ( update2aResult ) => {
                      if( update2aResult.success )
                        next({ "success": true });
                      else
                        next({ "msg": errMsg.recoveryFailed, "success": false });
                    });
                  } else {
                    next({ "msg": errMsg.recoveryFailed, "success": false });
                  }
                });
              } else {
                next({ "msg": errMsg.recoveryFailed, "success": false });
              }
            }
          });
      },
      role: ( uid, role, next ) => {
        if( private.roleExists( role ) ) {
          methods.Read.accountById( uid, ( acct ) => {
            if( acct.success ) {
              if( acct.data.roles ) acct.data.roles.push(role);
              else acct.data.roles = [ role ];
              accountSchema.updateOne( { "_id": uid }, { "roles": acct.data.roles }, ( e, r ) => {
                if ( e ) {
                  h.log( file + " => methods.Update.role", e, next );
                } else {
                  if( r.nModified == 1 ) next({ "success": true });
                  else next({ "msg": 'Not a successful update.', "success": false });
                }
              });
            } else {
               next({ "msg": 'No such user.', "success": false });
            }
          });
        } else {
          next({ "msg": errMsg.roleInvalid, "success": false });
        }
      },
      twoStep: ( uid, token, twoA, next ) => {
        private.getUserById( uid, false, account => {
          if( account.success ){
            if( account.data.recovery.proved ) {
              if( account.data.twoAuth && account.data.twoAuth.enabled && account.data.enabled.enabled != twoA ) {
                private.validate2a( account.data.secret, token, validated => {
                  if( validated ) {
                    private.update2a( uid, twoA, resultObj => {
                      next( resultObj );
                    });
                  } else {
                    next({ "msg": errMsg.accountValidationFailure, "success": false});
                  }
                });
              } else {
                private.update2a( uid, twoA, resultObj => {
                  next( resultObj );
                });
              }
            } else {
              next({ "msg": errMsg.recoveryPhraseNotProved, "success": false });
            }
          } else {
            next({ "msg": errMsg.accountNotFound, "success": false });
          }
        });
      }
    },
    Delete: {
      accountSoftly: ( username, password, ips, twoAToken, next) => {
          methods.Read.validateAccount( username, password, ips, twoAToken, ( result ) => {
            if( result.success ) {
              accountSchema.updateOne( { "username": username }, { "deleted": true }, (e, r ) => {
                if(e){
                  h.log( file + ' => methods.Delete.accountSoftly', e, next );
                }else{
                  if( r && r.nModified === 1 ) next({ "success": true });
                  else next({ "msg": errMsg.updateGenericFail, "success": false });
                }
              });
            } else {
              next( result );
            }
          });
        },
      accountHard: ( uid, password, token, next) => {

            next();

        },
    }
};
// Non Public Methods
pvtFields = '_id _type blocked deleted email username twoAuth.enabled password twoAuth recovery';
const private = {
    duplicateName: ( username, next ) => {
      methods.Read.accountByUsername( username, ( r ) => {
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
    getUserById: ( uid, allowDeleted, next ) => {
      let params = { _id: uid };
      if( !allowDeleted ) params.deleted = false;
      accountSchema.findOne( params, pvtFields, ( e, r ) => {
        if(e){
          h.log( file + ' => private.getUserById', e, next );
        }else{
          if( r && r.recovery ) next({ "data": r, "success": true });
          else if( !r || r.length === 0 ) next({ "msg": errMsg.accountNotFound, "success": false });
          else next({ "msg": errMsg.errorMsg, "success": false });
        }
      });
    },
    getAccountByUsername: ( username, deleted, next ) => {
      let params = { "username": username };
      if( !deleted ) params.deleted = deleted;
      accountSchema.find( params, pvtFields, ( e, r ) => {
        if(e){
          h.log( file + ' => private.getAccountByUsername', e, next );
          next({ "error": e, "msg": errMsg.errorMsg, "success": false });
        }else{
          if( r.length === 1)
            next({ "data": r[0], "success": true });
          else if( r.length === 0 )
            next({ "msg": errMsg.accountNotFound, "success": false });
          else
            next({ "msg": errMsg.errorMsg, "success": false });
        }
      });
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
    isVal: ( value ) => {
        return ( value && value !== null && value !== '' );
    },
    passwordCompare: ( pwd, hash, next ) => {
      bcrypt.compare( pwd, hash, function( e, r ) {
        if( e ) h.log( file + ' => private.passwordCompare', e, next );
        else next( r );
      });
    },
    preValidateModel: ( account ) => {
        let success = true, msg = '';
        if( !private.validateEmail( account.email ) ) {
          success = false;
          msg = errMsg.emailInvalid;
        }
        if( !private.validatePassword( account.password ) ) {
          success = false;
          msg += errMsg.passwordTooShort;
        }
        if( !private.validateUsername( account.username ) ) {
          success = false;
          msg += errMsg.usernameTooShort;
        }
        account._id = uuidv4();
        account._type = 'account';
        account.blocked = false;
        account.deleted = false;
        return ({ success, msg, account });
    },
    roleExists: ( role ) => {
        return roles.includes(role);
    },
    saveQR: ( uid, secret, next ) => {
      accountSchema.updateOne( { "_id": uid, "deleted": false }, { "twoAuth.qrUri": secret }, ( e, r ) => {
        if ( e ){
          h.log( file + ' => private.saveQR', e, next);
        }else{
          if( r.nModified === 1 ) next({ "success": true });
          else next({ "msg": errMsg.updateGenericFail, "success": false });
        }
      });
    },
    update2a: ( uid, twoA, next ) => {
      accountSchema.updateOne( { "_id": uid }, { "twoAuth.enabled": twoA }, ( e, r ) => {
        if ( e ) {
          h.log( file + ' => private.update2a ', e, next );
        } else {
          if( r.nModified === 1 ) next({ "success": true });
          else if ( !r || r.nModified === 0 ) {
            next({ "success": false, "msg": errMsg.accountNotFound });
          } else next({ "msg": 'Not a successful update.', "success": false });
        }
      });
    },
    updateToken: ( uid, ips, next ) => {
        const token = jwt.sign({ _id: uid, ips }, process.env.JWT_SECRET,
          { expiresIn: '7 days' } );
        // Pass back token to be stored by user.
        next( token );
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
    validatePassword: ( password ) => {
        if( password.length < 8 ) return false;
        else return true;

        // TODO add regex here.
    },
    validateUsername: ( username ) => ( username.length >= 3 ),
};
module.exports = methods;
