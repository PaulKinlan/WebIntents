Web Intents
===========

Web Intents is a discovery mechanism and extremely light-weight RPC system between web apps, modeled after the similarly-named system in Android.  An Intent is an action to be performed by a provider.  Intents provides a declarative syntax that allows providers to list the Intents they handle and a registration system that enumerates available providers.  A client requests an Intent be handled, the User Agent allows the user to select which provider to use, and the provider performs the action of the Intent, possibly using data passed as input in the Intent.  The provider may return data as output to the client.

Usage
=====

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
        { uris["http://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Three_jolly_kittens.png/800px-Three_jolly_kittens.png"] 
    });
    window.navigator.startActivity(intent);

You can even use a FORM so you don't have to do any coding.

    <form method="intent" action="http://webintents.org/share" enctype="image/*">
       <input name="uris" type="file" accepts="image/*" />
       <input type="submit" />
    </form>


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

