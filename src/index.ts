import 'core-js/stable/url';

import {
  IFRAME_ID,
  POPUP_WIDTH,
  POPUP_HEIGHT,
  CONNECT_POPUP_HEIGHT,
  CONNECT_POPUP_WIDTH,
  ACK_EVENT,
  CANCEL_EVENT,
  URL_EVENT,
  DONE_EVENT,
  ERROR_EVENT,
  PING_EVENT,
  WINDOW_EVENT,
  ROUTE_EVENT,
  USER_EVENT,
  STYLES_ID,
  CONNECT_SDK_VERSION,
  CLOSE_POPUP_EVENT,
  PLATFORM_POPUP,
  PLATFORM_IFRAME,
} from './constants';

let evHandlers: ConnectEventHandlers;
let onMessageFn: any;
let connectUrl: string;
let iframe: any;
let metaEl: any;
let targetWindow: Window;
let connectOrigin: string;
let popupWindow: Window | null;

export interface ConnectEventHandlers {
  onDone: (event: ConnectDoneEvent) => void;
  onCancel: (event: ConnectCancelEvent) => void;
  onError: (event: ConnectErrorEvent) => void;
  onRoute?: (event: ConnectRouteEvent) => void;
  onUser?: (event: any) => void;
  onLoad?: () => void;
}

const defaultEventHandlers: any = {
  onLoad: () => {},
  onUser: (event: any) => {},
  onRoute: (event: ConnectRouteEvent) => {},
};

export interface ConnectProps {
  connectUrl: string;
  eventHandlers: ConnectEventHandlers;
  linkingUri?: string;
}

export interface ConnectCancelEvent {
  code: number;
  reason: string;
}

export interface ConnectErrorEvent {
  code: number;
  reason: string;
}

export interface ConnectDoneEvent {
  code: number;
  reason: string;
  reportData: [
    {
      portfolioId: string;
      type: string;
      reportId: string;
    }
  ];
}

export interface ConnectRouteEvent {
  screen: string;
  params: any;
}

export interface ConnectOptions {
  selector?: string;
  node?: Node;
  overlay?: string;
  popup?: boolean;
  popupOptions?: PopupOptions;
  redirectUrl?: string;
}

export interface PopupOptions {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}

interface Connect {
  destroy: () => void;
  launch: (
    url: string,
    eventHandlers: ConnectEventHandlers,
    options?: ConnectOptions
  ) => Window | null | void;
  initPostMessage: (options: ConnectOptions) => void;
  openPopupWindow: (url: string) => void;
  postMessage: (event: any) => void;
}

