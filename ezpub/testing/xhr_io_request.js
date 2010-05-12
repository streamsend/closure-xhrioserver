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
 * @fileOverview A class that represents an XhrIo request.
 */

goog.provide('ezpub.testing.XhrIoRequest');
goog.provide('ezpub.testing.XhrIoRequest.Method');

goog.require('goog.Uri.QueryData');



/**
 * Class for keeping track of an XhrIo request made by {goog.testing.net.XhrIo}.
 *
 * @param {string} url The url of the request.
 * @param {string} method The method of the request.
 * @param {content} content The raw content of the request.
 * @param {headers} headers The headers of the request.
 * @param {goog.net.XhrIo} xhr The XhrIo instance of the request.
 * @constructor
 */
ezpub.testing.XhrIoRequest = function(url, method, content, headers, xhr) {
  this.url_       = url;
  this.rawMethod_ = method;
  this.method_    = ('' + method).toUpperCase();
  this.content_   = content;
  this.headers_   = headers;
  this.xhr_       = xhr;
};


/**
 * An enum of all possible request methods.
 * @enum {string}
 */
ezpub.testing.XhrIoRequest.Method = {
  POST: 'POST',
  GET : 'GET'
};


/**
 * A helper method to determine if the request is a POST request.
 *
 * @return {boolean} True if the request is a POST, false otherwise.
 */
ezpub.testing.XhrIoRequest.prototype.isPost = function() {
  return this.method_ == ezpub.testing.XhrIoRequest.Method.POST;
};


/**
 * A helper method to determine if the request is a GET request.
 *
 * @return {boolean} True if the request is a GET, false otherwise.
 */
ezpub.testing.XhrIoRequest.prototype.isGet = function() {
  return !goog.isDef(this.rawMethod_) ||
      this.method_ == ezpub.testing.XhrIoRequest.Method.GET;
};


/**
 * Returns the url of the request.
 *
 * @return {string} The url of the request.
 */
ezpub.testing.XhrIoRequest.prototype.getUrl = function() {
  return this.url_;
};


/**
 * Returns the raw content of the request.
 *
 * @return {string} The raw content of the request.
 */
ezpub.testing.XhrIoRequest.prototype.getRawContent = function() {
  return this.content_;
};


/**
 * Returns the headers of the request.
 *
 * @return {string} The headers of the request.
 */
ezpub.testing.XhrIoRequest.prototype.getHeaders = function() {
  return this.headers_;
};


/**
 * Returns a {goog.Uri.QueryData} object for the request's content.
 *
 * @return {goog.Uri.QueryData} The query data for the request.
 */
ezpub.testing.XhrIoRequest.prototype.getQueryData = function() {
  if (!goog.isDef(this.queryData_)) {
    this.queryData_ = new goog.Uri.QueryData(this.content_);
  }
  return this.queryData_;
};


/**
 * Returns the original testing XhrIo instance that made the request.
 *
 * @return {goog.testing.net.XhrIo} The testing XhrIo instance.
 */
ezpub.testing.XhrIoRequest.prototype.getXhrIo = function() {
  return this.xhr_;
};
