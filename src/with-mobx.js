import React from 'react';

import {getKeyNameStore} from './utils';

export default (getStores = {}) => App => {
  return class AppWithMobx extends React.Component {
    static async getInitialProps(appContext) {
      let appProps = {};

      // Provide the store to getInitialProps of pages
      appContext.ctx.store = {};
      for (const fnName in getStores) {
        const storeKeyName = getKeyNameStore(fnName);
        appContext.ctx.store[storeKeyName] = getStores[fnName]();
      }

      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext);
      }

      return {
        ...appProps,
        initialMobxState: appContext.ctx.store,
      };
    }

    constructor(props) {
      super(props);
      this.store = {};

      for (const fnName in getStores) {
        const storeKeyName = getKeyNameStore(fnName);
        this.store[storeKeyName] = getStores[fnName](
          props.initialMobxState[storeKeyName],
        );
      }
    }

    render() {
      const {initialMobxState, ...props} = this.props;
      return <App {...props} store={{...this.store}} />;
    }
  };
};
