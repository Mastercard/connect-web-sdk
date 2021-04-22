# Finicity Connect Web SDK
The Connect Web SDK allows you to embed Finicity Connect into an iframe launch it through a popup window. Either implementation method allows you to add with ease and provides a set of useful events (https://docs.finicity.com/connect-2-0-events-types/).

## Install

```bash
npm install @finicity/connect-web-sdk
```

## Usage

```typescript
import { FinicityConnect,  } from '@finicity/connect-web-sdk';

export class AppComponent {
  
  constructor() {
    FinicityConnect.launch('CONNECT_URL', {
      onDone: (event) => console.log('Done event', event),
      onCancel: (event) => console.log('Cancel event', event),
      onError: (event) => console.log('Error event', event),
      onUser: (event) => console.log('User event', event),
      onRoute: (event) => console.log('Route event', event),
      onLoad: (event) => console.log('Loaded event', event)
    });
  }
}
```

## API

### launch(url, eventHandlers, options)
Launches the Connect widget
- @url[String]: the connect URL
- @eventHandlers[ConnectEventHandlers]: an object that contains the different event handlers for the events sent by Connect
- @options[ConnectOptions]: an object that contains the different options to launch Connect

### destroy()
Destroys the Connect widget.

**NOTE:** Connect will destroy the iframe, only use if you must terminate the Connect session.