require.config({
    baseUrl: FAM.domain+'/assets/rdt/scripts',
    paths: {
           easyXDM:            '../../easyXDM',
    },
    shim: {
        app:                          { deps: ['easyXDM'] }
    },
    config:{
        // This is absolutely REQUIRED when testing IE when the code is not pre-compiled (like you would want it in dev)
        // If you remove this, then .html files loaded by require.js will be suffixed with '.js', which will result in a 404
        text: {
            useXhr: function (url, protocol, hostname, port) {
                //return true if you want to allow this url, given that the
                //text plugin thinks the request is coming from protocol,  hostname, port.
                return true;
            }
        }
    }
});

define(["require", 
        "easyXDM",
        "fam_rdt"
], function(
  require,
  easyXDM,
  FAMRDT
){
  window.FAMRDT = FAMRDT;
});
