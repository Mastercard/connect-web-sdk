# Changelog

### [1.2.0](https://www.npmjs.com/package/connect-web-sdk/v/1.2.0) (Latest)
___
###### Features
- Removed core-js and core-js-pure dependency and peer dependency from the project.
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
    

###### Considerations for upgrading to 1.2.0:
- No breaking change from SDK end.
- Since we are no longer supporting IE and older browsers, we removed the core-js and core-js-pure dependency and peer dependency.

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