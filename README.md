# MENTLY-Boilerplate
MENTLy Mongo Express Node Tested Login. A boilerplate application for building RESTful APIs in Node.js using Mongo, express.

## TOC
1. Installation
2. Preparation
3. ENV variables
4. License

## Installation
Clone or Download

## Preparation

For dev Testing:
Create a .config folder to store ENV files, I have set this up to take dev.env and test.env respectively.

For Production:
Make sure your server is setup with the necessary ENV vars.

## ENV variables

* PORT            ( port for dev/testing server )
* ADDRESS         ( your machine ip or put localhost )
* MONGO_URL   ( address to your Mongo test db server )
* DB_USERNAME     ( Mongo account with permission to you DB )
* DB_PASSWORD     ( Mongo account password )
* DATABASE          ( this should be different buckets based on dev or test scenario )
* JWT_SECRET      ( this can be any secret, just don't tell anyone )
* NODE_ENV        ( set to dev or test respectively )
Email Variables
* emailHost       ( SMTP Email Host )
* emailPort       ( SMTP Email Port )
* emailSecure     ( Boolean true for 465 port, otherwise false )
* emailUsername   ( Your Email server username )
* emailPassword   ( Your Email server password )

## License:
* Apache-2.0
* Link https://www.apache.org/licenses/LICENSE-2.0.html
* Summary https://tldrlegal.com/license/apache-license-2.0-%28apache-2.0%29
