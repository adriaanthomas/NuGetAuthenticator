# NuGet Authenticator

Provides an easy way to authenticate to an external NuGet feed.

While Visual Studio Team Services provides [package management](https://marketplace.visualstudio.com/items?itemName=ms.feed)
to host NuGet feeds, not every company is able to use that straight away. For people that use some external NuGet server,
usually some credentials are required. This extension provides an easy way to set those.

## How it works

An existing `NuGet.config` file is modified, so that username and password are added for a specific feed. Internally,
this is done using NuGet: `nuget sources Update -ConfigFile <configFile> -Name <feedName> -UserName <userName> -Password <password>`.
