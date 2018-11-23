import {isServer, mapToJson, jsonToMap} from './utils';

const __NEXT_MOBX_STORE__ = '__NEXT_MOBX_STORE__';

export class BaseStore {
  constructor(props = {}) {
    for (const prop in props) {
      // Convert JSON string to Map string for client
      this[prop] = jsonToMap(props[prop]);
    }
  }
}

const makeInitializeStore = Store => {
  let store = null;

  return (initialState = {}) => {
    if (isServer) {
      return new Store(initialState);
    }

    if (store === null) {
      store = new Store(initialState);
    }

    return store;
  };
};

export const getOrCreateStore = (storeKeyName, Store) => initialState => {
  // Convert Map to JSON string for client
  if (initialState) {
    try {
      for (const itemState in initialState) {
        try {
          const dataMap = initialState[itemState];
          if (dataMap.toJS() instanceof Map) {
            initialState[itemState] = mapToJson(dataMap);
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  const initializeStore = makeInitializeStore(Store);

  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState);
  }

  window[__NEXT_MOBX_STORE__] = window[__NEXT_MOBX_STORE__] || {};

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_MOBX_STORE__][storeKeyName]) {
    window[__NEXT_MOBX_STORE__][storeKeyName] = initializeStore(initialState);
  }
  return window[__NEXT_MOBX_STORE__][storeKeyName];
};
