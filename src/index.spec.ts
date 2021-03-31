import { FinicityConnect } from './index';

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
  PLATFORM,
  STYLES_ID,
  CONNECT_SDK_VERSION,
} from './constants';

const defaultPopupOptions = {
  toolbar: 'no',
  location: 'no',
  status: 'no',
  menubar: 'no',
  width: POPUP_WIDTH,
  height: POPUP_HEIGHT,
  top: window.top.outerHeight / 2 + window.top.screenY - POPUP_HEIGHT / 2,
  left: window.top.outerWidth / 2 + window.top.screenX - POPUP_WIDTH / 2,
};

const url = 'http://test.com';
describe('FinicityConnect', () => {
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
    FinicityConnect.destroy();
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
      FinicityConnect.launch(url, {
        done: () => {},
        error: () => {},
        cancel: () => {},
      });
      FinicityConnect.destroy();

      expect(iframeStub.parentNode.removeChild).toHaveBeenCalled();
      expect(metaStub.parentNode.removeChild).toHaveBeenCalled();
    });

    test('should remove postMessage event listener', () => {
      let onMessageFn;
      window.addEventListener = (cb) => {
        onMessageFn = cb;
      };
      jest.spyOn(window, 'removeEventListener');
      FinicityConnect.launch(url, {
        done: () => {},
        error: () => {},
        cancel: () => {},
      });
      FinicityConnect.destroy();
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'message',
        onMessageFn
      );
    });

    test('should close popup window', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      FinicityConnect.launch(
        url,
        { done: () => {}, error: () => {}, cancel: () => {} },
        { popup: true }
      );
      FinicityConnect.destroy();
      expect(mockWindow.close).toHaveBeenCalled();
    });
  });

  describe('launch', () => {
    test('should handle popup scenario with default options', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      const loaded = jest.fn();
      spyOn(FinicityConnect, 'initPostMessage').and.callFake(() => {});
      FinicityConnect.launch(
        url,
        { done: () => {}, error: () => {}, cancel: () => {}, loaded },
        { popup: true }
      );
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=${defaultPopupOptions.toolbar},location=${defaultPopupOptions.location},status=${defaultPopupOptions.status},menubar=${defaultPopupOptions.menubar},width=${CONNECT_POPUP_WIDTH},height=${CONNECT_POPUP_HEIGHT},top=${defaultPopupOptions.top},left=${defaultPopupOptions.left}`
      );
      expect(loaded).toHaveBeenCalled();
      expect(FinicityConnect.initPostMessage).toHaveBeenCalled();
    });

    test('should handle popup scenario with specified options', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      const popupOptions = {
        toolbar: 'yes',
        location: 'yes',
        status: 'yes',
        menubar: 'yes',
        width: 100,
        height: 100,
        top: 200,
        left: 200,
      };
      const loaded = jest.fn();
      spyOn(FinicityConnect, 'initPostMessage').and.callFake(() => {});
      FinicityConnect.launch(
        url,
        { done: () => {}, error: () => {}, cancel: () => {}, loaded },
        { popup: true, popupOptions }
      );
      expect(loaded).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=${popupOptions.toolbar},location=${popupOptions.location},status=${popupOptions.status},menubar=${popupOptions.menubar},width=${CONNECT_POPUP_WIDTH},height=${CONNECT_POPUP_HEIGHT},top=${popupOptions.top},left=${popupOptions.left}`
      );
      expect(FinicityConnect.initPostMessage).toHaveBeenCalled();
    });

    test('should return error event if popup failed to open', () => {
      spyOn(window, 'open').and.returnValue(undefined);
      const error = jest.fn();
      FinicityConnect.launch(
        url,
        { done: () => {}, error, cancel: () => {} },
        { popup: true }
      );
      expect(window.open).toHaveBeenCalled();
      expect(error).toHaveBeenCalledWith({ rason: 'error', code: 1403 });
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
      const loaded = jest.fn();
      spyOn(FinicityConnect, 'initPostMessage').and.callFake(() => {});
      FinicityConnect.launch(url, {
        done: () => {},
        error: () => {},
        cancel: () => {},
        loaded,
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
      // expect(iframeStub.setAttribute).toHaveBeenCalledWith('style', 'background: gray;');

      expect(document.body.appendChild).toHaveBeenCalledWith(iframeStub);
      iframeStub.onload();
      expect(FinicityConnect.initPostMessage).toHaveBeenCalledWith({});
      expect(loaded).toHaveBeenCalled();
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
      const loaded = jest.fn();
      spyOn(FinicityConnect, 'initPostMessage').and.callFake(() => {});
      FinicityConnect.launch(
        url,
        { done: () => {}, error: () => {}, cancel: () => {}, loaded },
        options
      );

      expect(iframeStub.setAttribute).toHaveBeenCalledWith(
        'style',
        'background: gray;'
      );

      expect(document.querySelector).toHaveBeenCalledWith('#container');
      expect(mockContainer.appendChild).toHaveBeenCalledWith(iframeStub);

      iframeStub.onload();
      expect(FinicityConnect.initPostMessage).toHaveBeenCalledWith(options);
      expect(loaded).toHaveBeenCalled();
    });

    test("should log warning and append iframe to body if selector doesn't return an element", () => {
      spyOn(console, 'warn').and.callThrough();
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
      const loaded = jest.fn();
      spyOn(FinicityConnect, 'initPostMessage').and.callFake(() => {});
      FinicityConnect.launch(
        url,
        { done: () => {}, error: () => {}, cancel: () => {}, loaded },
        options
      );

      expect(document.querySelector).toHaveBeenCalledWith('#container');
      expect(document.body.appendChild).toHaveBeenCalledWith(iframeStub);
      expect(console.warn).toHaveBeenCalledWith(
        `Couldn't find any elements matching "${options.selector}", appending "iframe" to "body" instead.`
      );
    });

    test('should throw error if launch is called again before calling destroy', () => {
      FinicityConnect.launch(url, {
        done: () => {},
        error: () => {},
        cancel: () => {},
      });
      try {
        FinicityConnect.launch(url, {
          done: () => {},
          error: () => {},
          cancel: () => {},
        });
      } catch (e) {
        expect(e.message).toBe(
          'You must destroy the iframe before you can open a new one. Call "destroy()"'
        );
      }
    });
  });

  describe('initPostMessage', () => {
    test('should call postMessage every second with the expected parameters and attach postMessage event handler', () => {
      spyOn(window, 'setInterval').and.callThrough();
      spyOn(FinicityConnect, 'postMessage').and.callFake(() => {});

      FinicityConnect.initPostMessage({ selector: '#container' });
      jest.advanceTimersByTime(1100);
      expect(FinicityConnect.postMessage).toHaveBeenCalledWith({
        type: PING_EVENT,
        selector: '#container',
        sdkVersion: CONNECT_SDK_VERSION,
        platform: `${PLATFORM}-iframe`,
      });

      FinicityConnect.initPostMessage({ popup: true });
      jest.advanceTimersByTime(1100);
      expect(FinicityConnect.postMessage).toHaveBeenCalledWith({
        type: PING_EVENT,
        selector: undefined,
        sdkVersion: CONNECT_SDK_VERSION,
        platform: `${PLATFORM}-popup`,
      });
    });

    test('should call attach postMessage event handler and send events as expected', () => {
      let eventHandler;
      spyOn(window, 'addEventListener').and.callFake(
        (eventType, eh) => (eventHandler = eh)
      );
      const eventHandlers = {
        done: jest.fn(),
        error: jest.fn(),
        cancel: jest.fn(),
      };
      FinicityConnect.launch(url, eventHandlers);
      FinicityConnect.initPostMessage({ selector: '#container' });

      expect(window.addEventListener).toHaveBeenCalled();
      spyOn(window, 'clearInterval');
      eventHandler({ origin: url, data: { type: ACK_EVENT } });
      expect(window.clearInterval).toHaveBeenCalled();

      spyOn(FinicityConnect, 'openPopupWindow');
      spyOn(FinicityConnect, 'destroy');
      eventHandler({
        origin: url,
        data: { type: URL_EVENT, url: 'http://oauth.com' },
      });
      expect(FinicityConnect.openPopupWindow).toHaveBeenCalledWith(
        'http://oauth.com'
      );

      const payload = { test: true };
      eventHandler({ origin: url, data: { type: DONE_EVENT, data: payload } });
      expect(eventHandlers.done).toHaveBeenCalledWith(payload);
      expect(FinicityConnect.destroy).toHaveBeenCalledTimes(1);

      eventHandler({
        origin: url,
        data: { type: CANCEL_EVENT, data: payload },
      });
      expect(eventHandlers.cancel).toHaveBeenCalledWith(payload);
      expect(FinicityConnect.destroy).toHaveBeenCalledTimes(2);

      eventHandler({ origin: url, data: { type: ERROR_EVENT, data: payload } });
      expect(eventHandlers.cancel).toHaveBeenCalledWith(payload);
      expect(FinicityConnect.destroy).toHaveBeenCalledTimes(3);

      eventHandler({ origin: url, data: { type: ROUTE_EVENT, data: payload } });
      expect(eventHandlers.cancel).toHaveBeenCalledWith(payload);
      expect(FinicityConnect.destroy).toHaveBeenCalledTimes(3);

      eventHandler({ origin: url, data: { type: USER_EVENT, data: payload } });
      expect(eventHandlers.cancel).toHaveBeenCalledWith(payload);
      expect(FinicityConnect.destroy).toHaveBeenCalledTimes(3);
    });
  });

  describe('openPopupWindow', () => {
    test("should open popup window, focus on it and periodically watch if it's still open", () => {
      spyOn(window, 'open').and.callFake(() => mockWindow);
      spyOn(window, 'setInterval');
      spyOn(window, 'clearInterval');
      spyOn(FinicityConnect, 'postMessage').and.callFake(() => {});

      FinicityConnect.openPopupWindow(url);
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=no,location=no,status=no,menubar=no,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${defaultPopupOptions.top},left=${defaultPopupOptions.left}`
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
      spyOn(FinicityConnect, 'postMessage').and.callFake(() => {});

      FinicityConnect.openPopupWindow(url);
      expect(window.open).toHaveBeenCalledWith(
        url,
        'targetWindow',
        `toolbar=no,location=no,status=no,menubar=no,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${defaultPopupOptions.top},left=${defaultPopupOptions.left}`
      );
      expect(mockWindow.focus).toHaveBeenCalled();
      expect(window.setInterval).toHaveBeenCalled();

      jest.advanceTimersByTime(1100);
      expect(window.clearInterval).toHaveBeenCalled();
      expect(FinicityConnect.postMessage).toHaveBeenCalledWith({
        type: WINDOW_EVENT,
        closed: true,
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
      FinicityConnect.launch(url, {
        done: () => {},
        error: () => {},
        cancel: () => {},
      });
      iframeStub.onload();
      const data = { test: true };
      FinicityConnect.postMessage(data);
      expect(iframeStub.contentWindow.postMessage).toHaveBeenCalledWith(
        data,
        url
      );
    });

    test('should call postMessage on (popup)', () => {
      spyOn(window, 'open').and.returnValue(mockWindow);
      FinicityConnect.launch(
        url,
        { done: () => {}, error: () => {}, cancel: () => {} },
        { popup: true }
      );

      const data = { test: true };
      FinicityConnect.postMessage(data);
      expect(mockWindow.postMessage).toHaveBeenCalledWith(data, url);
    });
  });
});