export const Connect: Connect = {
  destroy() {
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }

    if (metaEl && metaEl.parentNode) {
      metaEl.parentNode.removeChild(metaEl);
    }

    if (!iframe && targetWindow) {
      targetWindow.close();
    }

    iframe = undefined;
    metaEl = undefined;

    window.removeEventListener('message', onMessageFn);
  },

  launch(
    url: string,
    eventHandlers: ConnectEventHandlers,
    options: ConnectOptions = {}
  ) {
    connectUrl = url;
    evHandlers = { ...defaultEventHandlers, ...eventHandlers };
    connectOrigin = new URL(connectUrl).origin;

    if (options.popup) {
      const defaultPopupOptions = {
        toolbar: 'no',
        location: 'no',
        status: 'no',
        menubar: 'no',
        width: CONNECT_POPUP_HEIGHT,
        height: CONNECT_POPUP_WIDTH,
        top:
          window.self.outerHeight / 2 +
          window.self.screenY -
          CONNECT_POPUP_HEIGHT / 2,
        left:
          window.self.outerWidth / 2 +
          window.self.screenX -
          CONNECT_POPUP_WIDTH / 2,
      };
      const popupOptions = { ...defaultPopupOptions, ...options.popupOptions };
      const popupWindow = window.open(
        connectUrl,
        'targetWindow',
        `toolbar=${defaultPopupOptions.toolbar},location=${defaultPopupOptions.location},status=${defaultPopupOptions.status},menubar=${defaultPopupOptions.menubar},width=${popupOptions.width},height=${popupOptions.height},top=${popupOptions.top},left=${popupOptions.left}`
      );

      if (!popupWindow) {
        evHandlers.onError({ reason: 'error', code: 1403 });
      } else {
        targetWindow = popupWindow;
        popupWindow.focus();
        this.initPostMessage(options);
        evHandlers.onLoad && evHandlers.onLoad();
      }

      return popupWindow;
    } else {
      if (iframe && iframe.parentNode) {
        throw new Error(
          'You must destroy the iframe before you can open a new one. Call "destroy()"'
        );
      }

      if (!document.getElementById(STYLES_ID)) {
        const style = document.createElement('style');
        style.id = STYLES_ID;
        style.type = 'text/css';
        style.innerHTML = `#${IFRAME_ID} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          background: rgba(0,0,0,0.8);
        }`;
        document.getElementsByTagName('head')[0].appendChild(style);
      }

      let metaArray = document.querySelectorAll('meta[name="viewport"]');
      if (metaArray.length === 0) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=1');
        document.head.appendChild(metaEl);
      }

      iframe = document.createElement('iframe');

      iframe.src = connectUrl;
      iframe.setAttribute('id', IFRAME_ID);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('aria-label', 'Launching Modal');
      iframe.setAttribute('title', 'Launching Modal');

      // NOTE: update overlay
      if (options.overlay) {
        iframe.setAttribute('style', `background: ${options.overlay};`);
      }

      if (options.node) {
        options.node.appendChild(iframe);
      } else {
        // NOTE: attach to selector if specified
        const parentEl = !!options.selector
          ? document.querySelector(options.selector)
          : document.body;
        if (parentEl) {
          parentEl.appendChild(iframe);
        } else {
          console.warn(
            `Couldn't find any elements matching "${options.selector}", appending "iframe" to "body" instead.`
          );
          document.body.appendChild(iframe);
        }
      }

      iframe.onload = () => {
        targetWindow = iframe.contentWindow;
        this.initPostMessage(options);
        evHandlers.onLoad && evHandlers.onLoad();
      };

      return null;
    }
  },

  initPostMessage(options: ConnectOptions) {
    // NOTE: ping connect until it responds
    const intervalId = setInterval(() => {
      const data = {
        type: PING_EVENT,
        selector: options.selector,
        sdkVersion: CONNECT_SDK_VERSION,
        platform: `${options.popup ? PLATFORM_POPUP : PLATFORM_IFRAME}`,
      };
      if (options.redirectUrl) data['redirectUrl'] = options.redirectUrl;

      this.postMessage(data);
    }, 1000);

    onMessageFn = (event: any) => {
      const payload = event.data.data;
      const eventType = event.data.type;
      // NOTE: make sure it's Connect and not a bad actor
      if (event.origin === connectOrigin) {
        // NOTE: actively pinging connect while it's displayed in a popup allows us to recover the
        // session if the user refreshes the popup
        if (eventType === ACK_EVENT && !options.popup) {
          clearInterval(intervalId);
        } else if (eventType === URL_EVENT) {
          this.openPopupWindow(event.data.url);
        } else if (eventType === DONE_EVENT) {
          evHandlers.onDone(payload);
          this.destroy();
        } else if (eventType === CANCEL_EVENT) {
          evHandlers.onCancel(payload);
          this.destroy();
        } else if (eventType === ERROR_EVENT) {
          evHandlers.onError(payload);
          this.destroy();
        } else if (eventType === ROUTE_EVENT) {
          evHandlers.onRoute && evHandlers.onRoute(payload);
        } else if (eventType === USER_EVENT) {
          evHandlers.onUser && evHandlers.onUser(payload);
        } else if (eventType === CLOSE_POPUP_EVENT) {
          popupWindow?.close();
        }
      }
    };

    window.addEventListener('message', onMessageFn);
  },

  openPopupWindow(url: string) {
    const top =
      window.self.outerHeight / 2 + window.self.screenY - POPUP_HEIGHT / 2;
    const left =
      window.self.outerWidth / 2 + window.self.screenX - POPUP_WIDTH / 2;
    popupWindow = window.open(
      url,
      'targetWindow',
      `toolbar=no,location=no,status=no,menubar=no,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${top},left=${left}`
    );

    if (popupWindow) {
      popupWindow.focus();
      const intervalId = setInterval(() => {
        // clear itself if window no longer exists or has been closed
        if (popupWindow?.closed) {
          // window closed, notify connect
          clearInterval(intervalId);
          this.postMessage({
            type: WINDOW_EVENT,
            closed: true,
            blocked: false,
          });
        }
      }, 1000);
    } else {
      this.postMessage({
        type: WINDOW_EVENT,
        closed: true,
        blocked: true,
      });
    }
  },

  postMessage(data: any) {
    targetWindow?.postMessage(data, connectUrl);
  },
};
