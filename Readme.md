# Apigee Source
APIs are awesome, but they could be easier to begin using. Authentication often gets in the way, wrapping up the simple patterns of REST in with the complications of OAuth.

This is why we built [Apigee Source](http://blog.apigee.com/detail/apigee_source_twitter_api/) and a [client library](http://apigee.github.com/Apigee-Source-for-JavaScript/) that makes it easy to get started. Right now, this only works with the Twitter API and JavaScript, but we'll be rolling out support for other APIs and languages soon.

## How To Use It
The setup process for [Apigee Source](https://apigee.com/source) will guide you through creating and configuring an application endpoint for use with Twitter. Then, you can provision users using the Apigee APIs.

For every user of your application, Apigee will create a SmartKey. This simple secret can then be appended to any API request, for example:
    https://sourcesample-api.apigee.com/v1/twitter/1/statuses/home_timeline.json?smartkey=345ae44d-c681-4856-8865-9fe789509ad8

## What's happening under the hood?
Essentially, an Apigee API Gateway is mediating SmartKey-signed requests to OAuth. As more providers are added, this will make it so that all APIs can be interacted with one, simple mechanism. This diagram illustrates [how the OAuth dance is delegated](https://docs.google.com/drawings/pub?id=1CPCIa8t8lqHnbI1EQDVIWSxAJINLiysNasU55xHrmnA&w=903&h=961) so that adding and authenticating new users becomes simple.

##Get in Touch
This is still an Apigee Labs feature, so we want to hear from you about your experience with it. Please send any feedback to [source@apigee.com](mailto:source@apigee.com).