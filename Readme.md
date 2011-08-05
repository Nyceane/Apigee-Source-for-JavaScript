# Apigee Source
APIs are awesome, but they could be easier to begin using. Authentication often gets in the way, wrapping up the simple patterns of REST in with the complications of OAuth.

This is why we built [Apigee Source](http://blog.apigee.com/detail/apigee_source_twitter_api/) and a [client library](http://apigee.github.com/Apigee-Source-for-JavaScript/) that makes it easy to get started. Right now, this only works with the Twitter API and JavaScript, but we'll be rolling out support for other APIs and languages soon.

## How To Use It
The setup process for [Apigee Source](https://apigee.com/source) will guide you through creating and configuring an application endpoint for use with Twitter. Then, you can provision users using the Apigee APIs.

For every user of your application, Apigee will create a SmartKey. This simple secret can then be appended to any API request, for example:
    https://sourcesample-api.apigee.com/v1/twitter/1/statuses/home_timeline.json?smartkey=345ae44d-c681-4856-8865-9fe789509ad8

## Getting Started - Quick Start Guide:
1. Set up an application endpoint at [https://apigee.com/source]( https://apigee.com/source "Apigee Source")
    * Name your application endpoint
    * Create an app at twitter and provide the consumer key/secret to Apigee Source
2. Download the javascript library from GitHub.
3. Edit the included sample html app  examples/twitter/home_timeline.html
    * Change the appName on line 124 your application endpoint name.
4. Upload your home_timeline.html app to a webserver.
    * Sorry, this currently doesn't work with JSBin or from your local filesystem (we are working on it though)
5. Create a new end user for your Source application using the home_timeline.html app.
    * *Note:* use a test username/password, not your twitter username/password
6. Complete the OAuth dance with Twitter and authorize this application and user to access your twitter home_timeline.
7. Explore other method calls and be excited about how Apigee Source simplifies Oauth.
8. Give us your [feedback](mailto://source@apigee.com "Send Feedback") on what you'd like to see in Source.

## What's happening under the hood?
Essentially, an Apigee API Gateway is mediating SmartKey-signed requests to OAuth. As more providers are added, this will make it so that all APIs can be interacted with one, simple mechanism. This diagram illustrates [how the OAuth dance is delegated](https://docs.google.com/drawings/pub?id=1CPCIa8t8lqHnbI1EQDVIWSxAJINLiysNasU55xHrmnA&w=903&h=961) so that adding and authenticating new users becomes simple.

##Get in Touch
This is still an Apigee Labs feature, so we want to hear from you about your experience with it. Please send any feedback to [source@apigee.com](mailto:source@apigee.com).