# Changelog

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