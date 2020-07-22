 const methods = {
    isVal: value => ( value && value !== '' && value !== null && value !== undefined && value !== 0 ),
    log: ( location, e, msg ) => {
        console.log( 'Error in file ' + location );
        console.log( e );
        console.log( );
        if( !methods.isVal( msg ) ) msg = 'Generic Error.';
        return { "success": false, "error": e, "msg": msg };
    }
};
module.exports = methods;