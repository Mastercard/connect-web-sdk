# Changelog

### [2.3.0](https://www.npmjs.com/package/connect-web-sdk/v/2.3.0) (Latest)
---
###### Accessibility Improvements
- Updated iframe accessibility attributes to enhance compliance and user experience.

### [2.2.0](https://www.npmjs.com/package/connect-web-sdk/v/2.2.0) (05/26/2025)
---
###### Improvements
- Enhanced internal monitoring capabilities for better insights and reliability.

### [2.1.0](https://www.npmjs.com/package/connect-web-sdk/v/2.1.0) (01/30/2025)
---
###### Features
- Added a new optional onUrl event handler to the ConnectEventHandlers interface. This handler allows developers to listen for URL-related events, such as opening or closing a URL. The onUrl function accepts two parameters:

  - **type**: A string literal ('OPEN' or 'CLOSE') indicating the type of event.
  - **url**: An optional string parameter that is only present when type is 'OPEN'.

###### Considerations for upgrading to 2.1.0:
- This is a non-breaking change. Existing implementations will continue to work without modification.
- If you want to manually handle URL events in popup scenarios, you can now provide an onUrl handler in the eventHandlers object when calling Connect.launch(). 
    If you provide an onUrl handler, you'll need to implement your own logic for opening and closing URLs, as the SDK will no longer handle these events automatically.
    
    Note: The default behavior for URL events remains unchanged if you don't provide an onUrl handler. The onUrl handler is optional, so you can safely ignore it if your application does not require custom URL event handling.

### [2.0.0](https://www.npmjs.com/package/connect-web-sdk/v/2.0.0) (09/17/2024)
___
###### Features
- Removed core-js and core-js-pure dependency and peer dependency from the project
- Enhanced the build process to generate four types of builds - Commonjs, ESM, IIFE and UMD builds. (Read more about builds: https://javascript.works-hub.com/learn/javascript-modules-358ee)

    - If you want to use a CommonJS build, try the following:

        ```js
        // Either works
        const { Connect } = require("connect-web-sdk");
        const { Connect } = require("connect-web-sdk/dist/mastercard-connect-cjs.min.js");
        ```

    - If you want to use a ESM build, try the following:

        ```js 
        // Either works
        import { Connect } from 'connect-web-sdk';
        import { Connect } from 'connect-web-sdk/dist/mastercard-connect-esm.min.js';
        ```

        If you want to use the ESM build directly using script modules then you can try:

        ```html 
        // Attaches Connect object to global automatically
        <script type="module" src="<path_to_web-sdk>/dist/mastercard-connect-esm.min.js"></script>
        ```

    - If you are using an index.html file where you want to use Connect directly using <script src=" ">, you can try the IIFE or UMD build.
        
        - UMD (Universal Module Definition) attempts to offer compatibility with the most popular script loaders. The pattern has two parts: an IIFE where it is checked the module loader implemented by the user, and an anonymous function that creates the module
            ```html
            In index.html,
            <script src="node_modules/connect-web-sdk/dist/mastercard-connect-umd.min.js"></script>
            
            // Attaches Connect object to global automatically
            ```


        - IIFE (Immediately Invoked Function Expression) was the first way to define a module without using anything else. Based on the Revealing Module Pattern, IIFEs simulate a context where we have private data (the one defined in the function) and public data (the one exposed via the function's return)

            ```html
            In index.html,
            <script src="node_modules/connect-web-sdk/dist/mastercard-connect-iife.min.js"></script>

            // Attaches Connect object to global automatically
            ```
    

###### Considerations for upgrading to 2.0.0:
- **Our package no longer requires CoreJS as a peer dependency**. This change may affect projects that relied on our package to provide CoreJS functionality. Since we are no longer supporting IE and older browsers, we removed the core-js peer dependency and core-js-pure dependency. If you were installing CoreJS solely because of our package's peer dependency, you may now remove it from your project if it's not needed for other purposes.
- We now support multiple builds formats to support various use cases and environments [CommonJS (CJS), ECMAScript Modules (ESM), Immediately Invoked Function Expression (IIFE), Universal Module Definition (UMD)] You now have more flexibility in how you can use our package

### [1.1.0](https://www.npmjs.com/package/connect-web-sdk/v/1.1.0) (03/22/2024)
___
###### Features
- Introduced a new `redirectUrl` option in the ConnectOptions interface. **This parameter is only required for App to App**. This is the URL to redirect back to your mobile app after completing an FI’s OAuth flow (universal link on iOS, app link on Android). If you need to support the optional redirectUrl feature, update your code to pass the redirectUrl property in the ConnectOptions object when launching the Connect SDK. 
    
    ```Connect.launch(url, eventHandlers, { redirectUrl: 'https://example.com' });```

- Added support for **NextJS** framework ✨
- Moved the styling code for the iframe overlay into the launch method, ensuring it's applied consistently across different launch scenarios.
###### Considerations for upgrading to 1.1.0:
- If you want to utilize the `redirectUrl` option, you need to update your code to pass the desired redirect URL when launching the Connect experience.
- No breaking changes to existing functionality, but you should review the updated ConnectOptions interface and update your code accordingly if you plan to use the redirectUrl option.

### [1.0.0-rc.5](https://www.npmjs.com/package/connect-web-sdk/v/1.0.0-rc.5) (03/02/2023)
___
###### Features
- Added **aria-label** and **title** attributes to the iframe for improved accessibility.
###### Considerations for upgrading to 1.0.0-rc.5:
- No breaking changes or major functionality updates. You can upgrade to this version without any significant changes to the implementation.