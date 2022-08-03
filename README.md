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


## Connect Options

| Option | Description                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| overlay     | Changes the overlay color where the Connect modal is displayed (only for iframe, defaults to rgba(0,0,0,0.8))                           |
| selector    | CSS selector in which Connect should be embedded to. Connect will expand to fill the container's dimensions, the element's position must not be `static`. Connect will be displayed in a modal by default                                                                                                         | 
| node        | Element in which Connect should be embedded to. Connect will expand to fill the container's dimensions, the element's position must not be `static`. Connect will be displayed in a modal by default                                                                                                         | 
| popup       | Indicates if Connect should be displayed in a popup (defaults to false)                                                                 |
| popupOptions| Used to configure the popup's width/height and positioning (top/left)                                                                   |

