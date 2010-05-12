XhrIoServer
===========

#### A helper for testing Google Closure's XhrIo requests ####

XhrIoServer is a javascript class built off of Closure Library.  If you're
developing an application using Google Closure Library, it can be quite
difficult to test AJAX requests that utilize the XhrIo class.  With XhrIoServer
and (XhrIoRequest) you can simulate a server that will intercept all requests
from XhrIo and respond to them accordingly.

### Closure Library ###

Closure Library is a powerful, low level JavaScript library designed
for building complex and scalable web applications. It is used by many
major Google web applications, such as Gmail and Google Docs.

For more information about Closure Library, visit:
http://code.google.com/closure/library

Sample Usage
------------

    // Install the server to get a server instance.
    var server = new ezpub.testing.XhrIoServer(true);

    // Run stuff that make requests via XhrIo...

    // Get the last request.
    var request = server.popRequest();
    // Examine the request (see {ezpub.testing.XhrIoRequest})
    assertEquals('Data should match',
        'Mike', request.getDataQuery().get('name'));
    // Simulate a reason
    request.getXhrIo().simulateResponse(200, 'ok');
