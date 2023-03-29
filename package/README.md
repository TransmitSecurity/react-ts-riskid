# React Web-SDK quick start

This guide describes how to quickly integrate Detection and Response services into your web application. This React library is a wrapper of the Transmit [Detection and Response JavaScript SDK](https://developer.transmitsecurity.com/guides/risk/quick_start_web/). The guide covers the client-side integration as well as the backend API integration required to complete the flow.

## Step 1: Get client credentials

To integrate with Transmit Security, you'll need to obtain your client credentials from the [Admin Portal](https://portal.transmitsecurity.io/). From **Applications** > **Your Application**, you can obtain your client ID and client secret. These will be used to identify your app and generate authorization for requests to Transmit.


## Step 2: Add library to project

Get the package from Transmit Security representative and then use `yarn` to add it to your project:

```shell
npm i @transmitsecurity/riskid-reactjs-ts
or
yarn add @transmitsecurity/riskid-reactjs-ts

```

## Step 3: Configure component

Import the `TSAccountProtectionProvider` from `@transmitsecurity/riskid-reactjs-ts` and provide `clientId` you acquired in step 1.


```js
import { TSAccountProtectionProvider } from '@transmitsecurity/riskid-reactjs-ts';

...

<TSAccountProtectionProvider clientId={'CLIENT_ID'} >
  ...
  // your app here
  ...
<TSAccountProtectionProvider>
```

## Step 4: Use the React library

The example below demonstrates triggering a login event from a login button, setting and clearing a user.

- `triggerActionEvent()` receives an action type and returns a response that includes the `actionToken`. To obtain risk recommendations for sensitive actions, your application should report these actions. To do this, add the code below to relevant user interactions (such as the Login button `click` event handler). The library allows reporting on events with the following action types: `login`, `register`, `transaction`, `password_reset`, `logout`, `checkout`, `account_details_change`, `account_auth_change`, `withdraw` or `credits_change`.

- `setAuthenticatedUser()` sets the user context for all subsequent events in the browser session (or until the user is explicitly cleared). It should be set only after you've fully authenticated the user (including, for example, any 2FA that was required). Receives an opaque identifier of the user in your system ([USER_ID] in the snippet), which shouldn't contain any personal info.

- `clearUser()` clears the user context for all subsequent events in the browser session.

```js
import { useTSAccountProtection } from '@transmitsecurity/riskid-reactjs-ts';

function InnerComponent() {
  const { triggerActionEvent, setAuthenticatedUser, clearUser } = useTSAccountProtection();

  return (
    <>
    <button
      style={{width: '100px', height: '100px' }}
      onClick={async () => {
        const actionResponse = await triggerActionEvent('login');
        const actionToken = actionResponse?.actionToken;
        // Add code here to send the action and the received actionToken to your backend
      }}
    >Login</button>
    <button
      style={{width: '100px', height: '100px' }}
      onClick={() => setAuthenticatedUser('[USER_ID]')}
    >Set</button>
    <button
      style={{width: '100px', height: '100px' }}
      onClick={() => clearUser()}
    >Reset</button>
      </>
  );
};

export default InnerComponent;

```

## Step 5: Fetch recommendations

You can fetch recommendations for the reported action using the [Recommendation API](/openapi/risk/recommendations/). This is the same API that's also used for mobile integrations.

Transmit Security APIs are authorized using an OAuth access token so you'll need to fetch a token using your client credentials (from step 1). To do this, send the following request:

```js
  const { access_token } = await fetch(
    `https://api.riskid.security/v1/oauth/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      body: new URLSearchParams({
        grant_type: client_credentials,
        client_id: [CLIENT_ID],
        client_secret: [CLIENT_SECRET],
        scope: 'riskid.recommendation.fetch'
      })
    }
  );
```

From your backend, invoke the Recommendation API by sending a request like the one below. The `[ACCESS_TOKEN]` is the authorization token you obtained using your client credentials and `[ACTION_TOKEN]` is the `actionToken` received in step 4.

```js
const query = new URLSearchParams({
  action_token: '[ACTION_TOKEN]',
}).toString();

const resp = await fetch(
  `https://api.riskid.security/v1/recommendation?${query}`,
  {
    method: 'GET',
    headers: {
      Authorization: 'Bearer [ACCESS_TOKEN]',
    },
  }
);
```
