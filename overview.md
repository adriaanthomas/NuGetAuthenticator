# NuGet Authenticator

Provides an easy way to authenticate to an external NuGet feed.

While Visual Studio Team Services provides [package management](https://marketplace.visualstudio.com/items?itemName=ms.feed)
to host NuGet feeds, not every company is able to use that straight away. For people that use some external NuGet server,
usually a username and password are required. This extension provides an easy way to set those for a specific feed, without
storing these credentials in version control.

## Usage

![screenshot](SetCredentialsTask.png)

Specify the same `NuGet.config` file as for the _NuGet Installer_ task. This file will be modified in-place, so that it also
contains the specified user name and password, for the given feed. The password will be encrypted by NuGet.

It is **strongly** recommended to store the password in a secret variable, so that it is stored securely on Visual Studio Team
Services. Only this way will the password not be logged in the task output, nor appear in the build or release history.

## How it works

An existing `NuGet.config` file is modified, so that username and password are added for a specific feed. Internally,
this is done using NuGet: `nuget sources Update -ConfigFile <configFile> -Name <feedName> -UserName <userName> -Password <password>`.

It is of course easy to run that command on a command-line task, but that requires a `nuget.exe` to be installed at a predictable
path on the build server. Also, how to run the above command differs slightly on non-Windows build agents, and not all
NuGet versions behave the same way (e.g. NuGet 3.3.0 significantly changes the config file). This task takes care of all these
points.

While a private build server might solve these problems using a
[credential provider](http://docs.nuget.org/ndocs/api/credential-providers) and storing the actual credentials somewhere safe,
for hosted build agents this is not so easy.

## Safety of the provided credentials

Users should be aware of the following points:

*   Setting the password should always be done using a
    [secret variable](https://www.visualstudio.com/en-us/docs/build/define/variables#secret-variables).
*   The password will be encrypted by NuGet and written to disk on the build agent.
