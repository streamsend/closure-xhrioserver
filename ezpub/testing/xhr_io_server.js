// Copyright 2010 EZ Publishing, Inc. All Rights Reserved
// Author: Ngan Pham (npham@ezpublishing.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileOverview A class to help test XhrIo requests.  Once installed, it will
 * keep track of all requests as if they were sent to a live server.
 *
 * Usage:
 *
 * // Install the server to get a server instance.
 * var server = new ezpub.testing.XhrIoServer(true);
 *
 * // Run tests that make requests via XhrIo...
 *
 * // Get the last request.
 * var request = server.popRequest();
 * // Examine the request (see {ezpub.testing.XhrIoRequest})
 * assertEquals('Data should match',
 *     'Mike', request.getDataQuery().get('name'));
 * // Simulate a reason
 * request.getXhrIo().simulateResponse(200, 'ok');
 */

goog.provide('ezpub.testing.XhrIoServer');

goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.testing.recordConstructor');
goog.require('goog.testing.TestQueue');
goog.require('goog.testing.net.XhrIo');
goog.require('goog.net.EventType');
goog.require('goog.net.XmlHttp.ReadyState');
goog.require('goog.net.XhrIo');
goog.require('goog.structs.Queue');

goog.require('ezpub.testing.XhrIoRequest');


/**
 * Class for the XhrIo server.
 *
 * @constructor
 */
ezpub.testing.XhrIoServer = function(opt_install) {
  if (opt_install) {
    this.install();
  }
};
goog.inherits(ezpub.testing.XhrIoServer, goog.Disposable);


/**
 * The original goog.net.XhrIo class.
 *
 * @private
 */
ezpub.testing.XhrIoServer.originalXhrIo_ = null;


/**
 * The original goog.testing.net.XhrIo class.
 *
 * @private
 */
ezpub.testing.XhrIoServer.originalTestXhrIo_ = null;


/**
 * A flag to keep track of whether or not the server has been installed.
 *
 * @private
 */
ezpub.testing.XhrIoServer.installed_ = false;


/**
 * A test queue to keep track of all transactions from XhrIo.
 *
 * @prviate
 */
ezpub.testing.XhrIoServer.testQueue_ = null;


/**
 * A queue to fall requests.
 *
 * @private
 */
ezpub.testing.XhrIoServer.requestQueue_ = null;


/**
 * Reset the server discarding all transaction records.
 */
ezpub.testing.XhrIoServer.prototype.reset = function() {
  if (ezpub.testing.XhrIoServer.installed_) {
    ezpub.testing.XhrIoServer.testQueue_.clear();
    ezpub.testing.XhrIoServer.requestQueue_.clear();
  }
};


/**
 * Pop a request from the queue.  The requests are popped in the order that
 * they are added to the queue.  If no request was found, null will be
 * returned.
 *
 * @return {ezpub.testing.XhrIoRequest} A request object.
 */
ezpub.testing.XhrIoServer.prototype.popRequest = function() {
  if (!ezpub.testing.XhrIoServer.installed_) {
    throw('XhrIoServer not installed');
  }

  var request = null;

  if (!ezpub.testing.XhrIoServer.requestQueue_.isEmpty()) {
    request = ezpub.testing.XhrIoServer.requestQueue_.dequeue();
  }

  return request;
};


/**
 * Install the server code.  This essentially replaces {goog.net.XhrIo} with
 * {goog.testing.net.XhrIo}.
 */
ezpub.testing.XhrIoServer.prototype.install = function() {
  if (!ezpub.testing.XhrIoServer.installed_) {
    // Create a new test queue for the server.
    ezpub.testing.XhrIoServer.testQueue_ = new goog.structs.Queue();
    ezpub.testing.XhrIoServer.requestQueue_ = new goog.structs.Queue();

    // Save the original goog.testing.net.XhrIo.
    ezpub.testing.XhrIoServer.originalTestXhrIo_ = goog.testing.net.XhrIo;

    // Replace goog.testing.net.XhrIo complete with our new XhrIo.
    goog.testing.net.XhrIo = this.createMockXhrIo_(
        ezpub.testing.XhrIoServer.originalTestXhrIo_);

    // Replace the original goog.net.XhrIo.
    ezpub.testing.XhrIoServer.originalXhrIo_ = goog.net.XhrIo;
    goog.net.XhrIo = goog.testing.net.XhrIo;

    ezpub.testing.XhrIoServer.installed_ = true;
  } else {
    throw('Only one instance of XhrIoServer can be installed');
  }
};


ezpub.testing.XhrIoServer.prototype.createMockXhrIo_ = function(originalTestXhrIo) {
  // A new constructor to replace goog.testing.net.XhrIo.
  var newXhrIo = goog.bind(function() {
    // Make the original goog.testing.net.XhrIo object but set the test queue.
    var xhrIo = new ezpub.testing.XhrIoServer.originalTestXhrIo_(
        ezpub.testing.XhrIoServer.testQueue_);

    // Listen for ready state changes to be able to tell when requests are being made.
    xhrIo.addEventListener(goog.net.EventType.READY_STATE_CHANGE,
        goog.bind(this.handleReadyStateChange_, this));

    return xhrIo;
  }, this);

  // Copy prototype and class methods from the original goog.testing.net.XhrIo.
  newXhrIo.prototype = ezpub.testing.XhrIoServer.originalTestXhrIo_.prototype;
  goog.mixin(newXhrIo, ezpub.testing.XhrIoServer.originalTestXhrIo_);

  return newXhrIo;
};


/**
 * Uninstall the server code (undos what install did).
 */
ezpub.testing.XhrIoServer.prototype.uninstall = function() {
  if (ezpub.testing.XhrIoServer.installed_) {
    // Restore the original goog.net.XhrIo.
    goog.net.XhrIo = ezpub.testing.XhrIoServer.originalXhrIo_;
    ezpub.testing.XhrIoServer.originalXhrIo_ = null;

    // Restore the original goog.testing.net.XhrIo.
    goog.testing.net.XhrIo = ezpub.testing.XhrIoServer.originalTestXhrIo_;
    ezpub.testing.XhrIoServer.originalTestXhrIo_ = null;

    // Delete the test queue.
    delete ezpub.testing.XhrIoServer.testQueue_;
    delete ezpub.testing.XhrIoServer.requestQueue_;

    ezpub.testing.XhrIoServer.installed_ = false;
  }
};


/**
 * The handler function to record request transactions.
 *
 * @private
 */
ezpub.testing.XhrIoServer.prototype.handleReadyStateChange_ = function(event) {
  // If the XhrIo's ready state is LOADING, we know that the request has been
  // made.  Simply push the XhrIo object (the event's target) onto the array
  // of the head element in the queue.
  var xhrIo = event.target;

  if (xhrIo &&
      xhrIo.getReadyState() == goog.net.XmlHttp.ReadyState.LOADING &&
      !ezpub.testing.XhrIoServer.testQueue_.isEmpty()) {

    var requestAttrs = ezpub.testing.XhrIoServer.testQueue_.dequeue();
    var request = new ezpub.testing.XhrIoRequest(requestAttrs[1], requestAttrs[2],
        requestAttrs[3], requestAttrs[4], xhrIo);
    ezpub.testing.XhrIoServer.requestQueue_.enqueue(request);
  }
};


/**
 * Diposes the server by uninstalling it.
 *
 * @protected
 */
ezpub.testing.XhrIoServer.prototype.disposeInternal = function() {
  this.uninstall();

  ezpub.testing.XhrIoServer.superClass_.disposeInternal.call(this);
};
