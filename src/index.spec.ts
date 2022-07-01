import { Connect } from './index';

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
  PLATFORM_IFRAME,
  PLATFORM_POPUP,
  STYLES_ID,
  CONNECT_SDK_VERSION,
  CLOSE_POPUP_EVENT,
} from './constants';

const defaultPopupOptions = {
  width: CONNECT_POPUP_HEIGHT,
  height: CONNECT_POPUP_WIDTH,
  top:
    window.top.outerHeight / 2 + window.top.screenY - CONNECT_POPUP_HEIGHT / 2,
  left:
    window.top.outerWidth / 2 + window.top.screenX - CONNECT_POPUP_WIDTH / 2,
};

const url = 'http://test.com';
describe('Connect', () => {
  let mockWindow;
  beforeEach(() => {
    mockWindow = {
      close: jest.fn(),
      focus: jest.fn(),
      closed: false,
      postMessage: jest.fn(),
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
    Connect.destroy();
  });

  test('should apply iframe styles', () => {
    const styles = document.getElementById(STYLES_ID);
    expect(styles.id).toBe(STYLES_ID);
    expect(styles.innerHTML).toBe(`#${IFRAME_ID} {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      background: rgba(0,0,0,0.8);
    }`);
  });

  describe('destroy', () => {
    test('should remove iframe and meta elements', () => {
      const iframeStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      const metaStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      spyOn(document.head, 'appendChild').and.callFake(() => {});
      spyOn(document.body, 'appendChild').and.callFake(() => {});
      spyOn(window.document, 'createElement').and.callFake((element) =>
        element === 'iframe' ? iframeStub : metaStub
      );
      jest.spyOn(window, 'removeEventListener');
      Connect.launch(url, {
        onDone: () => {},
        onError: () => {},
        onCancel: () => {},
      });
      Connect.destroy();

      expect(iframeStub.parentNode.removeChild).toHaveBeenCalled();
      expect(metaStub.parentNode.removeChild).toHaveBeenCalled();
    });

    test('should remove postMessage event listener', () => {
      let onMessageFn;
      window.addEventListener = (cb) => {
        onMessageFn = cb;
      };
      jest.spyOn(window, 'removeEventListener');
      Connect.launch(url, {
        onDone: () => {},
        onError: () => {},
        onCancel: () => {},
      });
      Connect.destroy();
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'message',
        onMessageFn
      );
    });

    test('should close popup window', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      Connect.launch(
        url,
        { onDone: () => {}, onError: () => {}, onCancel: () => {} },
        { popup: true }
      );
      Connect.destroy();
      expect(mockWindow.close).toHaveBeenCalled();
    });
  });

  describe('launch', () => {
    test('should handle popup scenario with default options', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      const onLoad = jest.fn();
      spyOn(Connect, 'initPostMessage').and.callFake(() => {});
      Connect.launch(
        url,
        { onDone: () => {}, onError: () => {}, onCancel: () => {}, onLoad },
        { popup: true }
      );
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=no,location=no,status=no,menubar=no,width=720,height=520,top=24,left=252`
      );
      expect(onLoad).toHaveBeenCalled();
      expect(Connect.initPostMessage).toHaveBeenCalled();
    });

    test('should handle popup scenario with specified options', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      const popupOptions = {
        width: 100,
        height: 100,
        top: 200,
        left: 200,
      };
      const onLoad = jest.fn();
      spyOn(Connect, 'initPostMessage').and.callFake(() => {});
      Connect.launch(
        url,
        { onDone: () => {}, onError: () => {}, onCancel: () => {}, onLoad },
        { popup: true, popupOptions }
      );
      expect(onLoad).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=no,location=no,status=no,menubar=no,width=${popupOptions.width},height=${popupOptions.height},top=${popupOptions.top},left=${popupOptions.left}`
      );
      expect(Connect.initPostMessage).toHaveBeenCalled();
    });

    test('should return error event if popup failed to open', () => {
      spyOn(window, 'open').and.returnValue(undefined);
      const onError = jest.fn();
      Connect.launch(
        url,
        { onDone: () => {}, onError, onCancel: () => {} },
        { popup: true }
      );
      expect(window.open).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith({ reason: 'error', code: 1403 });
    });

    test('should handle iframe scenario with no overrides', () => {
      spyOn(document, 'querySelectorAll').and.callThrough();
      const iframeStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      const metaStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      spyOn(document.head, 'appendChild').and.callFake(() => {});
      spyOn(document.body, 'appendChild').and.callFake(() => {});
      spyOn(window.document, 'createElement').and.callFake((element) =>
        element === 'iframe' ? iframeStub : metaStub
      );
      const onLoad = jest.fn();
      spyOn(Connect, 'initPostMessage').and.callFake(() => {});
      Connect.launch(url, {
        onDone: () => {},
        onError: () => {},
        onCancel: () => {},
        onLoad,
      });
      expect(document.querySelectorAll).toHaveBeenCalledWith(
        'meta[name="viewport"]'
      );
      expect(document.createElement).toHaveBeenCalledWith('meta');
      expect(metaStub.setAttribute).toHaveBeenCalledWith('name', 'viewport');
      expect(metaStub.setAttribute).toHaveBeenCalledWith(
        'content',
        'initial-scale=1'
      );
      expect(document.head.appendChild).toHaveBeenCalledWith(metaStub);

      expect(document.createElement).toHaveBeenCalledWith('iframe');
      expect(iframeStub.src).toBe(url);
      expect(iframeStub.setAttribute).toHaveBeenCalledWith('id', IFRAME_ID);
      expect(iframeStub.setAttribute).toHaveBeenCalledWith('frameborder', '0');
      expect(iframeStub.setAttribute).toHaveBeenCalledWith('scrolling', 'no');

      expect(document.body.appendChild).toHaveBeenCalledWith(iframeStub);
      iframeStub.onload();
      expect(Connect.initPostMessage).toHaveBeenCalledWith({});
      expect(onLoad).toHaveBeenCalled();
    });

    test('should handle iframe scenario with custom overlay and container', () => {
      const mockContainer = { appendChild: jest.fn() };
      const options = { overlay: 'gray', selector: '#container' };
      spyOn(document, 'querySelectorAll').and.callThrough();
      spyOn(document, 'querySelector').and.returnValue(mockContainer);
      const iframeStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      const metaStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      spyOn(document.head, 'appendChild').and.callFake(() => {});
      spyOn(document.body, 'appendChild').and.callFake(() => {});
      spyOn(window.document, 'createElement').and.callFake((element) =>
        element === 'iframe' ? iframeStub : metaStub
      );
      const onLoad = jest.fn();
      spyOn(Connect, 'initPostMessage').and.callFake(() => {});
      Connect.launch(
        url,
        { onDone: () => {}, onError: () => {}, onCancel: () => {}, onLoad },
        options
      );

      expect(iframeStub.setAttribute).toHaveBeenCalledWith(
        'style',
        'background: gray;'
      );

      expect(document.querySelector).toHaveBeenCalledWith('#container');
      expect(mockContainer.appendChild).toHaveBeenCalledWith(iframeStub);

      iframeStub.onload();
      expect(Connect.initPostMessage).toHaveBeenCalledWith(options);
      expect(onLoad).toHaveBeenCalled();
    });

    test('should handle iframe scenario with custom container as node', () => {
      const mockContainer = { appendChild: jest.fn() } as any;
      const options = { node: mockContainer };
      const iframeStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      const metaStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      spyOn(document.head, 'appendChild').and.callFake(() => {});
      spyOn(window.document, 'createElement').and.callFake((element) =>
        element === 'iframe' ? iframeStub : metaStub
      );
      const onLoad = jest.fn();
      spyOn(Connect, 'initPostMessage').and.callFake(() => {});
      Connect.launch(
        url,
        { onDone: () => {}, onError: () => {}, onCancel: () => {}, onLoad },
        options
      );

      expect(mockContainer.appendChild).toHaveBeenCalledWith(iframeStub);

      iframeStub.onload();
      expect(Connect.initPostMessage).toHaveBeenCalledWith(options);
      expect(onLoad).toHaveBeenCalled();
    });

    test("should log warning and append iframe to body if selector doesn't return an element", () => {
      spyOn(console, 'warn').and.callFake(() => {});
      const options = { selector: '#container' };
      spyOn(document, 'querySelectorAll').and.callThrough();
      spyOn(document, 'querySelector').and.returnValue(undefined);
      const iframeStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      const metaStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      spyOn(document.head, 'appendChild').and.callFake(() => {});
      spyOn(document.body, 'appendChild').and.callFake(() => {});
      spyOn(window.document, 'createElement').and.callFake((element) =>
        element === 'iframe' ? iframeStub : metaStub
      );
      const onLoad = jest.fn();
      spyOn(Connect, 'initPostMessage').and.callFake(() => {});
      Connect.launch(
        url,
        { onDone: () => {}, onError: () => {}, onCancel: () => {}, onLoad },
        options
      );

      expect(document.querySelector).toHaveBeenCalledWith('#container');
      expect(document.body.appendChild).toHaveBeenCalledWith(iframeStub);
      expect(console.warn).toHaveBeenCalledWith(
        `Couldn't find any elements matching "${options.selector}", appending "iframe" to "body" instead.`
      );
    });

    test('should throw error if launch is called again before calling destroy', () => {
      Connect.launch(url, {
        onDone: () => {},
        onError: () => {},
        onCancel: () => {},
      });
      try {
        Connect.launch(url, {
          onDone: () => {},
          onError: () => {},
          onCancel: () => {},
        });
      } catch (e: any) {
        expect(e.message).toBe(
          'You must destroy the iframe before you can open a new one. Call "destroy()"'
        );
      }
    });
  });

  describe('initPostMessage', () => {
    test('should call postMessage every second with the expected parameters and attach postMessage event handler', () => {
      spyOn(window, 'setInterval').and.callThrough();
      spyOn(Connect, 'postMessage').and.callFake(() => {});

      Connect.initPostMessage({ selector: '#container' });
      jest.advanceTimersByTime(1100);
      expect(Connect.postMessage).toHaveBeenCalledWith({
        type: PING_EVENT,
        selector: '#container',
        sdkVersion: CONNECT_SDK_VERSION,
        platform: PLATFORM_IFRAME,
      });

      Connect.initPostMessage({ popup: true });
      jest.advanceTimersByTime(1100);
      expect(Connect.postMessage).toHaveBeenCalledWith({
        type: PING_EVENT,
        selector: undefined,
        sdkVersion: CONNECT_SDK_VERSION,
        platform: PLATFORM_POPUP,
      });
    });

    test('should call attach postMessage event handler and send events as expected', () => {
      let eventHandler;
      let popupMock = { close: jest.fn(), focus: jest.fn() };
      spyOn(window, 'open').and.callFake(jest.fn().mockReturnValue(popupMock));
      spyOn(window, 'addEventListener').and.callFake(
        (eventType, eh) => (eventHandler = eh)
      );
      const eventHandlers = {
        onDone: jest.fn(),
        onError: jest.fn(),
        onCancel: jest.fn(),
      };
      Connect.launch(url, eventHandlers);
      Connect.initPostMessage({ selector: '#container' });

      expect(window.addEventListener).toHaveBeenCalled();
      spyOn(window, 'clearInterval');
      eventHandler({ origin: url, data: { type: ACK_EVENT } });
      expect(window.clearInterval).toHaveBeenCalled();

      spyOn(Connect, 'openPopupWindow').and.callThrough();
      spyOn(Connect, 'destroy');
      eventHandler({
        origin: url,
        data: { type: URL_EVENT, url: 'http://oauth.com' },
      });
      expect(Connect.openPopupWindow).toHaveBeenCalledWith('http://oauth.com');

      const payload = { test: true };
      eventHandler({ origin: url, data: { type: DONE_EVENT, data: payload } });
      expect(eventHandlers.onDone).toHaveBeenCalledWith(payload);
      expect(Connect.destroy).toHaveBeenCalledTimes(1);

      eventHandler({
        origin: url,
        data: { type: CANCEL_EVENT, data: payload },
      });
      expect(eventHandlers.onCancel).toHaveBeenCalledWith(payload);
      expect(Connect.destroy).toHaveBeenCalledTimes(2);

      eventHandler({ origin: url, data: { type: ERROR_EVENT, data: payload } });
      expect(eventHandlers.onCancel).toHaveBeenCalledWith(payload);
      expect(Connect.destroy).toHaveBeenCalledTimes(3);

      eventHandler({ origin: url, data: { type: ROUTE_EVENT, data: payload } });
      expect(eventHandlers.onCancel).toHaveBeenCalledWith(payload);
      expect(Connect.destroy).toHaveBeenCalledTimes(3);

      eventHandler({ origin: url, data: { type: USER_EVENT, data: payload } });
      expect(eventHandlers.onCancel).toHaveBeenCalledWith(payload);
      expect(Connect.destroy).toHaveBeenCalledTimes(3);

      eventHandler({
        origin: url,
        data: { type: CLOSE_POPUP_EVENT, data: payload },
      });
      expect(popupMock.close).toHaveBeenCalled();
      expect(Connect.destroy).toHaveBeenCalledTimes(3);
    });

    test('should call attach postMessage event handler and ping Connect indefinitely for popup scenario', () => {
      let eventHandler;
      spyOn(window, 'open').and.callFake(() => mockWindow);
      spyOn(window, 'addEventListener').and.callFake(
        (eventType, eh) => (eventHandler = eh)
      );
      const eventHandlers = {
        onDone: jest.fn(),
        onError: jest.fn(),
        onCancel: jest.fn(),
      };
      Connect.launch(url, eventHandlers, { popup: true });
      Connect.initPostMessage({ popup: true });

      expect(window.addEventListener).toHaveBeenCalled();
      spyOn(window, 'clearInterval');
      eventHandler({ origin: url, data: { type: ACK_EVENT } });
      expect(window.clearInterval).not.toHaveBeenCalled();
    });
  });

  describe('openPopupWindow', () => {
    test("should open popup window, focus on it and periodically watch if it's still open", () => {
      spyOn(window, 'open').and.callFake(() => mockWindow);
      spyOn(window, 'setInterval');
      spyOn(window, 'clearInterval');
      spyOn(Connect, 'postMessage').and.callFake(() => {});

      Connect.openPopupWindow(url);
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=no,location=no,status=no,menubar=no,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=84,left=212`
      );
      expect(mockWindow.focus).toHaveBeenCalled();
      expect(window.setInterval).toHaveBeenCalled();
      jest.advanceTimersByTime(1100);
      expect(window.clearInterval).not.toHaveBeenCalled();
    });

    test('should call postMessage when the popup is closed', () => {
      mockWindow.closed = true;
      spyOn(window, 'open').and.callFake(() => mockWindow);
      spyOn(window, 'setInterval').and.callThrough();
      spyOn(window, 'clearInterval');
      spyOn(Connect, 'postMessage').and.callFake(() => {});

      Connect.openPopupWindow(url);
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=no,location=no,status=no,menubar=no,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=84,left=212`
      );
      expect(mockWindow.focus).toHaveBeenCalled();
      expect(window.setInterval).toHaveBeenCalled();

      jest.advanceTimersByTime(1100);
      expect(window.clearInterval).toHaveBeenCalled();
      expect(Connect.postMessage).toHaveBeenCalledWith({
        type: WINDOW_EVENT,
        closed: true,
        blocked: false,
      });
    });

    test('should let Connect know if the popup was blocked', () => {
      spyOn(window, 'open').and.callFake(() => undefined);
      spyOn(Connect, 'postMessage').and.callFake(() => {});

      Connect.openPopupWindow(url);
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=no,location=no,status=no,menubar=no,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=84,left=212`
      );
      expect(mockWindow.focus).not.toHaveBeenCalled();
      expect(Connect.postMessage).toHaveBeenCalledWith({
        type: WINDOW_EVENT,
        closed: true,
        blocked: true,
      });
    });
  });

  describe('postMessage', () => {
    test('should call postMessage on (iframe)', () => {
      const iframeStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
        contentWindow: { postMessage: jest.fn() },
      };
      const metaStub: any = {
        parentNode: { removeChild: jest.fn() },
        setAttribute: jest.fn(),
      };
      spyOn(document.head, 'appendChild').and.callFake(() => {});
      spyOn(document.body, 'appendChild').and.callFake(() => {});
      spyOn(window.document, 'createElement').and.callFake((element) =>
        element === 'iframe' ? iframeStub : metaStub
      );
      Connect.launch(url, {
        onDone: () => {},
        onError: () => {},
        onCancel: () => {},
      });
      iframeStub.onload();
      const data = { test: true };
      Connect.postMessage(data);
      expect(iframeStub.contentWindow.postMessage).toHaveBeenCalledWith(
        data,
        url
      );
    });

    test('should call postMessage on (popup)', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      Connect.launch(
        url,
        { onDone: () => {}, onError: () => {}, onCancel: () => {} },
        { popup: true }
      );

      const data = { test: true };
      Connect.postMessage(data);
      expect(mockWindow.postMessage).toHaveBeenCalledWith(data, url);
    });
  });
});
