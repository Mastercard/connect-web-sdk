# Mastercard Open Banking Connect Web SDK

## Overview

The Mastercard Open Banking Connect Web SDK provides an easy way for developers to integrate Mastercard Open Banking Connect into their web application. It supports both the embedded experience via iframe or through a popup window.

## Installing

```bash
npm install connect-web-sdk
```

## Usage

### Embedded Experience
```typescript
import { Connect, ConnectEventHandlers, ConnectOptions, ConnectDoneEvent, ConnectCancelEvent, ConnectErrorEvent, ConnectRouteEvent } from 'connect-web-sdk';

export class ConnectComponent {
  
  connectEventHandlers: ConnectEventHandlers = {
    onDone: (event: ConnectDoneEvent) => { console.log(event); },
    onCancel: (event: ConnectCancelEvent) => { console.log(event); },
    onError: (event: ConnectErrorEvent) => { console.log(event); },
    onRoute: (event: ConnectRouteEvent) => { console.log(event); },
    onUser: (event: any) => { console.log(event); },
    onLoad: () => { console.log('loaded'); }
  };

  connectOptions: ConnectOptions = {
    overlay: 'rgba(199,201,199, 0.5)'
  };

  constructor() {
    Connect.launch(
      'CONNECT_URL',
     this.connectEventHandlers,
     this.connectOptions);
  }
}
```

### Popup Experience
```typescript
import { Connect, ConnectEventHandlers, ConnectOptions, ConnectDoneEvent, ConnectCancelEvent, ConnectErrorEvent, ConnectRouteEvent } from 'connect-web-sdk';

export class ConnectComponent {
  
  connectEventHandlers: ConnectEventHandlers = {
    onDone: (event: ConnectDoneEvent) => { console.log(event); },
    onCancel: (event: ConnectCancelEvent) => { console.log(event); },
    onError: (event: ConnectErrorEvent) => { console.log(event); },
    onRoute: (event: ConnectRouteEvent) => { console.log(event); },
    onUser: (event: any) => { console.log(event); },
    onLoad: () => { console.log('loaded'); }
  };

  connectOptions: ConnectOptions = {
    popup: true,
    popupOptions: {
      width: 600,
      height: 600,
      top: window.top.outerHeight / 2 + window.top.screenY - (600 / 2),
      left: window.top.outerWidth / 2 + window.top.screenX - (600 / 2)
    }
  };

  constructor() {
    Connect.launch(
      'CONNECT_URL',
     this.connectEventHandlers,
     this.connectOptions);
  }
}
```

## Connect Event Handlers

| Event Type | Description                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| onLoad     | Called when the Connect web page is loaded and ready to display                                                                         |
| onDone     | Called when the user successfully completes the Connect application                                                                     |
| onCancel   | Called when the user cancels the Connect application                                                                                    |
| onError    | Called when an error occurs while the user is using the Connect                                                                         |
| onRoute    | Called with the user is navigating through the screens of the Connect application                                                       |
| onUser     | Called when a user performs an action. User events provide visibility into what action a user could take within the Connect application |
| onUrl      | Called when a URL event is triggered from the Connect application. If provided, the SDK will not handle URL events automatically, and clients must manage the logic themselves. If not provided, the SDK will handle URL events by default. The default SDK behavior remains unchanged if the onUrl handler isn't supplied. |

#### Configuring your onUrl handler
To customize how URL events are handled in your application, you can provide an onUrl handler in your Connect Event handlers. When provided, this handler gives you full control over how URLs are opened and closed, rather than relying on the SDK's default popup behavior.

Here is an example of implementing a custom onUrl handler:
```typescript
connectEventHandlers: ConnectEventHandlers = {
  onDone: (event: ConnectDoneEvent) => { console.log(event); },
  onCancel: (event: ConnectCancelEvent) => { console.log(event); },
  onError: (event: ConnectErrorEvent) => { console.log(event); },
  onRoute: (event: ConnectRouteEvent) => { console.log(event); },
  onUser: (event: any) => { console.log(event); },
  onLoad: () => { console.log('loaded'); },
  onUrl: (type, url) => {
    if (type === 'OPEN' && url) {
      console.log(`Opening URL: ${url}`);
      // Custom logic to open a URL
      window.open(url, 'targetWindow', 'width=600,height=600');
    } else if (type === 'CLOSE') {
      console.log('Closing popup');
      // Custom logic to close popup
      window.close()
    }
  }
};

Connect.launch(connectURL, connectEventHandlers, connectOptions);
```

- The onUrl handler accepts two parameters:
  - `type`: A string literal that can be either 'OPEN' or 'CLOSE'
    - 'OPEN': Indicates that a URL should be opened
    - 'CLOSE': Indicates that a URL event should be closed
  - `url`: An optional string parameter that is only present when type is 'OPEN'. This represents the URL to be opened.

  > **Please Note**: If you provide a handler for the onUrl event, you must manage popups gracefully yourself. The Connect SDK will not handle popups for you if this handler is provided. Only provide a handler for this event if you want to diverge from the default behavior.

## Connect Options

| Option | Description                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| overlay     | Changes the overlay color where the Connect modal is displayed (only for iframe, defaults to rgba(0,0,0,0.8))                           |
| selector    | CSS selector in which Connect should be embedded to. Connect will expand to fill the container's dimensions, the element's position must not be `static`. Connect will be displayed in a modal by default                                                                                                         | 
| node        | Element in which Connect should be embedded to. Connect will expand to fill the container's dimensions, the element's position must not be `static`. Connect will be displayed in a modal by default                                                                                                         | 
| popup       | Indicates if Connect should be displayed in a popup (defaults to false)                                                                 |
| popupOptions| Used to configure the popup's width/height and positioning (top/left)                                                                   |
| redirectUrl | The URL to redirect back to your mobile app after completing an FI’s OAuth flow (universal link on iOS, app link on Android). This parameter is only required for App to App.                                                                   |


#### Configuring your redirectUrl
In order to return control back to your application after a customer completes an FI’s OAuth flow, you must specify a redirectUrl value. This URL is used to redirect back to your mobile app after completing an FI’s OAuth flow (this should be a universal link on iOS or an app link on Android). Please note: This is only applicable for App to App

Here is an example of a universal link redirectUrl within your code:
```
connectOptions: ConnectOptions = {
  popup: true,
  popupOptions: {
    width: 600,
    height: 600,
    top: window.top.outerHeight / 2 + window.top.screenY - (600 / 2),
    left: window.top.outerWidth / 2 + window.top.screenX - (600 / 2)
  },
  redirectUrl = "https://youruniversallink.com";
};

Connect.launch(connectURL, connectEventHandlers, connectOptions );
```


### Cleanup
When the user of your application is finished with Connect you need to make sure to clean up the Connect instance by calling the destroy method. For example, if you have a ReactJS application you would call destroy in the unmount of your component.

```TypeScript
Connect.destroy()
```