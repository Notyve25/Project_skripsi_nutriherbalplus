## GitHub Copilot Chat

- Extension: 0.37.6 (prod)
- VS Code: 1.109.3 (b6a47e94e326b5c209d118cf0f994d6065585705)
- OS: win32 10.0.19045 x64
- GitHub Account: Notyve25

## Network

User Settings:
```json
  "http.systemCertificatesNode": false,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: Error (1 ms): getaddrinfo ENOTFOUND api.github.com
- DNS ipv6 Lookup: Error (2 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): Error (85 ms): Error: net::ERR_INTERNET_DISCONNECTED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.emit (node:domain:489:12)
  [object Object]
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (15 ms): Error: getaddrinfo ENOTFOUND api.github.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (28 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14900:13
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at n._fetch (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4862:26169)
    at n.fetch (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4862:25817)
    at u (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4894:190)
    at CA.h (file:///c:/Users/ACER/AppData/Local/Programs/Microsoft%20VS%20Code/b6a47e94e3/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:116:41743)
  Error: getaddrinfo ENOTFOUND api.github.com
      at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: Error (2 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- DNS ipv6 Lookup: Error (1 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (26 ms)
- Electron fetch (configured): Error (3 ms): Error: net::ERR_INTERNET_DISCONNECTED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.emit (node:domain:489:12)
  [object Object]
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (23 ms): Error: getaddrinfo ENOTFOUND api.githubcopilot.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (25 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14900:13
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at n._fetch (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4862:26169)
    at n.fetch (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4862:25817)
    at u (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4894:190)
    at CA.h (file:///c:/Users/ACER/AppData/Local/Programs/Microsoft%20VS%20Code/b6a47e94e3/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:116:41743)
  Error: getaddrinfo ENOTFOUND api.githubcopilot.com
      at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: Error (1 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- DNS ipv6 Lookup: Error (2 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (5 ms)
- Electron fetch (configured): Error (4 ms): Error: net::ERR_INTERNET_DISCONNECTED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.emit (node:domain:489:12)
  [object Object]
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (14 ms): Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (17 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14900:13
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at n._fetch (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4862:26169)
    at n.fetch (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4862:25817)
    at u (c:\Users\ACER\.vscode\extensions\github.copilot-chat-0.37.6\dist\extension.js:4894:190)
    at CA.h (file:///c:/Users/ACER/AppData/Local/Programs/Microsoft%20VS%20Code/b6a47e94e3/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:116:41743)
  Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
      at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://mobile.events.data.microsoft.com: Error (5 ms): Error: net::ERR_INTERNET_DISCONNECTED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.emit (node:domain:489:12)
  [object Object]
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://dc.services.visualstudio.com: Error (3 ms): Error: net::ERR_INTERNET_DISCONNECTED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.emit (node:domain:489:12)
  [object Object]
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (13 ms): Error: getaddrinfo ENOTFOUND copilot-telemetry.githubusercontent.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (11 ms): Error: getaddrinfo ENOTFOUND copilot-telemetry.githubusercontent.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://default.exp-tas.com: Error (17 ms): Error: getaddrinfo ENOTFOUND default.exp-tas.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Number of system certificates: 61

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).