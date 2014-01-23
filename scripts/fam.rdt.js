define([
  'require',
  'require_easyXDM'
], function (
  require,
  requireEasyXDM
) {
  'use strict';
  /**
    * FAM Reliable Data Transport
    *
    * An encapsulated solution for reliable data transport between client, server, window, and iFrame.
    *
    * @class  FAMRDT
    * @constructor FAMRDT
    *
    * @param {string} domID An existing, unique DOM ID for an element that shall be replaced with the RDT communication iFrame
    * @param {Object.<string, *>} [options]
    * @param {string} [options.hostURL] If provided a valid URL host, such as: "https://somehost.com", the functions get(), post(), put(), and destroy() become available.
    * @param {string} [options.iFrameURL] If provided a valid URL, such as: "https://somehost.com/parent.html"
    *
    * @version 0.0.0
    *
    * @example
    *
    *     // Example 1: Simple Asynchronous Requests From a Server
    *     
    *     var domID = 'rdt-1',
    *         rdtOptions = {
    *           hostURL: 'https://somehost.com'
    *         },
    *         rdt = new FAMRDT(domID, rdtOptions);
    *
    *     rdt.post('/users', {
    *       firstName: 'Bob',
    *       lastName: 'Barker'
    *     }, postCallback);
    *     function postCallback(error, data) {}
    * 
    *     rdt.get('/users/1', getCallback);
    *     function getCallback(error, data) {}
    *         
    *     rdt.put('/users/1', {
    *       firstName: 'Spongebob',
    *       lastName: 'Squarepants'
    *     }, putCallback);
    *     function putCallback(error, data) {}
    *         
    *     rdt.destroy('/users/1', destroyCallback);
    *     function destroyCallback(error, data) {}
    *
    * @example
    *
    *     // Example 2a: Simple Remote Procedure Calls; parent.html setup
    * 
    *     var domID = 'rdt-1',
    *         rdtOptions = {
    *           childURL: 'https://somehost.com/child.html',
    *           localFunctions: {
    *             alertConsole: function(message) {
    *               // Return for synchronous methods.
    *               console.log('ALERT!!!: ' + message);
    *             }
    *           }
    *         },
    *         rdt = new FAMRDT(domID, rdtOptions);
    *         
    * @example
    *
    *     // Example 2b: Simple Remote Procedure Calls; child.html setup
    *
    *     var domID = 'rdt-1', // MUST match parent domID!
    *         rdtOptions = {
    *           remoteFunctions: [
    *             'alertConsole'
    *           ],
    *         },
    *         rdt = new FAMRDT(domID, rdtOptions); 
    *     
    *     rdt.rpc.alertConsole("This should display in the parent's console!");
    * 
    * @example
    *
    *     // Example 3a: Simple Remote Procedure Calls; parent.html setup
    * 
    *     var domID = 'rdt-1',
    *         rdtOptions = {
    *           childURL: 'https://otherhost.com/child.html'
    *         },
    *         rdt = new FAMRDT(domID, rdtOptions);
    *         
    * @example
    *
    *     // Example 3b: Simple Remote Procedure Calls; child.html setup
    *
    *     var domID = 'rdt-1', // MUST match parent domID!
    *         rdtOptions = {
    *           hostURL: 'https://somehost.com'
    *         },
    *         rdt = new FAMRDT(domID, rdtOptions);
    *     
    *     rdt.rpc.post('/users', {
    *       firstName: 'Bob',
    *       lastName: 'Barker'
    *     }, postCallback);
    *     function postCallback(error, data) {}
    * 
    *     rdt.rpc.get('/users/1', getCallback);
    *     function getCallback(error, data) {}
    *         
    *     rdt.rpc.put('/users/1', {
    *       firstName: 'Spongebob',
    *       lastName: 'Squarepants'
    *     }, putCallback);
    *     function putCallback(error, data) {}
    *         
    *     rdt.rpc.destroy('/users/1', destroyCallback);
    *     function destroyCallback(error, data) {}
    * 
    *     
  */

  return function FAMRDT(options) {

    // TODO: Validate Options
    
    /*
      Initialize FAMRDT
     */

    initialize();

    /* 
      Private Instance Variables:
      These variables are available to all functions and closures within the entire class via hoisting.
    */

    var easyXDM = initializeEasyXDM(),
        rpc = initializeRPC();

    /* 
      Public References
    */

    this.rpc = rpc;
    this.easyXDM = easyXDM;

    /*
      Public Functions
    */
    
    this.get = get;
    this.post = post;
    this.put = put;
    this.destroy = destroy;

    /*
      Private Functions
    */
   
    function initialize() {
      initializeEasyXDM();
    }
   
    function initializeEasyXDM() {
      // easyXDM is defined by Require.js in at the top of the document
      // This overrides that pointer with the noConflict provided easyXDM object, but remains in the same scope
      return requireEasyXDM.noConflict(options.name);
    }

    function initializeRPC() {
      if (options.iFrameURL) {
        return initializeRemoteRPC(options);
      } else {
        return initializeLocalRPC(options);
      }
    }

    function initializeLocalRPC() {
      return new easyXDM.Rpc({
          remote: options.hostURL + "/cors/"
        }, {
          local: options.localFunctions,
          remote: {
            request: {}
          }
        }
      );
    }

    function initializeRemoteRPC() {
      var remoteFunctions = {};
      for(var i in options.remoteFunctions){
        remoteFunctions[i] = {};
      }
      return new easyXDM.Rpc({
          remote: options.iFrameURL
        }, {
          remote: remoteFunctions
        }
      );
    }

    /**
    * **Description:**
    *
    * Makes get calls to the server specified in the rooURL
    * 
    * @method get
    * @param path {string}
    * @param get-requestCallback - A callback that runs after the request has completed
    * 
    * @example
    * var rdt = new FAMRDT({hostURL: hostURL});
    *
    * rdt.get(‘/campaigns/‘ + authToken, function(error, data) {
    *   // Callback
    * });
    * 
    * @callback get~requestCallback
    * @param {object} error
    * @param {object} data
    **/

    function get(urlPath, callback) {
      rpc.request({
        method: 'GET',
        url: urlPath
      }, callback);
    }

    /**
    * **Description:**
    *
    * Makes a DELETE call to the server specified in the hostURL.
    *
    * NOTE: "delete" is a reserved term in Javascript, forcing the naming of this method to "destroy".
    *
    * @param path {string}
    * @param destroy-requestCallback - A callback that runs after the request has completed
    * 
    * @example
    * var rdt = new FAMRDT({hostURL: hostURL});
    *
    * rdt.destroy(‘/campaigns/‘ + authToken, function(error, data) {
    *   // Callback
    * });
    * @callback destroy~requestCallback
    * @param {object} error
    * @param {object} data
    **/

    function destroy(url, callback) {
      rpc.request({
        method: 'DELETE',
        url: url
      }, callback);
    }

    /**
    * **Description:**
    *
    * Makes post calls to the server specified in the rooURL
    *
    * @param path {string}
    * @param params {Object} The parameters to the post request
    * @param post-requestCallback - A callback that runs after the request has completed
    * 
    * @example
    * var rdt = new FAMRDT({hostURL: hostURL});
    *
    *   rdt.post(‘/user/‘ + authToken, { 8yy
    *       firstName: ’something’,
    *       lastName: ’somethingelse’,
    *     },
    *     function(error, data) {
    *       // Callback
    *     }
    *   );
    *
    * @callback post~requestCallback
    * @param {object} error
    * @param {object} data
    **/

    function post(url, params, callback) {
      rpc.request({
        method: 'POST',
        data: params,
        url: url
      }, callback);
    }

    /**
    * **Description:**
    *
    * Makes update calls to the server specified in the rooURL
    *
    * @param path {string}
    * @param params {Object} The parameters to the post request
    * @param update-requestCallback - A callback that runs after the request has completed
    * 
    * @example
    * var rdt = new FAMRDT({hostURL: hostURL});
    *
    *   rdt.post(‘/user/‘ + authToken, { 8yy
    *       firstName: ’something’,
    *       lastName: ’somethingelse’,
    *     },
    *     function(error, data) {
    *       // Callback
    *     }
    *   );
    *
    * @callback update~requestCallback
    * @param {object} error
    * @param {object} data
    **/

    function put(url, params, callback) {
      rpc.request({
        method: 'PUT',
        data: params,
        url: url
      }, callback);
    }
  };
});
