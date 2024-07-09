import { createContext, Dispatch, useContext, useReducer, useMemo, useEffect, ReactNode } from 'react';

declare let TSAccountProtection: any;
declare global {
  interface Window {
    myTSAccountProtection: any;
  }
}
interface ActionResponse {
  actionToken?: string;
}

const RISKID_SDK_SCRIPT = 'riskid_sdk_script';
const SDK_INIT_ERR = 'SDK init error';
const SDK_LOAD_ERR = 'SDK load error';
const SDK_TRIGGER_ACTION_ERR = 'Error sending action event';
const SDK_AUTHENTICATE_USER_ERR = 'Error authenticating user';
const SDK_CLEAR_USER_ERR = 'Error clearing user';

type ProviderState = DRSConfigOptions & {
  initialized: Promise<boolean>;
  clientId: string;
};

type ErrHandler = (err: any) => void;

/**
 * Configuration object for the Transmit Security Detection and Response SDK
 */
 export interface DRSConfigOptions {
  /**
   * Alternative URL to load the SDK from for 1st-party integration
   * This option overrides the {@link DRSConfigOptions#sdkVersion} option
   */
  sdkLoadUrl?: string;

  /**
   * Version of the DRS SDK to load (this setting is ignored if {@link DRSConfigOptions#sdkLoadUrl} is set)
   * Default: latest
   */
  sdkVersion?: string;

  /**
   * @deprecate
   * Please use `serverUrl` instead
   */
  serverPath?: string;

  /**
   * A base URL to use for submission of device telemetry and actions, used for 1st-party integration
   * Default: https://api.transmitsecurity.io/risk-collect
   */
  serverUrl?: string;

  /**
   * Opaque identifier of the user in your system
   * To be provided if the SDK is loaded in a context of an already authenticated user
   */
  userId?: string;

  /**
   * a callback to be called in case of unexpected errors originating from the library
   * @param error the exception object caught be the library
   */
  onError?: ErrHandler;

  /**
   * A string to log when the sdk initialization completes. If not provided - logging will be skipped.
   */
  initSuccessLog?: string;
}

interface QuerablePromise extends Promise<any> {
  status: PromiseStatus;
};

enum PromiseStatus {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
};

function makeQuerablePromise(promise: Promise<any>): QuerablePromise {
  // Set initial state
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;

  // Observe the promise, saving the fulfillment in a closure scope.
  let result = promise.then(
      function (value: any) {
          isFulfilled = true;
          isPending = false;
          return value; 
      }, 
      function (err: Error) {
          isRejected = true;
          isPending = false;
          throw err; 
      }
  ) as QuerablePromise;

  if (isFulfilled) {
    result.status = PromiseStatus.Fulfilled;
  } else if (isRejected) {
    result.status = PromiseStatus.Rejected;
  } else {
    result.status = PromiseStatus.Pending;
  }
  return result;
}

const buildSdkError = (err: any, message: string) => {
  return {
    message,
    err,
  };
};

const generateSdkUrl = (sdkVersion: string) => {
  return `https://cdn.riskid.security/sdk/web_sdk_${sdkVersion}.js`;
};

const getLoadSDKPromise = (id: string, sdkLoadUrl: string, parentElement?: HTMLHeadElement): Promise<void> => {
  if (typeof document === 'undefined' || document.getElementById(id)) {
    // document is exist if platform is a browser
    throw new Error('SDK already loaded or cannot be loaded');
  }
  return new Promise((resolve, reject) => {
    const scriptTag = document.createElement('script');

    scriptTag.defer = true;
    scriptTag.src = sdkLoadUrl;
    scriptTag.id = id;
    scriptTag.onload = () => resolve();
    scriptTag.onerror = () => reject();

    if (!parentElement) {
      parentElement = document.head;
    }

    parentElement.appendChild(scriptTag);
  });
};

const buildProviderState = (clientId: string, options?: DRSConfigOptions): ProviderState => {
  const sdkVersion = options?.sdkVersion ?? 'latest';
  return {
    initialized: new Promise((res) => undefined), // making default promise in pending state
    clientId,
    serverUrl: options?.serverUrl ?? (options?.serverPath || 'https://api.transmitsecurity.io/risk-collect/'),
    sdkVersion,
    sdkLoadUrl: options?.sdkLoadUrl ?? generateSdkUrl(sdkVersion),
    ...(options?.userId && { userId: options.userId }),
    initSuccessLog: options?.initSuccessLog,
    onError:
      options?.onError && typeof options.onError == 'function'
        ? options?.onError
        : (err: Error) => {
            console.log(err);
          },
  };
};

