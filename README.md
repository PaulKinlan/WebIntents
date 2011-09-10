Web Intents
===========

Web Intents is a discovery mechanism and extremely light-weight RPC system between web apps, modeled after the similarly-named system in Android.  An Intent is an action to be performed by a provider.  Intents provides a declarative syntax that allows providers to list the Intents they handle and a registration system that enumerates available providers.  A client requests an Intent be handled, the User Agent allows the user to select which provider to use, and the provider performs the action of the Intent, possibly using data passed as input in the Intent.  The provider may return data as output to the client.

Usage
=====

To use today
------------
No browsers currently support this API natively.  To use this system simple drop the following code in to your site:

    <script src="http://webintents.org/webintents.min.js"></script>

When browsers start to implement this natively the Shim will defer all its functionality to the native interface.

Declaration
-----------

To register your service application to be able to handle image sharing simply declare an intent tag.

    <intent 
      action="http://webintents.org/share"
      type="image/*" />

This will register the current page's ability to share images. 

Invocation
----------

To build a client application that can use the share functionality, it is as simple as using the following code: 

    var intent = new Intent(
        "http://webintents.org/share", 
        "image/*", 
        "http://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Three_jolly_kittens.png/800px-Three_jolly_kittens.png" 
    );
    window.navigator.startActivity(intent);

Service
-------

When a service is invoked via startActivity, the "intent" object on window will be populated with the data provided by the client.

    window.intent

That's it.

To send data back to the client that invoked it, it is as simple as calling postResult() on the intent.

    window.intent.postResult("something cool");

Examples
========

To run the examples:

    ./run.sh start

Navigate to http://0.0.0.0:8000/

To stop the example server:

    ./run.sh stop

Tests
=====

To run the tests:

    python -m SimpleHTTPServer

Navigate to: http://0.0.0.0:8000/SpecRunner.html

