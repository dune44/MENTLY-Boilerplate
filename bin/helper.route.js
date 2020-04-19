module.exports = {
    getUserIp : ( req ) => {
        var ip = {
          'ip':req.connection.remoteAddress
        };
        console.log(ip.ip + ' is connected');
        var fwdip = req.headers['x-forwarded-for'];
        if( fwdip && fwdip != null && fwdip != '' ) ip.fwdip = fwdip;
        return ip;
    }
};