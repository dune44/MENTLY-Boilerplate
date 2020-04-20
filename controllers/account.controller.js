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

const accountModel = {
    Create: {
      account: ( account, next ) => {
        if( !accountMethod.disallowedName( account.username ) ) {
          const data = new accountSchema( account );
          try{
            data.save( ( e, r ) => {
              if ( e ) {
                if( e.code === 11000) {
                  next({ "msg": errMsg.usernameDuplicate, "success": false });
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
                    }
                  }
                  next({ "success": false, "msg": msg, "error": e });
                }
              } else {
                next({ "success": true, "data": r });
              }
            });
          } catch ( error ) {
            throw new Error( error );
          }
        }else{
          const msg = 'Username is not allowed.';
          next({ "msg": msg, "success": false });
        }
      }
    },
    Read: {
      accountById: ( uid, next ) => {
        try {
          accountSchema.findById( uid, fields, ( e, r ) => {
            if ( e ) {
              h.log( file + ' => error in accountModel.Read.accountById', e, e.errors );
            } else {
              if ( r ) {
                const result = {
                  "_id": r._id.toString(),
                  "blocked": r.blocked,
                  "deleted": r.deleted,
                  "email": r.email,
                  "username": r.username
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
        accountSchema.find( { "username": username }, fields, ( e, r ) => {
          if ( e ) {
            h.log( file + ' => accountModel.Read.accountById', e);
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
        accountSchema.find( {}, fields, ( e, r ) => {
          if ( e ) {
            h.log( file + ' => accountModel.Read.accountById', e);
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
            phrase += chars.substr( Math.floor(Math.random() * chars.length), 1);
          }
          let q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
          '` SET `recoveryPhrase` = $1 WHERE _type == "account" AND _id == "' +
          uid + '" AND `deleted` == false ');
          accountMethod.ink( phrase, ( hash, inkMsg ) => {
            db.query(q, [hash], function(e, r, m) {
              if(e){
                console.log('error in accountModel.Update.password');
                console.log(e);
                next({ "error": e, "msg": errMsg.errorMsg, "success": false });
              }else{
                if( m.status == 'success' && m.metrics.mutationCount == 1 )
                  next( phrase );
                else
                  next({ "msg": errMsg.updateGenericFail, "success": false });
              }
            });
          });
        },
      rolesById: ( uid, next)  => {
        accountSchema.findById( uid, 'roles', ( e, r ) => {
          if(e){
            h.log( file + ' => accountModel.Read.rolesById', e, next );
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
        if( accountMethod.roleExists( role ) ) {
          accountSchema.findById( uid, ( e, r ) => {
            if(e){
              h.log( file + ' => accountModel.Read.accountById', e, next);
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
        accountMethod.getAccountByUsername( username, true, ( account ) => {
          if( account.success ) {
            const twoAResult = ( account.data.enable2a ) ? accountMethod.validate2a( account.data.secret, twoAToken ) : true;
            if( twoAResult ) {
              accountMethod.passwordCompare( password, account.data.password, ( result ) => {
                if( result ){
                  accountMethod.updateToken( account.data._id, ips, ( token ) => {
                    console.log( 'token stored.' );
                    next({ "success": result, "token": token });
                  });
                } else {
                  next({ "msg": errMsg.accountValidationFailure, "success": false });
                }
              });
              
            } else {
              console.log( 'enable2a ' + account.data.enable2a );
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
      email: ( uid, email, next ) => {
            if( email ) {
                if( !accountMethod.validateEmail( email ) ) {
                    next({ "msg": errMsg.emailInvalid, "success": false });
                } else {
                    const q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
                    '` SET email = "' + email + '" WHERE _type == "account" AND _id == "' +
                    uid + '" AND `deleted` == false ');
                    db.query(q, function(e, r, m) {
                        if(e){
                            console.log('error in accountModel.Update.email');
                            console.log(e);
                            next({ "error": e, "msg": errMsg.errorMsg, "success": false });
                        }else{
                            if( m.status == 'success' && m.metrics.mutationCount == 1 )
                                next({ "success": true });
                            else {
                                if( r.length === 0 ) {
                                    next({ "msg": errMsg.accountNotFound, "success": false });
                                } else {
                                    next({ "msg": errMsg.updateGenericFail, "success": false });
                                }
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
              h.log( file + ' => accountMethod.Update.generateQRCode', e, next );
            } else{
              accountMethod.saveQR( uid, secret.base32, ( result ) => {
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
          const qR = N1qlQuery.fromString('SELECT `recoveryPhrase` FROM `' + process.env.BUCKET +
          '` WHERE _type == "account" AND _id == "' + uid + '" ');
          db.query( qR, ( e, r ) => {
              if(e){
                  console.log('error in accountModel.Update.passphrase reading account.');
                  console.log(e);
                  next({ "msg": e, "success": false});
              }else{
                  if( r.length === 1 ) {
                      accountMethod.passwordCompare( phrase, r[0].recoveryPhrase, ( result ) => {
                        if( result ) {
                          let qU = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
                          '` SET `recoveryPhraseProved` = true WHERE _type == "account" AND _id == "' +
                          uid + '" AND `deleted` == false ');
                          db.query(qU, function(e, r, m) {
                              if(e){
                                  console.log('error in accountModel.Update.passphraseProved');
                                  console.log(e);
                                  next({ "error": e, "msg": errMsg.errorMsg, "success": false });
                              }else{
                                  if( m.status == 'success' && m.metrics.mutationCount === 1 ) {
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
                  } else if( r.length === 0 ) {
                    next({ "msg": errMsg.accountNotFound, "success": false });
                  } else {
                    next({ "msg": 'Unexpected result', "success": false });
                  }
              }
          });
        },
      password: ( uid, oldPassword, newPassword, next ) => {
            if( accountMethod.validatePassword( newPassword ) ) {
                accountMethod.getUserById( uid, false, ( account ) => {
                    if( account.success ) {
                        accountMethod.passwordCompare( oldPassword, account.data.password, ( compareResult ) => {
                            if( compareResult ) {
                                accountMethod.ink( newPassword, ( hash, inkMsg) => {
                                    if( hash ) {
                                        let q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET + '` SET `password` = $1 WHERE _type == "account" AND _id == "' + uid + '" ');
                                        db.query(q, [hash], function(e, r, m) {
                                            if(e){
                                                console.log('error in accountModel.Update.password');
                                                console.log(e);
                                                next({ "error": e, "msg": errMsg.errorMsg, "success": false });
                                            }else{
                                                if( m.status == 'success' && m.metrics.mutationCount == 1 )
                                                    next({ "success": true });
                                                else
                                                    next({ "msg": errMsg.updateGenericFail, "success": false });
                                            }
                                        });
                                    } else {
                                        next({ "msg": inkMsg, "success": false });
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
          const q = N1qlQuery.fromString('SELECT `recoveryPhrase`, `_id` FROM `' + process.env.BUCKET + '` WHERE _type == "account" AND `username` == "' + username + '" ');
          db.query(q, function(e, r) {
            if(e){
              console.log('error in accountMethod.recoverAccount');
              console.log(e);
              next({ "error": e, "msg": errMsg.errorMsg, "success": false });
            }else{
              if( r.length === 1){
                accountMethod.passwordCompare( recoveryPhrase, r[0].recoveryPhrase, ( result ) => {
                  if( result ) {
                    accountMethod.update2a( r[0]._id, false, ( update2aResult ) => {
                      if( update2aResult.result )
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
        if( accountMethod.roleExists( role ) ) {
          accountModel.Read.accountById( uid, ( acct ) => {
            if( acct.success ) {
              if( acct.data.roles ) acct.data.roles.push(role);
              else acct.data.roles = [ role ];
              accountSchema.updateOne( { "_id": uid }, { "roles": acct.data.roles }, ( e, r ) => {
                if ( e ) {
                  h.log( file + " => accountModel.Update.role", e, next );
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
            accountMethod.getUserById( uid, false, ( account ) => {
                if( account.success ){
                    if( account.data.recoveryPhraseProved ) {
                        if( account.data.enable2a != twoA && account.data.enable2a ) {
                          accountMethod.validate2a( account.data.secret, token, ( validated ) => {
                            if( validated ) {
                              accountMethod.update2a( uid, twoA, ( resultObj ) => {
                                next( resultObj );
                              });
                            } else {
                              next({ "msg": errMsg.accountValidationFailure, "success": false});
                            }
                          });
                        } else {
                          accountMethod.update2a( uid, twoA, ( resultObj ) => {
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
          accountModel.Read.validateAccount( username, password, ips, twoAToken, ( result ) => {
            if( result.success ) {
              const qU = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
              '` SET deleted = true WHERE _type == "account" AND `username` == "' + username + '" ');
              db.query(qU, function(e, r, m) {
                if(e){
                  console.log('error in accountModel.Delete.accountSoftly');
                  console.log(e);
                  next({ "error": e, "msg": errMsg.errorMsg, "success": false });
                }else{
                  if( m.status == 'success' && m.metrics.mutationCount === 1 ) {
                    next({ "success": true });
                  } else {
                    next({ "msg": errMsg.updateGenericFail, "success": false });
                  }
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
pvtFields = '_id _type blocked deleted email username enable2a password secret recoveryPhrase recoveryPhraseProved';
const accountMethod = {
    duplicateName: ( username, next ) => {
      accountModel.Read.accountByUsername( username, ( r ) => {
        next( r.success );
      });
    },
    disallowedName: ( username ) => {
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
      accountSchema.find( params, pvtFields, ( e, r ) => {
        if(e){
          h.log( file + ' => accountMethod.getUserById', e, next );
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
      // let query = 'SELECT ' + this.fields + ' FROM `' + process.env.BUCKET + '` WHERE _type == "account" AND _id == "' + uid + '" ';
      // if( !allowDeleted ) query += ' AND `deleted` == false ';
    },
    getAccountByUsername: ( username, deleted, next ) => {
      let params = { "username": username };
      if( !deleted ) params.deleted = deleted;
      accountSchema.find( params, pvtFields, ( e, r ) => {
        if(e){
          h.log( file + ' => accountMethod.getAccountByUsername', e, next );
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
    isVal: ( value ) => {
        return ( value && value !== null && value !== '' );
    },
    passwordCompare: ( pwd, hash, next ) => {
      bcrypt.compare( pwd, hash, function( e, r ) {
        if( e ) {
          console.log(' Error accountMethod passwordCompare');
          console.log( e );
        } else {
          next( r );
        }
      });
    },
    preValidateModel: ( account ) => {
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
    roleExists: ( role ) => {
        return roles.includes(role);
    },
    saveQR: ( uid, secret, next ) => {
      const qU = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET +
      '` SET secret = "' + secret + '" WHERE _type == "account" AND _id == "' + uid + '" AND `deleted` == false ');
      db.query(qU, function(e, r, m) {
          if(e){
              console.log('error in accountMethod.saveQR');
              console.log(e);
              next({ "error": e, "msg": errMsg.errorMsg, "success": false });
          }else{
              if( m.status == 'success' && m.metrics.mutationCount == 1 )
                  next({ "success": true });
              else
                  next({ "msg": errMsg.updateGenericFail, "success": false });
          }
      });
    },
    update2a: ( uid, twoA, next ) => {
        let q = N1qlQuery.fromString('UPDATE `' + process.env.BUCKET + '` SET `enable2a` = ' +
        twoA + ' WHERE _type == "account" AND _id == "' + uid + '" ');
        db.query(q, function(e, r, m) {
            if(e){
                console.log('error in accountModel.accountMethod update2a.');
                console.log(e);
                next({ "error": e, "msg": errMsg.errorMsg, "success": false });
            }else{
                if( m.status === 'success' && m.metrics.mutationCount === 1 )
                    next({ "success": true });
                else
                    next({ "msg": 'Not a successful update.', "success": false });
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
module.exports = accountModel;
