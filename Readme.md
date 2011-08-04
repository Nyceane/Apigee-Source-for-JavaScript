# Apigee Source
APIs are awesome, but they could be a whole lot easier to start using. Authentication often gets in the way—implementing OAuth shouldn't feel like scaling the Cliffs of Insanity.

This is why we built [Apigee Source](http://blog.apigee.com/detail/apigee_source_twitter_api/) and a [client library](http://apigee.github.com/Apigee-Source-for-JavaScript/) that makes it easy to get started. Right now, this only works with the Twitter API and JavaScript, but we'll be rolling out support for other APIs and languages soon.

## How it works
The setup process for Apigee Source will guide you through creating and configuring an application endpoint. Then, you can provision users using the Apigee APIs.

For every user of your application, Apigee will create a SmartKey. This simple secret can then be appended to any API request, for example:
    https://sourcesample-api.apigee.com/v1/twitter/1/statuses/home_timeline.json?smartkey=345ae44d-c681-4856-8865-9fe789509ad8

## What's happening under the hood?
