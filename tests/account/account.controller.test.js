const accountSchema = require( './../../schema/account.schema' );
const accountModel = require( './../../controllers/account.controller' );
const chai = require( 'chai' );
const mongoose = require('mongoose');
const dirtyChai = require( 'dirty-chai' );
const { authenticator } = require( 'otplib' );
const expect = chai.expect;
const roles = require( './../../config/roles' );
chai.use(dirtyChai);

/* Test Template

  describe( '', () => {

    before( ( done ) => {
      done();
    });

    after( done => done() );

    // Property Exists

    // Property Type

    // Return Value

  });
*/

const errMsg = require('./../../controllers/account.errMsg');
describe( 'Error msg sanity check.', () => {

      // Property Existence
      it( 'errMsg should have property accountNotFound', () => {
        expect( errMsg ).to.have.property( 'accountNotFound' );
      });

      it( 'errMsg should have property emailInvalid', () => {
        expect( errMsg ).to.have.property( 'emailInvalid' );
      });

      it( 'errMsg should have property errorMsg', () => {
        expect( errMsg ).to.have.property( 'errorMsg' );
      });

      it( 'errMsg should have property passwordTooShort', () => {
        expect( errMsg ).to.have.property( 'passwordTooShort' );
      });

      it( 'errMsg should have property roleInvalid', () => {
        expect( errMsg ).to.have.property( 'roleInvalid' );
      });

      it( 'errMsg should have property usernameTooShort', () => {
        expect( errMsg ).to.have.property( 'usernameTooShort' );
      });

      it( 'errMsg should have property updateGenericFail', () => {
        expect( errMsg ).to.have.property( 'updateGenericFail' );
      });

      // Property Type
      it( 'errMsg accountNotFound id should be a string', () => {
        expect( errMsg.accountNotFound ).to.be.a( 'string' );
      });

      it( 'errMsg emailInvalid id should be a string', () => {
        expect( errMsg.emailInvalid ).to.be.a( 'string' );
      });

      it( 'errMsg errorMsg id should be a string', () => {
        expect( errMsg.errorMsg ).to.be.a( 'string' );
      });

      it( 'errMsg passwordTooShort id should be a string', () => {
        expect( errMsg.passwordTooShort ).to.be.a( 'string' );
      });

      it( 'errMsg roleInvalid id should be a string', () => {
        expect( errMsg.roleInvalid ).to.be.a( 'string' );
      });

      it( 'errMsg usernameTooShort id should be a string', () => {
        expect( errMsg.usernameTooShort ).to.be.a( 'string' );
      });

      it( 'errMsg updateGenericFail id should be a string', () => {
        expect( errMsg.updateGenericFail ).to.be.a( 'string' );
      });

});

let newAccount,
  newAccount2,
  testAccountUID,
  testAccount1_2ASecret,
  recoveryPhraseUser1,
  testAccount2UID,
  testAccount2_2ASecret,
  readAccountByUsernameResult,
  newBadPasswordAccount,
  newBadUsernameAccount,
  newBadEmailAccount,
  validationToken;

const username = 'testUser';
const password = '1A2b6O!b';
const passwordUpdated = 'nm%o&z8Afy*m';
const username2 = 'testUser2';
const password2 = 'A!3k90P2';
const badUID = mongoose.Types.ObjectId("5e9cb30627ad170d3dbf4b3d");
const badRole = 'MasterBlasterEatsMitosis';
const fauxIPS = { "ip": "10.0.0.0", "fwdIP": "5.0.0.0" };

const testUserObj = {
  "username": username,
  "password": password,
  "email": "bob@somesite.com",
};
const testUser2Obj = {
  "username": username2,
  "password":"8I3a9B!bc",
  "email": "fred@somesite.com",
};

