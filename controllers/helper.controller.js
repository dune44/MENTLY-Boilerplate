module.exports = {
    isVal: value => ( value && value !== '' && value !== null && value !== undefined && value !== 0 ),
    log: ( location, e, next ) => {
        console.log( 'Error in file ' + location );
        console.log( e );
        console.log( );
        next({ "success": false, "error": e });
    }
};