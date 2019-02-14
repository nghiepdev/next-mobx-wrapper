export {default as withMobx} from './with-mobx';
import {isServer, mapToJson, jsonToMap} from './utils';

const __NEXT_MOBX_STORE__ = new Map();

export class BaseStore {
  constructor(props = {}) {
    for (const prop in props) {
      // Convert JSON to Map
      this[prop] = jsonToMap(props[prop]);
    }
  }

  update = (data = {}) => {
    for (const prop in data) {
      this[prop] = data[prop];
    }
  };
}

export const getOrCreateStore = (storeKeyName, Store) => initialState => {
  // Convert Map to JSON
  if (initialState) {
    for (const itemState in initialState) {
      try {
        const dataMap = initialState[itemState];

        if (dataMap.toJS() instanceof Map) {
          initialState[itemState] = mapToJson(dataMap);
        }
      } catch (e) {}
    }
  }

  // Always make a new store if server
  if (isServer) {
    return new Store(initialState);
  }

  // Create store if unavailable on the client
  if (!__NEXT_MOBX_STORE__.has(storeKeyName)) {
    __NEXT_MOBX_STORE__.set(storeKeyName, new Store(initialState));
  }

  return __NEXT_MOBX_STORE__.get(storeKeyName);
};