describe( 'Account Model Create a user account', () => {

  function clearAccounts( next ){
    accountSchema.deleteMany( {}, e => {
      if ( e ) {
        console.log( 'error in deleting test db' );
        console.log( e );
      } else {
        // console.log( 'meta from deleting.' );
        // console.log( m );
        //console.log( 'count from deleting.' );
        //console.log( m.metrics.mutationCount );
        //console.log( 'test db cleared ' );
      }
      //console.log( 'end testing statement.' );
      setTimeout( next, 200 );
    });
  }

  const runDbCalls = async () => {
    try{
      await initializeAccount( async () => {
        await initializeBadPasswordAccount( async () => {
          await initializeBadUsernameAccount( async () => {
            await initializeBadEmailAccount( () => {});
            // next();
            return;
          });  
        });
      });
    } catch ( error ) {
      throw new Error( error );
    }
  };

  const initializeAccount = async next => {
    newAccount = await accountModel.Create.account( testUserObj );
    next();
  };

  const initializeBadPasswordAccount = async next => {
      const testUserObj = {
          "username": "testUser2",
          "password":"1A2",
          "email": "dune44@hotmail.com",
      };
      newBadPasswordAccount = await accountModel.Create.account( testUserObj );
      next();
  };

  const initializeBadUsernameAccount = async next => {
      const testUserObj = {
          "username": "te",
          "password":"2M@iP931p",
          "email": "dune44@hotmail.com",
      };
      newBadUsernameAccount = await accountModel.Create.account( testUserObj );
      next();
  };

  const initializeBadEmailAccount = async next => {
      const testUserObj = {
          "username": "testUser3",
          "password":"2M@iP931p",
          "email": "hotmail.com",
      };
      newBadEmailAccount = await accountModel.Create.account( testUserObj );
      next();
  };

  before( done => {
    clearAccounts( async () => {
      await runDbCalls();
      done();
    });
  });

  after( done => {
    // setTimeout( done, 200);
    done();
  });

  describe( 'Proper Account Creation', () => {

    // Property Existence
    it( 'newAccount should NOT have property msg', () => {
      expect( newAccount ).to.not.have.property( 'msg' );
    });

    it( 'newAccount data should have property email', () => {
      expect( newAccount.data ).to.have.property( 'email' );
    });

    it( 'newAccount should have property password', () => {
      expect( newAccount.data ).to.have.property( 'password' );
    });

    it( 'newAccount should have property success', () => {
      expect( newAccount ).to.have.property( 'success' );
    });

    it( 'newAccount should have property username', () => {
      expect( newAccount.data ).to.have.property( 'username' );
    });

    // Property Type
    it( 'newAccount data should be an Object', () => {
      expect( newAccount.data ).to.be.a( 'Object' );
    });

    it( 'newAccount data email should be a string', () => {
      expect( newAccount.data.email ).to.be.a( 'string' );
    });

    it( 'newAccount data password should be a string', () => {
      expect( newAccount.data.password ).to.be.a( 'string' );
    });

    it( 'newAccount username should be a string', () => {
      expect( newAccount.data.username ).to.be.a( 'string' );
    });

    it( 'newAccount.success should be a boolean', () => {
      expect( newAccount.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'newAccount should have a password longer than 30', () => {
      expect( newAccount.data.password ).to.have.lengthOf.at.least( 30 );
    });

    it( 'newAccount should have a username longer than 3', () => {
      expect( newAccount.data.username ).to.have.lengthOf.at.least( 3 );
    });

    it( 'newAccount.success should have a value of true', () => {
      expect( newAccount.success ).to.equal( true );
    });

  });

  describe( 'Account Created with Bad Password', () => {

    // Property Existence
    it( 'newBadPasswordAccount should contain an error message', () => {
      expect( newBadPasswordAccount ).to.have.property( 'msg' );
    });

    it( 'newBadPasswordAccount should have property success', () => {
      expect( newBadPasswordAccount ).to.have.property( 'success' );
    });

    // Property Type
    it( 'newBadPasswordAccount success should be a boolean', () => {
      expect( newBadPasswordAccount.success ).to.have.be.a( 'boolean' );
    });

    it( 'newBadPasswordAccount msg should be a string', () => {
      expect( newBadPasswordAccount.msg ).to.have.be.a( 'string' );
    });

    // Return Value
    it( 'newBadPasswordAccount should have success of false', () => {
      expect( newBadPasswordAccount.success ).to.equal( false );
    });

  });

  describe( 'Account Creation with Username that is too short.', () => {

    // Property Existence
    it( 'newBadUsernameAccount should contain an error message', () => {
      expect( newBadUsernameAccount ).to.have.property( 'msg' );
    });

    it( 'newBadUsernameAccount  should have property success', () => {
      expect( newBadUsernameAccount ).to.have.property( 'success' );
    });

    // Property Type
    it( 'newBadUsernameAccount success should be a boolean', () => {
      expect( newBadUsernameAccount.success ).to.have.be.a( 'boolean' );
    });

    it( 'newBadUsernameAccount msg should be a string', () => {
      expect( newBadUsernameAccount.msg ).to.have.be.a( 'string' );
    });

    // Return Value
    it( 'newBadUsernameAccount should have success of false', () => {
      expect( newBadUsernameAccount.success ).to.equal( false );
    });

  });

  describe( 'Account Created with a Bad Email', () => {

    // Property Existence
    it( 'newBadEmailAccount should contain an error message', () => {
      expect( newBadEmailAccount ).to.have.property( 'msg' );
    });

    it( 'newBadEmailAccount should have property success', () => {
      expect( newBadEmailAccount ).to.have.property( 'success' );
    });

    // Property Type
    it( 'newBadEmailAccount success should be a boolean', () => {
      expect( newBadEmailAccount.success ).to.have.be.a( 'boolean' );
    });

    it( 'newBadEmailAccount msg should be a string', () => {
      expect( newBadEmailAccount.msg ).to.have.be.a( 'string' );
    });

    // Return Value
    it( 'newBadEmailAccount msg should have value of errMsg.emailInvalid', () => {
      expect( newBadEmailAccount.msg ).to.equal( errMsg.emailInvalid );
    });

    it( 'newBadEmailAccount should have success of false', () => {
      expect( newBadEmailAccount.success ).to.equal( false );
    });

  });

});

describe( 'Account Model Create a duplicate username in account', () => {

  let newBadDuplicateNameAccount;

  const attemptDuplicateUsername = async () => {
    newBadDuplicateNameAccount = await accountModel.Create.account( testUserObj );
    return;
  };

  before( async () => {
    await attemptDuplicateUsername();
    return;
  });

  after( ( done ) => {
    done();
  });

  // Property Existence
  it( 'newBadDuplicateNameAccount should have property success', () => {
    expect(newBadDuplicateNameAccount).to.have.property('success');
  });

  it( 'newBadDuplicateNameAccount should have property msg', () => {
    expect(newBadDuplicateNameAccount).to.have.property('msg');
  });

  // Property Type
  it( 'newBadDuplicateNameAccount success should be a boolean', () => {
    expect( newBadDuplicateNameAccount.success ).to.have.be.a( 'boolean' );
  });

  it( 'newBadDuplicateNameAccount msg should be a string', () => {
    expect( newBadDuplicateNameAccount.msg ).to.have.be.a( 'string' );
  });

  // Return Value
  it( 'newBadDuplicateNameAccount.success should have value of false', () => {
    expect( newBadDuplicateNameAccount.success ).to.equal( false );
  });

});


describe( 'Account Model Create a second user', () => {

  const initializeSecondAccount = async () => {
    const testUserObj2 = {
        "username": username2,
        "password": password2,
        "email": "steve@somesite.com",
    };
    newAccount2 = await accountModel.Create.account( testUserObj2 );
    testAccount2UID = newAccount2.data._id;
    return;
  };

  before( async () => {
    await initializeSecondAccount();
    return;
  });

  after( done => { done(); });

  // Property Existence
  it( 'newAccount2 data should have property email', () => {
    expect( newAccount2.data ).to.have.property( 'email' );
  });

  it( 'newAccount2 should have property password', () => {
    expect( newAccount2.data ).to.have.property( 'password' );
  });

  it( 'newAccount2 should have property success', () => {
   expect( newAccount2 ).to.have.property( 'success' );
  });

  it( 'newAccount2 should have property username', () => {
    expect( newAccount2.data ).to.have.property( 'username' );
  });

  // Property Type
  it( 'newAccount2 data should be an Object', () => {
    expect( newAccount2.data ).to.be.a( 'Object' );
  });

  it( 'newAccount2 data email should be a string', () => {
    expect( newAccount2.data.email ).to.be.a( 'string' );
  });

  it( 'newAccount2 data password should be a string', () => {
    expect( newAccount2.data.password ).to.be.a( 'string' );
  });

  it( 'newAccount2 username should be a string', () => {
    expect(newAccount2.data.username).to.be.a( 'string' );
  });

  it( 'newAccount2.success should be a boolean', () => {
    expect(newAccount2.success).to.be.a( 'boolean' );
  });
  

  // Return Value
  it( 'newAccount2 should have a password longer than 30', () => {
    expect( newAccount2.data.password ).to.have.lengthOf.at.least( 30 );
  });

  it( 'newAccount2 should have a username longer than 3', () => {
    expect( newAccount2.data.username ).to.have.lengthOf.at.least( 3 );
  });

  it( 'newAccount2.success should have a value of true', () => {
    expect( newAccount2.success ).to.equal( true );
  });

});

describe( 'Account Model Read accountByUsername', () => {

  describe( 'Read Account with Good Username', () => {

    const readTestAccountUsername = async () => {
      readAccountByUsernameResult = await accountModel.Read.accountByUsername( username );
      testAccountUID = readAccountByUsernameResult.data._id;
      return;
    };

    before( async () => {
      await readTestAccountUsername();
      return;
    });

    after( ( done ) => {
      done();
    });

    // Property Exists
    it( 'readAccountByUsernameResult.data should NOT contain property password', () => {
      expect( readAccountByUsernameResult.data ).to.not.have.property( 'password' );
    });

    it( 'readAccountByUsernameResult should NOT contain property msg', () => {
      expect(readAccountByUsernameResult).to.not.have.property('msg');
    });


    it( 'readAccountByUsernameResult should contain property data', () => {
      expect( readAccountByUsernameResult ).to.have.property( 'data' );
    });

    it( 'readAccountByUsernameResult.data should contain property _id', () => {
      expect( readAccountByUsernameResult.data ).to.have.property( '_id' );
    });

    it( 'readAccountByUsernameResult.data should contain property blocked', () => {
      expect( readAccountByUsernameResult.data ).to.have.property( 'blocked' );
    });

    it( 'readAccountByUsernameResult.data should contain property deleted', () => {
      expect(readAccountByUsernameResult.data).to.have.property('deleted');
    });

    it( 'readAccountByUsernameResult.data should contain property email', () => {
      expect(readAccountByUsernameResult.data).to.have.property('email');
    });

    it( 'readAccountByUsernameResult.data should contain property username', () => {
      expect(readAccountByUsernameResult.data).to.have.property('username');
    });

    it( 'readAccountByUsernameResult should contain property success', () => {
      expect(readAccountByUsernameResult).to.have.property('success');
    });

    // Property Type
    it( 'readAccountByUsernameResult.data._id should be a string', () => {
      expect( readAccountByUsernameResult.data._id ).to.be.a( 'object' );
    });

    it( 'readAccountByUsernameResult.data.blocked should be a boolean', () => {
      expect( readAccountByUsernameResult.data.blocked ).to.be.a( 'boolean' );
    });

    it( 'readAccountByUsernameResult.data.deleted should be a boolean', () => {
      expect( readAccountByUsernameResult.data.deleted ).to.be.a( 'boolean' );
    });

    it( 'readAccountByUsernameResult email should be a string', () => {
      expect( readAccountByUsernameResult.data.email ).to.be.a( 'string' );
    });

    it( 'readAccountByUsernameResult.data.username should be a string', () => {
      expect( readAccountByUsernameResult.data.username ).to.be.a( 'string' );
    });

    it( 'readAccountByUsernameResult success should be a boolean', () => {
      expect( readAccountByUsernameResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readAccountByUsernameResult.success should have success of true', () => {
      expect( readAccountByUsernameResult.success ).to.equal( true );
    });

  });

  describe( 'Read Account with Bad Username', () => {

    let readBadUsernameAccountResult;
    const badUsername_ReadBadUsernameAccount = 'WillowOfWindsDate';

    const readBadUsernameAccount = async () => {
      readBadUsernameAccountResult = await accountModel.Read.accountByUsername( badUsername_ReadBadUsernameAccount );
      return;
    };

    before( async () => {
      await readBadUsernameAccount();
      return;
    });

    after( ( done ) => {
      done();
    });

    // Property Exists -- ( readBadUsernameAccountResult )
    it( 'readBadUsernameAccountResult should NOT contain property data', () => {
      expect( readBadUsernameAccountResult ).to.not.have.property( 'data' );
    });

    it( 'readBadUsernameAccountResult should NOT contain property error', () => {
      expect( readBadUsernameAccountResult ).to.not.have.property( 'error' );
    });

    it( 'readBadUsernameAccountResult should contain property msg', () => {
      expect(readBadUsernameAccountResult).to.have.property('msg');
    });

    it( 'readBadUsernameAccountResult should contain property success', () => {
      expect(readBadUsernameAccountResult).to.have.property('success');
    });

    // Property Type
    it( 'readBadUsernameAccountResult msg should be a string', () => {
        expect( readBadUsernameAccountResult.msg ).to.be.a( 'string' );
    });

    it( 'readBadUsernameAccountResult success should be a boolean', () => {
        expect( readBadUsernameAccountResult.success ).to.be.a( 'boolean' );
    });

    // Return Value

    it( 'readBadUsernameAccountResult.msg should have result of var accountNotFound', () => {
        expect( readBadUsernameAccountResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'readBadUsernameAccountResult.success should have success of false', () => {
        expect( readBadUsernameAccountResult.success ).to.equal( false );
    });

  });

});

describe( 'Account Model Read accountById', () => {

  describe( 'Read Account with Good UID.', () => {

    let readAccountByIDResult;

    const readTestAccountByUID = async () => {
      readAccountByIDResult = await accountModel.Read.accountById( testAccountUID );
      return;
    };

      before( async () => {
        await readTestAccountByUID();
        return;
      });

      after( done => done() );

      // Property Exists
      it('readAccountByIDResult should NOT return property data.password', () => {
        expect(readAccountByIDResult.data).to.not.have.property('password');
      });

      it('readAccountByIDResult should NOT return property msg', () => {
        expect(readAccountByIDResult).to.not.have.property('msg');
      });


      it('readAccountByIDResult should return property data', () => {
          expect(readAccountByIDResult).to.have.property('data');
      });

      it('readAccountByIDResult.data should return property _id', () => {
          expect(readAccountByIDResult.data).to.have.property('_id');
      });

      it('readAccountByIDResult.data should return property blocked', () => {
          expect(readAccountByIDResult.data).to.have.property('blocked');
      });

      it('readAccountByIDResult.data should return property deleted', () => {
          expect(readAccountByIDResult.data).to.have.property('deleted');
      });

      it('readAccountByIDResult.data should return property email', () => {
          expect(readAccountByIDResult.data).to.have.property('email');
      });

      it('readAccountByIDResult.data should return property username', () => {
          expect(readAccountByIDResult.data).to.have.property('username');
      });

      it('readAccountByIDResult should return property success', () => {
          expect(readAccountByIDResult).to.have.property('success');
      });

      // Property Type
      it( 'readAccountByIDResult data id should be a string', () => {
          expect( readAccountByIDResult.data._id ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data blocked should be a boolean', () => {
          expect( readAccountByIDResult.data.blocked ).to.be.a( 'boolean' );
      });

      it( 'readAccountByIDResult data deleted should be a boolean', () => {
          expect( readAccountByIDResult.data.deleted ).to.be.a( 'boolean' );
      });

      it( 'readAccountByIDResult data email should be a string', () => {
          expect( readAccountByIDResult.data.email ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data username should be a string', () => {
          expect( readAccountByIDResult.data.username ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult success should be a boolean', () => {
          expect( readAccountByIDResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'readAccountByIDResult success should have result of true', () => {
          expect( readAccountByIDResult.success ).to.equal( true );
      });

  });

  describe( 'Read Account with Bad UID', () => {

    let readBadUIDAccountResult;

    const badUID_readAccountByID = async () => {
      readBadUIDAccountResult = await accountModel.Read.accountById( badUID );
      return;
    };

    before( async () => {
      await badUID_readAccountByID();
      return;
    });

    after( done => done() );

    // Property Exists
    it( 'readBadUIDAccountResult should NOT contain property data', () => {
      expect( readBadUIDAccountResult ).to.not.have.property( 'data' );
    });

    it( 'readBadUIDAccountResult should contain property msg', () => {
      expect( readBadUIDAccountResult ).to.have.property( 'msg' );
    });

    it( 'readBadUIDAccountResult should contain property success', () => {
      expect( readBadUIDAccountResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'readBadUIDAccountResult msg id should be a string', () => {
        expect( readBadUIDAccountResult.msg ).to.be.a( 'string' );
    });

    it( 'readBadUIDAccountResult success id should be a boolean', () => {
        expect( readBadUIDAccountResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readBadUIDAccountResult msg should have value of var errMsg.accountNotFound', () => {
        expect( readBadUIDAccountResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'readBadUIDAccountResult success should have value of false', () => {
        expect( readBadUIDAccountResult.success ).to.equal( false );
    });

  });

});
/*

describe( 'Account Model Read All', () => {

  let readAllResult;

  const readAllAccounts = next => {
      accountModel.Read.all( ( result ) => {
        readAllResult = result;
        next();
      });
  };

  before( ( done ) => {
    readAllAccounts( done );
  });

  after( done => done() );

  // Property Exists
  it( 'readAllResult.data should NOT have property password', () => {
    expect( readAllResult.data ).to.have.not.property( 'password' );
  });

  it( 'readAllResult should NOT have property msg', () => {
    expect( readAllResult ).to.have.not.property( 'msg' );
  });

  it('readAllResult should have property data', () => {
      expect( readAllResult ).to.have.property( 'data' );
  });

  it('readAllResult should have property success', () => {
      expect( readAllResult ).to.have.property( 'success' );
  });

  // Property Type
  it( 'readAllResult data should be an Array', () => {
      expect( readAllResult.data ).to.be.a( 'array' );
  });

  // Return Value
  it( 'readAllResult.data should be have length of 2', () => {
    expect( readAllResult.data.length ).to.equal( 2 );
  });

  it( 'readAllResult success should be an true', () => {
    expect( readAllResult.success ).to.equal( true );
  });

});

describe( 'Account Model Read Validate Credentials', () => {

  describe( 'Test Bad Username', () => {

    let badUsernameLoginResult;

    const attemptBadUidLogin = next => {
      const passwordForBadLogin = "85Ie!ki49p";
      accountModel.Read.validateAccount( 'badUsername', passwordForBadLogin, fauxIPS, null, ( result ) => {
        badUsernameLoginResult = result;
        next();
      });
    };

    before( done => {
      attemptBadUidLogin( done );
    });

    after( done => done() );

    // Property Existence -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult should NOT have property data', () => {
      expect( badUsernameLoginResult ).to.not.have.property( 'data' );
    });

    it( 'badUsernameLoginResult should NOT have property token', () => {
      expect( badUsernameLoginResult ).to.not.have.property( 'token' );
    });

    it( 'badUsernameLoginResult should have property success', () => {
      expect( badUsernameLoginResult ).to.have.property( 'success' );
    });

    it( 'badUsernameLoginResult should have property msg', () => {
      expect( badUsernameLoginResult ).to.have.property( 'msg' );
    });

    // Property Type -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult.success should be a boolean', () => {
      expect( badUsernameLoginResult.success ).to.be.a( 'boolean' );
    });

    it( 'badUsernameLoginResult msg should be a string', () => {
      expect( badUsernameLoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult.success should have value of false', () => {
      expect( badUsernameLoginResult.success ).to.equal( false );
    });

    it( 'badUsernameLoginResult msg should have value of errMsg.accountNotFound', () => {
      expect( badUsernameLoginResult.msg ).to.equal( errMsg.accountNotFound );
    });

  });

  describe( 'Test Bad Password', () => {

    let badPasswordLoginResult;

    const attemptBadPasswordLogin = next => {
      const BadPassword = "2M@55iP931p";
      accountModel.Read.validateAccount( username, BadPassword, fauxIPS, null, ( result ) => {
        badPasswordLoginResult = result;
        next();
      });
    };

    before( ( done ) => {
        attemptBadPasswordLogin( done );
    });

    after( done => done() );

    // Property Existence -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult should NOT have property data', () => {
      expect( badPasswordLoginResult ).to.not.have.property( 'data' );
    });

    it( 'badPasswordLoginResult should NOT have property token', () => {
      expect( badPasswordLoginResult ).to.not.have.property( 'token' );
    });

    it( 'badPasswordLoginResult should have property success', () => {
      expect( badPasswordLoginResult ).to.have.property( 'success' );
    });

    it( 'badPasswordLoginResult should have property msg', () => {
      expect( badPasswordLoginResult ).to.have.property( 'msg' );
    });

    // Property Type -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult.success should be a boolean', () => {
      expect( badPasswordLoginResult.success ).to.be.a( 'boolean' );
    });

    it( 'badPasswordLoginResult msg should be a string', () => {
      expect( badPasswordLoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult.success should have value of false', () => {
      expect( badPasswordLoginResult.success ).to.equal( false );
    });

    it( 'badPasswordLoginResult msg should have value of var accountValidationFailure', () => {
      expect( badPasswordLoginResult.msg ).to.equal( errMsg.accountValidationFailure );
    });

  });

  describe( 'Test good login', () => {

    let  goodLoggingResult;

    const attemptGoodLogin = next => {
      accountModel.Read.validateAccount( username, password, fauxIPS, null, ( result ) => {
        validationToken = result.token;
        goodLoggingResult = result;
        next();
      });
    };

    before( ( done ) => {
      attemptGoodLogin( done );
    });

    after( done => done() );

    // Property Existence -- ( goodLoggingResult )
    it( 'goodLoggingResult should NOT have property data', () => {
      expect( goodLoggingResult ).to.not.have.property( 'data' );
    });

    it( 'goodLoggingResult should NOT have property msg', () => {
      expect( goodLoggingResult ).to.not.have.property( 'msg' );
    });

    it( 'goodLoggingResult should have property success', () => {
      expect( goodLoggingResult ).to.have.property( 'success' );
    });

    it( 'goodLoggingResult should have property token', () => {
      expect( goodLoggingResult ).to.have.property( 'token' );
    });

    // Property Type -- ( goodLoggingResult )
    it( 'goodLoggingResult.success should be a boolean', () => {
      expect( goodLoggingResult.success ).to.be.a( 'boolean' );
    });

    it( 'goodLoggingResult token should be a string', () => {
      expect( goodLoggingResult.token ).to.be.a( 'string' );
    });

    // Return Value -- ( goodLoggingResult )
    it( 'goodLoggingResult.success should have value of true', () => {
      expect( goodLoggingResult.success ).to.equal( true );
    });

  });

});

describe( 'Account Model Read Token Operations', () => {

  let decodedToken;
  const expiresInDefault = 'in 7 days';

  function getTokenDecode( next ) {
    accountModel.Read.verifyToken( validationToken, ( token ) => {
      decodedToken = token;
      //console.log( token );
      next();
    });
  }

  describe( ' Validating a good token. ', () => {

    before( ( done ) => {
      getTokenDecode( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Existence -- ( decodedToken )
    it( 'decodedToken should NOT have property error', () => {
        expect( decodedToken ).to.not.have.property( 'error' );
    });

    it( 'decodedToken should NOT have property msg', () => {
        expect( decodedToken ).to.not.have.property( 'msg' );
    });

    it( 'decodedToken should have property success', () => {
        expect( decodedToken ).to.have.property( 'success' );
    });

    it( 'decodedToken should have property expiresIn', () => {
        expect( decodedToken ).to.have.property( 'expiresIn' );
    });


    // Property Type -- ( decodedToken )
    it( 'decodedToken should be an Object', () => {
      expect( decodedToken ).to.be.a( 'Object' );
    });

    it( 'decodedToken expiresIn should be a String', () => {
      expect( decodedToken.expiresIn ).to.be.a( 'string' );
    });

    it( 'decodedToken.success should be a boolean', () => {
      expect( decodedToken.success ).to.be.a( 'boolean' );
    });

    // Return Value -- ( decodedToken )
    it( 'decodedToken success should have value of true', () => {
        expect( decodedToken.success ).to.equal( true );
    });

    it( 'decodedToken expiresIn should have value equal to var expiresInDefault: '+ expiresInDefault, () => {
        expect( decodedToken.expiresIn ).to.equal( expiresInDefault );
    });

  });


});

describe( 'Account Model Update role', () => {

  describe( 'Add Good Role to Good Account', () => {
    let update_GoodRole_GoodUser_Result;

    const updateRole = next => {
      accountModel.Update.role( testAccountUID, roles[0], ( result ) => {
        update_GoodRole_GoodUser_Result = result;
        next();
      });
    };

    before( done => {
      updateRole( done );
    });

    after( done => done() );

    // Property Exists
    it( 'update_GoodRole_GoodUser_Result should NOT have property error', () => {
      expect( update_GoodRole_GoodUser_Result ).to.not.have.property( 'error' );
    });

    it( 'update_GoodRole_GoodUser_Result should NOT have property msg', () => {
      expect( update_GoodRole_GoodUser_Result ).to.not.have.property( 'msg' );
    });

    it( 'update_GoodRole_GoodUser_Result should have property success', () => {
      expect( update_GoodRole_GoodUser_Result ).to.have.property( 'success' );
    });

    // Property Type
    it( 'update_GoodRole_GoodUser_Result should be an Object', () => {
      expect( update_GoodRole_GoodUser_Result ).to.be.a( 'Object' );
    });

    it( 'update_GoodRole_GoodUser_Result success should be a boolean', () => {
      expect( update_GoodRole_GoodUser_Result.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_GoodRole_GoodUser_Result success should have value of true', () => {
      expect( update_GoodRole_GoodUser_Result.success ).to.equal( true );
    });

  });

  describe( 'Add Bad Role to Good Account', () => {
    let update_BadRole_GoodUser_Result;
    const badRoleMSG = 'No such role.';

    const updateRole = next => {
      accountModel.Update.role( testAccountUID, badRole, result => {
        update_BadRole_GoodUser_Result = result;
        next();
      });
    };

    before( done => {
      updateRole( done );
    });

    after( done => done() );

    // Property Exists
    it( 'update_BadRole_GoodUser_Result should NOT have property error', () => {
      expect( update_BadRole_GoodUser_Result ).to.not.have.property( 'error' );
    });

    it( 'update_BadRole_GoodUser_Result should have property msg', () => {
      expect( update_BadRole_GoodUser_Result ).to.have.property( 'msg' );
    });

    it( 'update_BadRole_GoodUser_Result should have property success', () => {
      expect( update_BadRole_GoodUser_Result ).to.have.property( 'success' );
    });

    // Property Type
    it( 'update_BadRole_GoodUser_Result should be an Object', () => {
      expect( update_BadRole_GoodUser_Result ).to.be.a( 'Object' );
    });

    it( 'update_BadRole_GoodUser_Result msg should be a string', () => {
      expect( update_BadRole_GoodUser_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_BadRole_GoodUser_Result.success should be a boolean', () => {
      expect( update_BadRole_GoodUser_Result.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_BadRole_GoodUser_Result msg should have value of var badRoleMSG', () => {
      expect( update_BadRole_GoodUser_Result.msg ).to.equal( badRoleMSG );
    });

    it( 'update_BadRole_GoodUser_Result.success should have value of false', () => {
      expect( update_BadRole_GoodUser_Result.success ).to.equal( false );
    });

  });

  describe( 'Add Good Role to Bad Account', () => {
    let update_GoodRole_BadUser_Result;

    const updateRole = next => {
      accountModel.Update.role( badUID, roles[0], result => {
        update_GoodRole_BadUser_Result = result;
        next();
      });
    };

    before( done => {
      updateRole( done );
    });

    after( done => done() );

    // Property Exists
    it( 'update_GoodRole_BadUser_Result should NOT have property error', () => {
      expect( update_GoodRole_BadUser_Result ).to.not.have.property( 'error' );
    });

    it( 'update_GoodRole_BadUser_Result should have property msg', () => {
      expect( update_GoodRole_BadUser_Result ).to.have.property( 'msg' );
    });

    it( 'update_GoodRole_BadUser_Result should have property success', () => {
      expect( update_GoodRole_BadUser_Result ).to.have.property( 'success' );
    });

    // Property Type
    it( 'update_GoodRole_BadUser_Result should be an Object', () => {
      expect( update_GoodRole_BadUser_Result ).to.be.a( 'Object' );
    });

    it( 'update_GoodRole_BadUser_Result msg should be a string', () => {
      expect( update_GoodRole_BadUser_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_GoodRole_BadUser_Result.success should be a boolean', () => {
      expect( update_GoodRole_BadUser_Result.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_GoodRole_BadUser_Result.success should have value of false', () => {
      expect( update_GoodRole_BadUser_Result.success ).to.equal( false );
    });
  });

});

describe( 'Account Model Read rolesById', () => {

  describe( 'Read populated Roles with Good UID', () => {
    let read_pop_RolesResult;

    const read_pop_RolesByID = ( next ) => {
      accountModel.Read.rolesById( testAccountUID, ( result ) => {
        read_pop_RolesResult = result;
        next();
      });
    };

    before( done => {
      read_pop_RolesByID( done );
    });

    after( done => done() );

    // Property Exists
    it( 'read_pop_RolesResult should NOT have property error', () => {
      expect( read_pop_RolesResult ).to.not.have.property( 'error' );
    });

    it( 'read_pop_RolesResult should NOT have property msg', () => {
      expect( read_pop_RolesResult ).to.not.have.property( 'msg' );
    });

    it( 'read_pop_RolesResult should have property success', () => {
      expect( read_pop_RolesResult ).to.have.property( 'success' );
    });

    it( 'read_pop_RolesResult should have property data', () => {
      expect( read_pop_RolesResult ).to.have.property( 'data' );
    });

    // Property Type
    it( 'read_pop_RolesResult should be an Object', () => {
      expect( read_pop_RolesResult ).to.be.a( 'Object' );
    });

    it( 'read_pop_RolesResult data should be an array', () => {
      expect( read_pop_RolesResult.data ).to.be.a( 'array' );
    });

    it( 'read_pop_RolesResult.success should be a boolean', () => {
      expect( read_pop_RolesResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'read_pop_RolesResult.success should have of true', () => {
      expect( read_pop_RolesResult.success ).to.equal( true );
    });

  });

  describe( 'Read empty Roles with Good UID', () => {
    let read_empty_RolesResult;

    const read_empty_RolesByID = next => {
      accountModel.Read.rolesById( testAccount2UID, result => {
        read_empty_RolesResult = result;
        next();
      });
    };

    before( done => {
      read_empty_RolesByID( done );
    });

    after( done => done() );

    // Property Exists
    it( 'read_empty_RolesResult should NOT have property error', () => {
        expect( read_empty_RolesResult ).to.not.have.property( 'error' );
    });

    it( 'read_empty_RolesResult should NOT have property msg', () => {
        expect( read_empty_RolesResult ).to.not.have.property( 'msg' );
    });

    it( 'read_empty_RolesResult should have property success', () => {
        expect( read_empty_RolesResult ).to.have.property( 'success' );
    });

    it( 'read_empty_RolesResult should have property data', () => {
        expect( read_empty_RolesResult ).to.have.property( 'data' );
    });

    // Property Type
    it( 'read_empty_RolesResult should be an Object', () => {
      expect( read_empty_RolesResult ).to.be.a( 'Object' );
    });

    it( 'read_empty_RolesResult data should be a array', () => {
        expect( read_empty_RolesResult.data ).to.be.a( 'array' );
    });

    it( 'read_empty_RolesResult.success should be a boolean', () => {
      expect( read_empty_RolesResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'read_empty_RolesResult.success should have of true', () => {
        expect( read_empty_RolesResult.success ).to.equal( true );
    });

  });

  describe( 'Read Roles with Bad UID', () => {
    let read_bad_RolesResult;

    const readRolesByID = next => {
      accountModel.Read.rolesById( badUID, result => {
        read_bad_RolesResult = result;
        next();
      });
    };

    before( done => readRolesByID( done ) );

    after( done => done() );

    // Property Exists
    it( 'read_bad_RolesResult should NOT have property data', () => {
      expect( read_bad_RolesResult ).to.not.have.property( 'data' );
    });

    it( 'read_bad_RolesResult should NOT have property error', () => {
        expect( read_bad_RolesResult ).to.not.have.property( 'error' );
    });

    it( 'read_bad_RolesResult should have property msg', () => {
        expect( read_bad_RolesResult ).to.have.property( 'msg' );
    });

    it( 'read_bad_RolesResult should have property success', () => {
        expect( read_bad_RolesResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'read_bad_RolesResult should be an Object', () => {
      expect( read_bad_RolesResult ).to.be.a( 'Object' );
    });

    it( 'read_bad_RolesResult msg should be a string', () => {
      expect( read_bad_RolesResult.msg ).to.be.a( 'string' );
    });

    it( 'read_bad_RolesResult.success should be a boolean', () => {
      expect( read_bad_RolesResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'read_bad_RolesResult.success should have value of false', () => {
        expect( read_bad_RolesResult.success ).to.equal( false );
    });

  });

});

describe( 'Account Model Read isInRole', () => {

  describe( 'Read empty isInRole with Good UID and Wrong Role', () => {

    let empty_isInRoleResult;

    const get_empty_IsInRole = next => {
      accountModel.Read.isInRole( testAccount2UID, roles[0], result => {
        empty_isInRoleResult = result;
        next();
      });
    };

    before( done => get_empty_IsInRole( done ) );

    after( done => done() );

    // Property Exists
    it( 'empty_isInRoleResult should NOT have property error', () => {
      expect( empty_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'empty_isInRoleResult should NOT have property msg', () => {
      expect( empty_isInRoleResult ).to.not.have.property( 'msg' );
    });

    it( 'empty_isInRoleResult should have property success', () => {
      expect( empty_isInRoleResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'empty_isInRoleResult should be an Object', () => {
      expect( empty_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'empty_isInRoleResult.success should be a boolean', () => {
      expect( empty_isInRoleResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
     it( 'empty_isInRoleResult.success should have value of false', () => {
      expect( empty_isInRoleResult.success ).to.equal( false );
    });

});

  describe( 'Read populated isInRole with Good UID and Good Role', () => {
    let populated_isInRoleResult;

    const get_populated_IsInRole = next => {
      accountModel.Read.isInRole( testAccountUID, roles[0], result => {
        populated_isInRoleResult = result;
        next();
      });
    };

    before( done => {
      get_populated_IsInRole( done );
    });

    after( done => done() );

    // Property Exists
    it( 'populated_isInRoleResult should NOT have property error', () => {
      expect( populated_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'populated_isInRoleResult should NOT have property msg', () => {
      expect( populated_isInRoleResult ).to.not.have.property( 'msg' );
    });

    it( 'populated_isInRoleResult should have property success', () => {
      expect( populated_isInRoleResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'populated_isInRoleResult should be an Object', () => {
      expect( populated_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'populated_isInRoleResult.success should be a boolean', () => {
      expect( populated_isInRoleResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'populated_isInRoleResult.success should have value of true', () => {
      expect( populated_isInRoleResult.success ).to.equal( true );
    });

  });

  describe( 'Read isInRole with Bad UID', () => {

    let bad_isInRoleResult;
    const get_bad_IsInRole = next => {
      accountModel.Read.isInRole( badUID, roles[0], result => {
        bad_isInRoleResult = result;
        next();
      });
    };

    before( done => {
      get_bad_IsInRole( done );
    });

    after( done => done() );

    // Property Exists
    it( 'bad_isInRoleResult should NOT have property error', () => {
      expect( bad_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'bad_isInRoleResult should have property msg', () => {
      expect( bad_isInRoleResult ).to.have.property( 'msg' );
    });

    it( 'bad_isInRoleResult should have property success', () => {
      expect( bad_isInRoleResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'bad_isInRoleResult should be an Object', () => {
      expect( bad_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'bad_isInRoleResult msg should be a string', () => {
      expect( bad_isInRoleResult.msg ).to.be.a( 'string' );
    });

    it( 'bad_isInRoleResult.success should be a string', () => {
      expect( bad_isInRoleResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'bad_isInRoleResult msg should have value var errMsg.accountNotFound', () => {
      expect( bad_isInRoleResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'bad_isInRoleResult.success should have value of false', () => {
        expect( bad_isInRoleResult.success ).to.equal( false );
    });

  });

  describe( 'Read empty isInRole with Good UID and Bad Role', () => {

    let empty_badRole_isInRoleResult;

    const get_empty_IsInRole = next => {
      accountModel.Read.isInRole( testAccount2UID, badRole, result => {
        empty_badRole_isInRoleResult = result;
        next();
      });
    };

    before( done => {
      get_empty_IsInRole( done );
    });

    after( done => done() );

    // Property Exists
    it( 'empty_badRole_isInRoleResult should NOT have property error', () => {
      expect( empty_badRole_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'empty_badRole_isInRoleResult should have property msg', () => {
      expect( empty_badRole_isInRoleResult ).to.have.property( 'msg' );
    });

    it( 'empty_badRole_isInRoleResult should have property success', () => {
      expect( empty_badRole_isInRoleResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'empty_badRole_isInRoleResult should be an Object', () => {
      expect( empty_badRole_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'empty_badRole_isInRoleResult msg should be a string', () => {
      expect( empty_badRole_isInRoleResult.msg ).to.be.a( 'string' );
    });

    it( 'empty_badRole_isInRoleResult.success should be a boolean', () => {
      expect( empty_badRole_isInRoleResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
     it( 'empty_badRole_isInRoleResult msg should have value of errMsg.roleInvalid', () => {
      expect( empty_badRole_isInRoleResult.msg ).to.equal( errMsg.roleInvalid );
    });

    it( 'empty_badRole_isInRoleResult.success should have value of false', () => {
      expect( empty_badRole_isInRoleResult.success ).to.equal( false );
    });

  });

});

describe( 'Update email', () => {

  describe( 'Update with a good email', () => {
    let update_email_Result;
    const email = "harvey@someothersite.com";

    const updateAccount = next => {
      accountModel.Update.email( testAccountUID, email, result => {
        update_email_Result = result;
        if(result.msg){
          console.log( 'msg' );
          console.log( result.msg);
        }
        next();
      });
    };

    before( done => {
      updateAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'update_email_Result should NOT have property error', () => {
      expect( update_email_Result ).to.not.have.property( 'error' );
    });

    it( 'update_email_Result should NOT have property msg', () => {
      expect( update_email_Result ).to.not.have.property( 'msg' );
    });

    it( 'update_email_Result should have property success', () => {
      expect( update_email_Result ).to.have.property( 'success' );
    });

    // Property Type
    it( 'update_email_Result should be an Object', () => {
      expect( update_email_Result ).to.be.a( 'Object' );
    });

    it( 'update_email_Result.success should be a boolean', () => {
      expect( update_email_Result.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_email_Result.success should have value of true', () => {
      expect( update_email_Result.success ).to.equal( true );
    });

  });

  describe( 'Update with a bad email', () => {
    let update_bad_email_Result;
    const email = "bob@SomeSiteCom";

    const updateAccount = next => {
      accountModel.Update.email( testAccountUID, email, result => {
        update_bad_email_Result = result;
        next();
      });
    };

    before( done => {
      updateAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'update_bad_email_Result should NOT have property error', () => {
      expect( update_bad_email_Result ).to.not.have.property( 'error' );
    });

    it( 'update_bad_email_Result should have property msg', () => {
      expect( update_bad_email_Result ).to.have.property( 'msg' );
    });

    it( 'update_bad_email_Result should have property success', () => {
      expect( update_bad_email_Result ).to.have.property( 'success' );
    });

    // Property Type
    it( 'update_bad_email_Result should be an Object', () => {
      expect( update_bad_email_Result ).to.be.a( 'Object' );
    });

    it( 'update_bad_email_Result msg should be a string', () => {
      expect( update_bad_email_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_bad_email_Result.success should be a boolean', () => {
      expect( update_bad_email_Result.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_bad_email_Result msg should have value of errMsg.emailInvalid', () => {
      expect( update_bad_email_Result.msg ).to.equal( errMsg.emailInvalid );
    });

    it( 'update_bad_email_Result.success should have value of false', () => {
      expect( update_bad_email_Result.success ).to.equal( false );
    });

  });

  describe( 'update using bad uid', () => {
    let update_badUid_email_Result;
    const email = "b.smith@somesite.com";

    const updateAccount = next => {
      accountModel.Update.email( badUID, email, result => {
        update_badUid_email_Result = result;
        next();
      });
    };

    before( done => {
      updateAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'update_badUid_email_Result should NOT have property error', () => {
      expect( update_badUid_email_Result ).to.not.have.property( 'error' );
    });

    it( 'update_badUid_email_Result should have property msg', () => {
      expect( update_badUid_email_Result ).to.have.property( 'msg' );
    });

    it( 'update_badUid_email_Result should have property success', () => {
      expect( update_badUid_email_Result ).to.have.property( 'success' );
    });

    // Property Type
    it( 'update_badUid_email_Result should be an Object', () => {
      expect( update_badUid_email_Result ).to.be.a( 'Object' );
    });

    it( 'update_badUid_email_Result msg should be a string', () => {
      expect( update_badUid_email_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_badUid_email_Result.success should be a boolean', () => {
      expect( update_badUid_email_Result.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_badUid_email_Result msg should have value of errMsg.accountNotFound', () => {
      expect( update_badUid_email_Result.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'update_badUid_email_Result.success should have value of false', () => {
      expect( update_badUid_email_Result.success ).to.equal( false );
    });

  });

});

describe( 'Update password', () => {

  describe( 'Update using a new password that is good', () => {

    let goodPasswordResult;

    const updateAccountPassword = next => {
      accountModel.Update.password( testAccountUID, password, passwordUpdated, result => {
        goodPasswordResult = result;
        if( result.msg ) console.log( result.msg );
        next();
      });
    };

    before( done => {
      updateAccountPassword( done );
    });

    after( done => done() );

    // Property Exists
    it( 'goodPasswordResult should NOT have property error', () => {
      expect( goodPasswordResult ).to.not.have.property( 'error' );
    });

    it( 'goodPasswordResult should NOT have property msg', () => {
      expect( goodPasswordResult ).to.not.have.property( 'msg' );
    });

    it( 'goodPasswordResult should have property success', () => {
      expect( goodPasswordResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'goodPasswordResult should be an Object', () => {
      expect( goodPasswordResult ).to.be.a( 'Object' );
    });

    it( 'goodPasswordResult.success should be a boolean', () => {
      expect( goodPasswordResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
     it( 'goodPasswordResult.success should have value of true', () => {
      expect( goodPasswordResult.success ).to.equal( true );
    });

  });

  describe( 'Update using a new password that is too short', () => {

    let badPasswordResult;

    const badPassword = 'nm%o&z';

    const updateAccount = next => {
      accountModel.Update.password( testAccount2UID, password2, badPassword, result => {
        badPasswordResult = result;
        next();
      });
    };

    before( done => {
      updateAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badPasswordResult should NOT have property error', () => {
      expect( badPasswordResult ).to.not.have.property( 'error' );
    });

    it( 'badPasswordResult should have property msg', () => {
      expect( badPasswordResult ).to.have.property( 'msg' );
    });

    it( 'badPasswordResult should have property success', () => {
      expect( badPasswordResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'badPasswordResult should be an Object', () => {
      expect( badPasswordResult ).to.be.a( 'Object' );
    });

    it( 'badPasswordResult msg should be a string', () => {
      expect( badPasswordResult.msg ).to.be.a( 'string' );
    });

    it( 'badPasswordResult.success should be a boolean', () => {
      expect( badPasswordResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badPasswordResult msg should have value of errMsg.passwordTooShort', () => {
      expect( badPasswordResult.msg ).to.equal( errMsg.passwordTooShort );
    });

    it( 'badPasswordResult.success should have value of false', () => {
      expect( badPasswordResult.success ).to.equal( false );
    });

  });

  // need test for bad uid.

});

describe( 'generate a QRcode and secret for 2a', () => {

  describe( 'Generate for Bad UID.', () => {

    let qrcodeResult;

    const getSecret = next => {
      generatedSecret = accountModel.Update.generateQRCode( badUID, result => {
        qrcodeResult = result;
        next();
      });
    };

    before( done => getSecret( done ) );

    after( done => done() );

    // Property Exists
    it( 'qrcodeResult should NOT have property data_url', () => {
      expect( qrcodeResult ).to.not.have.property( 'data_url' );
    });

    it( 'qrcodeResult should NOT have property secret', () => {
      expect( qrcodeResult ).to.not.have.property( 'secret' );
    });

    it( 'qrcodeResult should have property msg', () => {
      expect( qrcodeResult ).to.have.property( 'msg' );
    });

    it( 'qrcodeResult should have property success', () => {
      expect( qrcodeResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'qrcodeResult.msg should be a string', () => {
      expect( qrcodeResult.msg ).to.be.a( 'string' );
    });

    it( 'qrcodeResult.success should be a boolean', () => {
      expect( qrcodeResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'qrcodeResult.msg should have value of updateGenericFail', () => {
      expect( qrcodeResult.msg ).to.equal( errMsg.updateGenericFail );
    });

    it( 'qrcodeResult.success should have value of false', () => {
      expect( qrcodeResult.success ).to.equal( false );
    });

  });

  describe( 'Generate for good UID.', () => {

    let qrcodeResult;

    const getSecret = next => {
      generatedSecret = accountModel.Update.generateQRCode( testAccountUID, result => {
        qrcodeResult = result;
        testAccount1_2ASecret = result.secret.base32;
        next();
      });
    };

    before( ( done ) => getSecret( done ) );

    after( done => done() );

    // Property Exists
    it( 'qrcodeResult should have property data_url', () => {
      expect( qrcodeResult ).to.have.property( 'data_url' );
    });

    it( 'qrcodeResult should have property success', () => {
      expect( qrcodeResult ).to.have.property( 'success' );
    });

    it( 'qrcodeResult should have property secret', () => {
      expect( qrcodeResult ).to.have.property( 'secret' );
    });

    it( 'qrcodeResult.secret should have property ascii', () => {
      expect( qrcodeResult.secret ).to.have.property( 'ascii' );
    });

    it( 'qrcodeResult.secret should have property hex', () => {
      expect( qrcodeResult.secret ).to.have.property( 'hex' );
    });

    it( 'qrcodeResult.secret should have property base32', () => {
      expect( qrcodeResult.secret ).to.have.property( 'base32' );
    });

    it( 'qrcodeResult.secret should have property otpauth_url', () => {
      expect( qrcodeResult.secret ).to.have.property( 'otpauth_url' );
    });

    // Property Type
    it( 'qrcodeResult.data_url should be a string', () => {
      expect( qrcodeResult.data_url ).to.be.a( 'string' );
    });

    it( 'qrcodeResult.secret should be an object', () => {
      expect( qrcodeResult.secret ).to.be.a( 'object' );
    });

    it( 'qrcodeResult.secret.ascii should be a string', () => {
      expect( qrcodeResult.secret.ascii ).to.be.a( 'string' );
    });

    it( 'qrcodeResult.secret.hex should be a string', () => {
      expect( qrcodeResult.secret.hex ).to.be.a( 'string' );
    });

    it( 'qrcodeResult.secret.base32 should be a string', () => {
      expect( qrcodeResult.secret.base32 ).to.be.a( 'string' );
    });

    it( 'qrcodeResult.secret.otpauth_url should be a string', () => {
      expect( qrcodeResult.secret.otpauth_url ).to.be.a( 'string' );
    });

    it( 'qrcodeResult.success should be a boolean', () => {
      expect( qrcodeResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'qrcodeResult.success should have value of true', () => {
      expect( qrcodeResult.success ).to.equal( true );
    });

  });

});

describe( 'Process the recovery phrase.', () => {

  describe( 'Generate phrase', () => {

    const getRecoveryPhrase = next => {
      accountModel.Read.passphrase( testAccountUID, phrase => {
        recoveryPhraseUser1 = phrase;
        next();
      });
    };

    before( done => {
      getRecoveryPhrase( done );
    });

    after( done => done() );

    // Property Type
    it( 'recoveryPhraseUser1 should be a string', () => {
      expect( recoveryPhraseUser1 ).to.be.a( 'string' );
    });

    // Return Value
    it( 'recoveryPhraseUser1 should have ', () => {
      expect( recoveryPhraseUser1 ).to.have.lengthOf( 32 );
    });

  });

  describe( 'Generate phrase with bad ID', () => {

    let badId_getRecoveryPhraseResult;
    const getRecoveryPhrase = next => {
      accountModel.Read.passphrase( badUID, phrase => {
        badId_getRecoveryPhraseResult = phrase;
        next();
      });
    };

    before( ( done ) => {
      getRecoveryPhrase( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badId_getRecoveryPhraseResult should have property success', () => {
      expect( badId_getRecoveryPhraseResult ).to.have.property( 'success' );
    });

    it( 'badId_getRecoveryPhraseResult should have property msg', () => {
      expect( badId_getRecoveryPhraseResult ).to.have.property( 'msg' );
    });

    // Property Type
    it( 'badId_getRecoveryPhraseResult.msg should be a string', () => {
      expect( badId_getRecoveryPhraseResult.msg ).to.be.a( 'string' );
    });

    it( 'badId_getRecoveryPhraseResult.success should be a boolean', () => {
      expect( badId_getRecoveryPhraseResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badId_getRecoveryPhraseResult.msg should have value of updateGenericFail', () => {
      expect( badId_getRecoveryPhraseResult.msg ).to.equal( errMsg.updateGenericFail );
    });

    it( 'badId_getRecoveryPhraseResult.success should have value of false', () => {
      expect( badId_getRecoveryPhraseResult.success ).to.equal( false );
    });

  });

  describe( 'Validate User has phrase correct', () => {

    let goodPassphraseProvedResult;

    const get_Good_PassphraseProved = next => {
      accountModel.Update.passphraseProved( testAccountUID, recoveryPhraseUser1, result => {
        goodPassphraseProvedResult = result;
        next();
      });
    };

    before( ( done ) => {
      get_Good_PassphraseProved( done );
    });

    after( done => done() );

    // Property Exists
    it( 'goodPassphraseProvedResult should have property success', () => {
      expect( goodPassphraseProvedResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'goodPassphraseProvedResult.success should be a boolean', () => {
      expect( goodPassphraseProvedResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'goodPassphraseProvedResult.success should have value of true', () => {
      expect( goodPassphraseProvedResult.success ).to.equal( true );
    });

  });

  describe( 'Incorrect passphrase ', () => {

    let badPassphraseProvedResult;
    const badRecoveryPhrase = '62y$TqqXdwSg4y%a67pzjRdA&wvtM2F@';

    const get_Good_PassphraseProved = next => {
      accountModel.Update.passphraseProved( testAccountUID, badRecoveryPhrase, result => {
        badPassphraseProvedResult = result;
        next();
      });
    };

    before( done => {
      get_Good_PassphraseProved( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badPassphraseProvedResult should have property msg', () => {
      expect( badPassphraseProvedResult ).to.have.property( 'msg' );
    });

    it( 'badPassphraseProvedResult should have property success', () => {
      expect( badPassphraseProvedResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'badPassphraseProvedResult.msg should be a string', () => {
      expect( badPassphraseProvedResult.msg ).to.be.a( 'string' );
    });

    it( 'badPassphraseProvedResult.success should be a boolean', () => {
      expect( badPassphraseProvedResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badPassphraseProvedResult.msg should have value of msg', () => {
      expect( badPassphraseProvedResult.msg ).to.equal( errMsg.accountValidationFailure );
    });

    it( 'badPassphraseProvedResult.success should have value of false', () => {
      expect( badPassphraseProvedResult.success ).to.equal( false );
    });

  });

  describe( 'Bad user for recoveryPhrase', () => {

    let badUser_PassphraseProvedResult;

    const get_BadUID_PassphraseRecoveryProved = next => {
      accountModel.Update.passphraseProved( badUID, recoveryPhraseUser1, result => {
        badUser_PassphraseProvedResult = result;
        next();
      });
    };

    before( done => {
      get_BadUID_PassphraseRecoveryProved( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badUser_PassphraseProvedResult should have property success', () => {
      expect( badUser_PassphraseProvedResult ).to.have.property( 'success' );
    });

    it( 'badUser_PassphraseProvedResult should have property msg', () => {
      expect( badUser_PassphraseProvedResult ).to.have.property( 'msg' );
    });

    // Property Type
    it( 'badUser_PassphraseProvedResult.msg should be a string', () => {
      expect( badUser_PassphraseProvedResult.msg ).to.be.a( 'string' );
    });

    it( 'badUser_PassphraseProvedResult.success should be a boolean', () => {
      expect( badUser_PassphraseProvedResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badUser_PassphraseProvedResult.msg should have value of errMsg.accountNotFound', () => {
      expect( badUser_PassphraseProvedResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'badUser_PassphraseProvedResult.success should have value of false', () => {
      expect( badUser_PassphraseProvedResult.success ).to.equal( false );
    });

  });

});

describe( 'Update twoStep', () => {

  describe( 'Set twoA on with good id, but no recoveryPhrase confirmation.', () => {

    let noConfirm_twoStepResult;
    const twoA = true;
    const token = '000000';

    const updateTwoA = next => {
      accountModel.Update.twoStep( testAccount2UID, token, twoA, result => {
        noConfirm_twoStepResult = result;
        next();
      });
    };

    before( done => {
      updateTwoA( done );
    });

    after( done => done() );

    // Property Exists
    it( 'noConfirm_twoStepResult should NOT have property error', () => {
      expect( noConfirm_twoStepResult ).to.not.have.property( 'error' );
    });

    it( 'noConfirm_twoStepResult should have property msg', () => {
      expect( noConfirm_twoStepResult ).to.have.property( 'msg' );
    });

    it( 'noConfirm_twoStepResult should have property success', () => {
      expect( noConfirm_twoStepResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'noConfirm_twoStepResult.msg should be a string', () => {
      expect( noConfirm_twoStepResult.msg ).to.be.a( 'string' );
    });

    it( 'noConfirm_twoStepResult.success should be a boolean', () => {
      expect( noConfirm_twoStepResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'noConfirm_twoStepResult.msg should have value of recoveryPhraseNotProved', () => {
      expect( noConfirm_twoStepResult.msg ).to.equal( errMsg.recoveryPhraseNotProved );
    });

    it( 'noConfirm_twoStepResult.success should have value of true', () => {
      expect( noConfirm_twoStepResult.success ).to.equal( false );
    });

  });

  describe('Set twoA on with good id, good recovery, good token', () => {

    let good_twoStepResult;
    const twoA = true;

    const getToken = next => {
      const token = authenticator.generate( testAccount1_2ASecret );
      // console.log( 'token ' + token );
      accountModel.Update.twoStep( testAccountUID, token, twoA, result => {
        good_twoStepResult = result;
        if( result.msg ) {
          console.log( 'result.msg' );
          console.log( result.msg );
        }
        next();
      });
    };

    before( done => {
      getToken( done );
    });

    after( done => setTimeout( done(), 1 ) );

    // Property Exists
    it( 'good_twoStepResult should NOT have property msg', () => {
      expect( good_twoStepResult ).to.not.have.property( 'msg' );
    });

    it( 'good_twoStepResult should NOT have property error', () => {
      expect( good_twoStepResult ).to.not.have.property( 'error' );
    });

    it( 'good_twoStepResult should have property success', () => {
      expect( good_twoStepResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'good_twoStepResult.success should be a boolean', () => {
      expect( good_twoStepResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'good_twoStepResult.success should have value of true', () => {
      expect( good_twoStepResult.success ).to.equal( true );
    });

  });

  describe( 'Set twoA on bad id', () => {

    let badID_twoStepResult;
    const twoA = true;

    const updateTwoA = next => {
      const token = authenticator.generate( testAccount1_2ASecret );
      accountModel.Update.twoStep( badUID, token, twoA, result => {
        badID_twoStepResult = result;
        next();
      });
    };

    before( done => {
      updateTwoA( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badID_twoStepResult should NOT have property error', () => {
      expect( badID_twoStepResult ).to.not.have.property( 'error' );
    });

    it( 'badID_twoStepResult should have property msg', () => {
      expect( badID_twoStepResult ).to.have.property( 'msg' );
    });

    it( 'badID_twoStepResult should have property success', () => {
      expect( badID_twoStepResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'badID_twoStepResult.msg should be a string', () => {
      expect( badID_twoStepResult.msg ).to.be.a( 'string' );
    });

    it( 'badID_twoStepResult.success should be a boolean', () => {
      expect( badID_twoStepResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badID_twoStepResult.msg should have value of accountNotFound', () => {
      expect( badID_twoStepResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'badID_twoStepResult.success should have value of true', () => {
      expect( badID_twoStepResult.success ).to.equal( false );
    });

  });

});

describe( 'Login with 2A', () => {

  describe( 'Login in with No 2A code.', () => {

    let no2A_LoginResult;

    const no2A_Login = next => {
      accountModel.Read.validateAccount( username, passwordUpdated, fauxIPS, null, result => {
        no2A_LoginResult = result;
        next();
      });
    };

    before( done => {
      no2A_Login( done );
    });

    after( done => done() );

    // Property Exists
    it( 'no2A_LoginResult should NOT have property data', () => {
      expect( no2A_LoginResult ).to.not.have.property( 'data' );
    });

    it( 'no2A_LoginResult should NOT have property token', () => {
      expect( no2A_LoginResult ).to.not.have.property( 'token' );
    });

    it( 'no2A_LoginResult should have property success', () => {
      expect( no2A_LoginResult ).to.have.property( 'success' );
    });

    it( 'no2A_LoginResult should have property msg', () => {
      expect( no2A_LoginResult ).to.have.property( 'msg' );
    });

    // Property Type
    it( 'no2A_LoginResult.success should be a boolean', () => {
      expect( no2A_LoginResult.success ).to.be.a( 'boolean' );
    });

    it( 'no2A_LoginResult msg should be a string', () => {
      expect( no2A_LoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value
    it( 'no2A_LoginResult.success should have value of false', () => {
      expect( no2A_LoginResult.success ).to.equal( false );
    });

    it( 'no2A_LoginResult msg should have value of var accountValidationFailure', () => {
      expect( no2A_LoginResult.msg ).to.equal( errMsg.accountValidationFailure );
    });

  });

  describe( 'Login with bad 2A code', () => {

    let bad2A_LoginResult;

    const no2A_Login = next => {
      accountModel.Read.validateAccount( username, passwordUpdated, fauxIPS, '000000', result => {
        bad2A_LoginResult =result;
        next();
      });
    };

    before( done => {
      no2A_Login( done );
    });

    after( done => done() );

    // Property Exists
    it( 'bad2A_LoginResult should NOT have property data', () => {
      expect( bad2A_LoginResult ).to.not.have.property( 'data' );
    });

    it( 'bad2A_LoginResult should NOT have property token', () => {
      expect( bad2A_LoginResult ).to.not.have.property( 'token' );
    });

    it( 'bad2A_LoginResult should have property success', () => {
      expect( bad2A_LoginResult ).to.have.property( 'success' );
    });

    it( 'bad2A_LoginResult should have property msg', () => {
      expect( bad2A_LoginResult ).to.have.property( 'msg' );
    });

    // Property Type
    it( 'bad2A_LoginResult.success should be a boolean', () => {
      expect( bad2A_LoginResult.success ).to.be.a( 'boolean' );
    });

    it( 'bad2A_LoginResult msg should be a string', () => {
      expect( bad2A_LoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value
    it( 'bad2A_LoginResult success should have value of false', () => {
      expect( bad2A_LoginResult.success ).to.equal( false );
    });

    it( 'bad2A_LoginResult msg should have value of var accountValidationFailure', () => {
      expect( bad2A_LoginResult.msg ).to.equal( errMsg.accountValidationFailure );
    });

  });

  describe( 'Login with Unnecessary 2A code.', () => {

    let unnecessary2A_LoginResult;

    const no2A_Login = next => {
      accountModel.Read.validateAccount( username2, password2, fauxIPS, '000000', result => {
        unnecessary2A_LoginResult = result;
        next();
      });
    };

    before( done => {
      no2A_Login( done );
    });

    after( done => done() );

    // Property Exists
    it( 'unnecessary2A_LoginResult should NOT have property msg', () => {
      expect( unnecessary2A_LoginResult ).to.not.have.property( 'msg' );
    });

    it( 'unnecessary2A_LoginResult should NOT have property data', () => {
      expect( unnecessary2A_LoginResult ).to.not.have.property( 'data' );
    });

    it( 'unnecessary2A_LoginResult should have property success', () => {
      expect( unnecessary2A_LoginResult ).to.have.property( 'success' );
    });

    it( 'unnecessary2A_LoginResult should have property token', () => {
      expect( unnecessary2A_LoginResult ).to.have.property( 'token' );
    });

    // Property Type
    it( 'unnecessary2A_LoginResult.success should be a boolean', () => {
      expect( unnecessary2A_LoginResult.success ).to.be.a( 'boolean' );
    });

    it( 'unnecessary2A_LoginResult token should be a string', () => {
      expect( unnecessary2A_LoginResult.token ).to.be.a( 'string' );
    });

    // Return Value
    it( 'unnecessary2A_LoginResult.success should have value of true', () => {
      expect( unnecessary2A_LoginResult.success ).to.equal( true );
    });

  });

  describe( 'Login with good 2A Code', () => {

      let good_LoginResult;

      const no2A_Login = next => {
        const token = authenticator.generate( testAccount1_2ASecret );
        accountModel.Read.validateAccount( username, passwordUpdated, fauxIPS, token, ( result ) => {
          good_LoginResult = result;
          if ( result.msg ) {
            console.log( 'result.msg' );
            console.log( result.msg );
            console.log( );
            console.log( 'testAccount1_2ASecret' );
            console.log( testAccount1_2ASecret );
          }
          next();
        });
      };

      before( done => {
        no2A_Login( done );
      });

      after( done => done() );

      // Property Exists
      it( 'good_LoginResult should NOT have property msg', () => {
        expect( good_LoginResult ).to.not.have.property( 'msg' );
      });

      it( 'good_LoginResult should NOT have property data', () => {
        expect( good_LoginResult ).to.not.have.property( 'data' );
      });

      it( 'good_LoginResult should have property success', () => {
        expect( good_LoginResult ).to.have.property( 'success' );
      });

      it( 'good_LoginResult should have property token', () => {
        expect( good_LoginResult ).to.have.property( 'token' );
      });

      // Property Type
      it( 'good_LoginResult.success should be a boolean', () => {
        expect( good_LoginResult.success ).to.be.a( 'boolean' );
      });

      it( 'good_LoginResult token should be a string', () => {
        expect( good_LoginResult.token ).to.be.a( 'string' );
      });

      // Return Value
      it( 'good_LoginResult.success should have value of true', () => {
        expect( good_LoginResult.success ).to.equal( true );
      });

  });

});

describe('Delete account', () => {

  describe( 'Delete Account with bad Username', () => {

    let badID_deleteAccountResult;

    const badID_deleteAccount = next => {
      const token = authenticator.generate( testAccount1_2ASecret );
      accountModel.Delete.accountSoftly( 'badUsername', passwordUpdated, fauxIPS, token, result => {
        badID_deleteAccountResult = result;
        next();
      });
    };

    before( done => {
      badID_deleteAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badID_deleteAccountResult should have property success', () => {
      expect( badID_deleteAccountResult ).to.have.property( 'success' );
    });

    it( 'badID_deleteAccountResult should have property msg', () => {
      expect( badID_deleteAccountResult ).to.have.property( 'msg' );
    });

    // Property Type
    it( 'badID_deleteAccountResult.msg should be a string', () => {
      expect( badID_deleteAccountResult.msg ).to.be.a( 'string' );
    });

    it( 'badID_deleteAccountResult.success should be a boolean', () => {
      expect( badID_deleteAccountResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badID_deleteAccountResult.msg should have value of accountNotFound', () => {
      expect( badID_deleteAccountResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'badID_deleteAccountResult.success should have value of false', () => {
      expect( badID_deleteAccountResult.success ).to.equal( false );
    });

  });

  describe( 'Delete Account with good Username', () => {

    let good_softDeleteAccountResult;

    const good_softDeleteAccount = next => {
      const token = authenticator.generate( testAccount1_2ASecret );
      accountModel.Delete.accountSoftly( username, passwordUpdated, fauxIPS, token, result => {
        good_deleteAccountResult = result;
        next();
      });
    };

    before( done => {
      good_softDeleteAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'good_deleteAccountResult should NOT have property msg', () => {
      expect( good_deleteAccountResult ).to.not.have.property( 'msg' );
    });

    it( 'good_deleteAccountResult should have property success', () => {
      expect( good_deleteAccountResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'good_deleteAccountResult.success should be a boolean', () => {
      expect( good_deleteAccountResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'good_deleteAccountResult.success should have value of true', () => {
      expect( good_deleteAccountResult.success ).to.equal( true );
    });

  });

  describe( 'Attempt to retrieve info from soft deleted account', () => {

    describe( 'by ID', () => {

      let getSoftDeletedAccountByIdResult;

      const getSoftDeletedAccount = next => {
        accountModel.Read.accountById( testAccountUID, result => {
          getSoftDeletedAccountByIdResult = result;
          next();
        });
      };

      before( done => {
        getSoftDeletedAccount( done );
      });

      after( done => done() );

      // Property Exists
      it( 'getSoftDeletedAccountByIdResult should have property msg', () => {
        expect( getSoftDeletedAccountByIdResult ).to.have.property( 'msg' );
      });

      it( 'getSoftDeletedAccountByIdResult should have property success', () => {
        expect( getSoftDeletedAccountByIdResult ).to.have.property( 'success' );
      });

      // Property Type
      it( 'getSoftDeletedAccountByIdResult.msg should be a string', () => {
        expect( getSoftDeletedAccountByIdResult.msg ).to.be.a( 'string' );
      });

      it( 'getSoftDeletedAccountByIdResult.success should be a boolean', () => {
        expect( getSoftDeletedAccountByIdResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'getSoftDeletedAccountByIdResult.msg should have value of accountNotFound', () => {
        expect( getSoftDeletedAccountByIdResult.msg ).to.equal( errMsg.accountNotFound );
      });

      it( 'getSoftDeletedAccountByIdResult.success should have value of false', () => {
        expect( getSoftDeletedAccountByIdResult.success ).to.equal( false );
      });

    });

    describe( 'by Username', () => {

      let getSoftDeletedAccountByUsernameResult;

      const getSoftDeletedAccount = next => {
        accountModel.Read.accountByUsername( username, result => {
          getSoftDeletedAccountByUsernameResult = result;
          next();
        });
      };

      before( done => {
        getSoftDeletedAccount( done );
      });

      after( done => done() );

      // Property Exists
      it( 'getSoftDeletedAccountByUsernameResult should have property msg', () => {
        expect( getSoftDeletedAccountByUsernameResult ).to.have.property( 'msg' );
      });

      it( 'getSoftDeletedAccountByUsernameResult should have property success', () => {
        expect( getSoftDeletedAccountByUsernameResult ).to.have.property( 'success' );
      });

      // Property Type
      it( 'getSoftDeletedAccountByUsernameResult.msg should be a string', () => {
        expect( getSoftDeletedAccountByUsernameResult.msg ).to.be.a( 'string' );
      });

      it( 'getSoftDeletedAccountByUsernameResult.success should be a boolean', () => {
        expect( getSoftDeletedAccountByUsernameResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'getSoftDeletedAccountByUsernameResult.msg should have value of accountNotFound', () => {
        expect( getSoftDeletedAccountByUsernameResult.msg ).to.equal( errMsg.accountNotFound );
      });

      it( 'getSoftDeletedAccountByUsernameResult.success should have value of false', () => {
        expect( getSoftDeletedAccountByUsernameResult.success ).to.equal( false );
      });

    });

    describe( 'All', () => {

      let allAccountsResult;

      const getAllAccount = next => {
        accountModel.Read.all( result => {
          allAccountsResult = result;
          next();
        });
      };

      before( done => {
        getAllAccount( done );
      });

      after( done => done() );

      // Property Exists
      it( 'allAccountsResult should have property data', () => {
        expect( allAccountsResult ).to.have.property( 'data' );
      });

      it( 'allAccountsResult should have property success', () => {
        expect( allAccountsResult ).to.have.property( 'success' );
      });

      // Property Type
      it( 'allAccountsResult.data should be an array', () => {
        expect( allAccountsResult.data ).to.be.a( 'array' );
      });

      it( 'allAccountsResult.success should be a boolean', () => {
        expect( allAccountsResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'allAccountsResult.data should have length of 1', () => {
        expect( allAccountsResult.data ).to.be.length( 1 );
      });

      it( 'allAccountsResult.success should have value of true', () => {
        expect( allAccountsResult.success ).to.equal( true );
      });

    });

    describe( 'Read passphrase', () => {

      let recoveryPhraseResult;

      const getRecoveryPhrase = next => {
        accountModel.Read.passphrase( testAccountUID, phrase => {
          recoveryPhraseResult = phrase;
          next();
        });
      };

      before( done => {
        getRecoveryPhrase( done );
      });

      after( done => done() );

      // Property Exists
      it( 'recoveryPhraseResult should have property success', () => {
        expect( recoveryPhraseResult ).to.have.property( 'success' );
      });

      it( 'recoveryPhraseResult should have property msg', () => {
        expect( recoveryPhraseResult ).to.have.property( 'msg' );
      });

      // Property Type
      it( 'recoveryPhraseResult.msg should be a string', () => {
        expect( recoveryPhraseResult.msg ).to.be.a( 'string' );
      });

      it( 'recoveryPhraseResult.success should be a boolean', () => {
        expect( recoveryPhraseResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'recoveryPhraseResult.msg should have value of updateGenericFail', () => {
        expect( recoveryPhraseResult.msg ).to.equal( errMsg.updateGenericFail );
      });

      it( 'recoveryPhraseResult.success should have value of false', () => {
        expect( recoveryPhraseResult.success ).to.equal( false );
      });

    });

    describe( 'rolesById', () => {

      before( done => {
        done();
      });

      after( done => done() );

      // Property Exists

      // Property Type

      // Return Value

    });

    describe( 'isInRole', () => {

      before( done => {
        done();
      });

      after( done => done() );

      // Property Exists

      // Property Type

      // Return Value

    });

    describe( 'Update email', () => {

      let updateEmailResult;

      const updateEmail = next => {
          const email = 'deletedaccount@email.com';
          accountModel.Update.email( testAccountUID, email, result => {
            updateEmailResult = result;
            next();
          });
      };

      before( done => {
        updateEmail( done );
      });

      after( done => done() );

      it( 'updateEmailResult should NOT have property error', () => {
        expect( updateEmailResult ).to.not.have.property( 'error' );
      });

      it( 'updateEmailResult should have property msg', () => {
        expect( updateEmailResult ).to.have.property( 'msg' );
      });

      it( 'updateEmailResult should have property success', () => {
        expect( updateEmailResult ).to.have.property( 'success' );
      });

      // Property Type
      it( 'updateEmailResult should be an Object', () => {
        expect( updateEmailResult ).to.be.a( 'Object' );
      });

      it( 'updateEmailResult.msg should be a string', () => {
        expect( updateEmailResult.msg ).to.be.a( 'string' );
      });

      it( 'updateEmailResult.success should be a boolean', () => {
        expect( updateEmailResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'updateEmailResult.msg should have value of errMsg.accountNotFound', () => {
        expect( updateEmailResult.msg ).to.equal( errMsg.accountNotFound );
      });

      it( 'updateEmailResult.success should have value of false', () => {
        expect( updateEmailResult.success ).to.equal( false );
      });

    });

    describe( 'Update generateQRCode', () => {

      let generateQRResult;

      const getSecret = next => {
        generatedSecret = accountModel.Update.generateQRCode( testAccountUID, result => {
          generateQRResult = result;
          next();
        });
      };

      before( done => getSecret( done ) );

      after( done => done() );

      // Property Exists
      it( 'generateQRResult should NOT have property data_url', () => {
        expect( generateQRResult ).to.not.have.property( 'data_url' );
      });

      it( 'generateQRResult should NOT have property secret', () => {
        expect( generateQRResult ).to.not.have.property( 'secret' );
      });

      it( 'generateQRResult should have property msg', () => {
        expect( generateQRResult ).to.have.property( 'msg' );
      });

      it( 'generateQRResult should have property success', () => {
        expect( generateQRResult ).to.have.property( 'success' );
      });

      // Property Type
      it( 'generateQRResult.msg should be a string', () => {
        expect( generateQRResult.msg ).to.be.a( 'string' );
      });

      it( 'generateQRResult.success should be a boolean', () => {
        expect( generateQRResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'generateQRResult.msg should have value of updateGenericFail', () => {
        expect( generateQRResult.msg ).to.equal( errMsg.updateGenericFail );
      });

      it( 'generateQRResult.success should have value of false', () => {
        expect( generateQRResult.success ).to.equal( false );
      });

    });

    describe( 'Update passphraseProved', () => {

      let deletedAccount_PassphraseProvedResult;

      const get_BadUID_PassphraseRecoveryProved = next => {
        accountModel.Update.passphraseProved( testAccountUID, recoveryPhraseUser1, result => {
          deletedAccount_PassphraseProvedResult = result;
          next();
        });
      };

      before( done => {
        get_BadUID_PassphraseRecoveryProved( done );
      });

      after( done => done() );

      // Property Exists
      it( 'deletedAccount_PassphraseProvedResult should have property success', () => {
        expect( deletedAccount_PassphraseProvedResult ).to.have.property( 'success' );
      });

      it( 'deletedAccount_PassphraseProvedResult should have property msg', () => {
        expect( deletedAccount_PassphraseProvedResult ).to.have.property( 'msg' );
      });

      // Property Type
      it( 'deletedAccount_PassphraseProvedResult.msg should be a string', () => {
        expect( deletedAccount_PassphraseProvedResult.msg ).to.be.a( 'string' );
      });

      it( 'deletedAccount_PassphraseProvedResult.success should be a boolean', () => {
        expect( deletedAccount_PassphraseProvedResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'deletedAccount_PassphraseProvedResult.msg should have value of errMsg.accountNotFound', () => {
        expect( deletedAccount_PassphraseProvedResult.msg ).to.equal( errMsg.accountNotFound );
      });

      it( 'deletedAccount_PassphraseProvedResult.success should have value of false', () => {
        expect( deletedAccount_PassphraseProvedResult.success ).to.equal( false );
      });

    });

    describe( 'Update password', () => {

      let deleteAccount_updatePasswordResult;
      const passwordUpdated2 = 'xt2PUef^E';

      const updatePass = next => {
        accountModel.Update.password( testAccountUID, passwordUpdated, passwordUpdated2, result => {
          deleteAccount_updatePasswordResult = result;
          next();
        });
      };

      before( done => {
        updatePass( done );
      });

      after( done => done() );

      // Property Exists
      it( 'deleteAccount_updatePasswordResult should NOT have property error', () => {
        expect( deleteAccount_updatePasswordResult ).to.not.have.property( 'error' );
      });

      it( 'deleteAccount_updatePasswordResult should have property msg', () => {
        expect( deleteAccount_updatePasswordResult ).to.have.property( 'msg' );
      });

      it( 'deleteAccount_updatePasswordResult should have property success', () => {
        expect( deleteAccount_updatePasswordResult ).to.have.property( 'success' );
      });

      // Property Type
      it( 'deleteAccount_updatePasswordResult should be an Object', () => {
        expect( deleteAccount_updatePasswordResult ).to.be.a( 'Object' );
      });

      it( 'deleteAccount_updatePasswordResult.msg should be a string', () => {
        expect( deleteAccount_updatePasswordResult.msg ).to.be.a( 'string' );
      });

      it( 'deleteAccount_updatePasswordResult.success should be a boolean', () => {
        expect( deleteAccount_updatePasswordResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'deleteAccount_updatePasswordResult.msg should have value of accountNotFound', () => {
        expect( deleteAccount_updatePasswordResult.msg ).to.equal( errMsg.accountNotFound );
      });

       it( 'deleteAccount_updatePasswordResult.success should have value of false', () => {
        expect( deleteAccount_updatePasswordResult.success ).to.equal( false );
      });

    });

    describe( 'Update twoStep', () => {

      let deleteAccount_twoStepResult;
      const twoA = true;

      const updateTwoA = next => {
        const token = authenticator.generate( testAccount1_2ASecret );

        accountModel.Update.twoStep( testAccountUID, token, twoA, result => {
          deleteAccount_twoStepResult = result;
          next();
        });
      };

      before( done => {
        updateTwoA( done );
      });

      after( done => done() );

      // Property Exists
      it( 'deleteAccount_twoStepResult should NOT have property error', () => {
        expect( deleteAccount_twoStepResult ).to.not.have.property( 'error' );
      });

      it( 'deleteAccount_twoStepResult should have property msg', () => {
        expect( deleteAccount_twoStepResult ).to.have.property( 'msg' );
      });

      it( 'deleteAccount_twoStepResult should have property success', () => {
        expect( deleteAccount_twoStepResult ).to.have.property( 'success' );
      });

      // Property Type
      it( 'deleteAccount_twoStepResult.msg should be a string', () => {
        expect( deleteAccount_twoStepResult.msg ).to.be.a( 'string' );
      });

      it( 'deleteAccount_twoStepResult.success should be a boolean', () => {
        expect( deleteAccount_twoStepResult.success ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'deleteAccount_twoStepResult.msg should have value of accountNotFound', () => {
        expect( deleteAccount_twoStepResult.msg ).to.equal( errMsg.accountNotFound );
      });

      it( 'deleteAccount_twoStepResult.success should have value of true', () => {
        expect( deleteAccount_twoStepResult.success ).to.equal( false );
      });

    });

  });

});

describe( 'Recover Account', () => {

  describe( 'Attempt recovery with bad passphrase.', () => {

    let badPhrase_recoveryPhraseResult;
    const badPhrase = '0000000000000000';

    const recoverAccount = next => {
      accountModel.Update.recoverAccount( username, badPhrase, result => {
        badPhrase_recoveryPhraseResult = result;
        next();
      });
    };

    before( done => {
      recoverAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badPhrase_recoveryPhraseResult should have property msg', () => {
      expect( badPhrase_recoveryPhraseResult ).to.have.property( 'msg' );
    });

    it( 'badPhrase_recoveryPhraseResult should have property success', () => {
      expect( badPhrase_recoveryPhraseResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'badPhrase_recoveryPhraseResult.msg should be a string', () => {
      expect( badPhrase_recoveryPhraseResult.msg ).to.be.a( 'string' );
    });

    it( 'badPhrase_recoveryPhraseResult.success should be a boolean', () => {
      expect( badPhrase_recoveryPhraseResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badPhrase_recoveryPhraseResult result should have value of recoveryFailed', () => {
      expect( badPhrase_recoveryPhraseResult.msg ).to.equal( errMsg.recoveryFailed );
    });

    it( 'badPhrase_recoveryPhraseResult.success should have value of false', () => {
      expect( badPhrase_recoveryPhraseResult.success ).to.equal( false );
    });

  });

  describe( 'Attempt recovery with bad username.', () => {

    let badUser_recoveryPhraseResult;
    const badUsername = 'badTestUser';

    const recoverAccount = next => {
      accountModel.Update.recoverAccount( badUsername, 'anything', result => {
        badUser_recoveryPhraseResult = result;
        next();
      });
    };

    before( done => {
      recoverAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badUser_recoveryPhraseResult should have property msg', () => {
      expect( badUser_recoveryPhraseResult ).to.have.property( 'msg' );
    });

    it( 'badUser_recoveryPhraseResult should have property success', () => {
      expect( badUser_recoveryPhraseResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'badUser_recoveryPhraseResult.msg should be a string', () => {
      expect( badUser_recoveryPhraseResult.msg ).to.be.a( 'string' );
    });

    it( 'badUser_recoveryPhraseResult.success should be a boolean', () => {
      expect( badUser_recoveryPhraseResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badUser_recoveryPhraseResult result should have value of recoveryFailed', () => {
      expect( badUser_recoveryPhraseResult.msg ).to.equal( errMsg.recoveryFailed );
    });

    it( 'badUser_recoveryPhraseResult.success should have value of false', () => {
      expect( badUser_recoveryPhraseResult.success ).to.equal( false );
    });

  });

  describe( 'Recover account with good passphrase.', () => {

    let good_recoveryPhraseResult;

    const recoverAccount = next => {
      accountModel.Update.recoverAccount( username, recoveryPhraseUser1, result => {
        good_recoveryPhraseResult = result;
        if ( result.msg ) {
          console.log( 'recoverAccount msg' );
          console.log( result.msg );
        }
        next();
      });
    };

    before( done => {
      recoverAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'good_recoveryPhraseResult should NOT have property msg', () => {
      expect( good_recoveryPhraseResult ).to.not.have.property( 'msg' );
    });

    it( 'good_recoveryPhraseResult should have property success', () => {
      expect( good_recoveryPhraseResult ).to.have.property( 'success' );
    });

    // Property Type
    it( 'good_recoveryPhraseResult.success should be a boolean', () => {
      expect( good_recoveryPhraseResult.success ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'good_recoveryPhraseResult.success should have value of true', () => {
      expect( good_recoveryPhraseResult.success ).to.equal( true );
    });

  });

});

describe( 'Forgot password.', () => {

  describe( 'Bad Username', () => {

      before( done => {
        done();

      });

      after( done => done() );

      // Property Exists

      // Property Type

      // Return Value

  });

  describe( 'Bad Email', () => {

      before( done => {
        done();

      });

      after( done => done() );

      // Property Exists

      // Property Type

      // Return Value

  });

  describe( 'Good recovery', () => {

      before( done => {
        done();

      });

      after( done => done() );

      // Property Exists

      // Property Type

      // Return Value

  });

});
*/