const AccountProtectionContext = createContext<{ state: ProviderState; dispatch: Dispatch<ProviderState> } | undefined>(
  undefined,
);

const userReducer = (state: ProviderState, newState: Partial<ProviderState>): ProviderState => {
  return {
    ...state,
    ...newState,
  };
};

// Context for being able to use a global/high level state-management. it could be globally (app root) or fragmented

export function TSAccountProtectionProvider({
  children,
  clientId,
  options,
}: {
  children: ReactNode;
  clientId: string;
  options?: DRSConfigOptions;
}) {
  if (!clientId) {
    throw new Error('No clientId was provided');
  }
  let sdkInitialized: (status: boolean) => void;
  const providerState = buildProviderState(clientId, options);
  providerState.initialized = new Promise<boolean>((resolve) => {
    let resolved = false;
    sdkInitialized = (status) => {
      if (!resolved) {
        resolved = true;
        resolve(status);
      }
    };
  });
  const [state, dispatch] = useReducer(userReducer, providerState);
  const providerValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  useEffect(() => {
    let loadSDKPromise;
    try {
      loadSDKPromise = getLoadSDKPromise(RISKID_SDK_SCRIPT, providerState.sdkLoadUrl as string);
    } catch(error) {
      return;
    }
    const onError = providerState.onError as ErrHandler;
    loadSDKPromise.then(async () => {
      const initializedPromise = makeQuerablePromise(providerState.initialized);
      if (initializedPromise.status != PromiseStatus.Fulfilled && !window.myTSAccountProtection) {
        try {
          const serverPath = providerState.serverUrl;
          window.myTSAccountProtection = new TSAccountProtection(providerState.clientId, { serverPath });
          try {
            await window.myTSAccountProtection.init(providerState?.userId);
            if (providerState.initSuccessLog) {
              console.log(providerState.initSuccessLog);
            }
            sdkInitialized(true);
          } catch (err) {
            onError(buildSdkError(err, SDK_INIT_ERR));
            sdkInitialized(false);
          }
        } catch (err) {
          onError(buildSdkError(err, SDK_LOAD_ERR));
          sdkInitialized(false);
        }
      }
    }).catch((err) => {
      onError(buildSdkError(err, SDK_LOAD_ERR));
      sdkInitialized(false);
    });
  }, []);

  return <AccountProtectionContext.Provider value={providerValue}>{children}</AccountProtectionContext.Provider>;
};

function getTriggerActionEventFunc(providerState: ProviderState) {
  return async function triggerActionEvent(actionType: string, options = {}): Promise<ActionResponse | null> {
    if (await providerState.initialized) {
      try {
        return await window.myTSAccountProtection?.triggerActionEvent(actionType, options);
      } catch (err) {
        (providerState.onError as ErrHandler)(buildSdkError(err, SDK_TRIGGER_ACTION_ERR));
      }
    }
    return null;
  }
}

function getAuthenticatedUserFunc(providerState: ProviderState, providerDispatch: Function) {
  return async function setAuthenticatedUser(userId?: string, options = {}): Promise<boolean> {
    if (await providerState.initialized) {
      try {
        providerDispatch({
          ...providerState,
          userId,
        });
        return await window.myTSAccountProtection?.setAuthenticatedUser(userId, options);
      } catch (err) {
        (providerState.onError as ErrHandler)(buildSdkError(err, SDK_AUTHENTICATE_USER_ERR));
      }
    }
    return false;
  }
}

function getClearUserFunc(providerState: ProviderState, providerDispatch: Function) {
  return async function clearUser(options = {}): Promise<boolean> {
    if (await providerState.initialized) {
      try {
        const { userId, ...rest } = providerState;
        providerDispatch({
          ...rest,
        });
        return await window.myTSAccountProtection?.clearUser(options);
      } catch (err) {
        (providerState.onError as ErrHandler)(buildSdkError(err, SDK_CLEAR_USER_ERR));
      }
    }
    return false;
  }
}

const useAccountProtectionContext = () => {
  const context = useContext(AccountProtectionContext);
  if (context === undefined) {
    // if there is no value the hook is not being called within a function component that is rendered within a `TimelineContextProvider`
    throw new Error('`useTSAccountProtection` must be used within App');
  }
  return context;
};

export const useTSAccountProtection = () => {
  // used in specific component
  const { state, dispatch } = useAccountProtectionContext();
  return {
    triggerActionEvent: getTriggerActionEventFunc(state),
    setAuthenticatedUser: getAuthenticatedUserFunc(state, dispatch),
    clearUser: getClearUserFunc(state, dispatch),
  };
};
