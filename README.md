Web Intents
===========

Web Intents is a discovery mechanism and extremely light-weight RPC system between web apps, modeled after the similarly-named system in Android.  An Intent is an action to be performed by a provider.  Intents provides a declarative syntax that allows providers to list the Intents they handle and a registration system that enumerates available providers.  A client requests an Intent be handled, the User Agent allows the user to select which provider to use, and the provider performs the action of the Intent, possibly using data passed as input in the Intent.  The provider may return data as output to the client.

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

