# next-mobx-wrapper

[![NPM version](https://img.shields.io/npm/v/next-mobx-wrapper.svg)](https://www.npmjs.com/package/next-mobx-wrapper)
[![NPM monthly download](https://img.shields.io/npm/dm/next-mobx-wrapper.svg)](https://www.npmjs.com/package/next-mobx-wrapper)

> Mobx wrapper for Next.js

:warning: This will work only with Next.js 6+ :warning:

## Features

- Simple API, easy steps to set up
- Multiple stores injection
- Works fine with [Observable Maps](https://mobx.js.org/refguide/map.html)

## Installation

To install the stable version you can use:

```sh
$ yarn add next-mobx-wrapper
```

## Usage

### Step 1: Injection multiple store

Below, we have two stores: `commonStore`, `userStore`

Create the `stores/with-mobx.js` file with the following minimal code:

```js
// stores/with-mobx.js

import React from 'react';
import {configure} from 'mobx';

import {getCommonStore} from './common';
import {getUserStore} from './user'; // *Here*

configure({enforceActions: 'observed'});

export default App => {
  return class AppWithMobx extends React.Component {
    static async getInitialProps(appContext) {
      const commonStore = getCommonStore();
      const userStore = getUserStore(); // *Here*

      // *Here*
      // Provide the store to getInitialProps of pages
      appContext.ctx.store = {
        commonStore,
        userStore,
      };

      let appProps = {};
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps.call(App, appContext);
      }

      return {
        ...appProps,
        initialMobxState: appContext.ctx.store,
      };
    }

    constructor(props) {
      super(props);
      const {commonStore, userStore} = props.initialMobxState;

      this.commonStore = getCommonStore(commonStore);
      this.userStore = getUserStore(userStore); // *Here*
    }

    render() {
      // And *Here*
      return (
        <App
          {...this.props}
          store={{
            commonStore: this.commonStore,
            userStore: this.userStore,
          }}
        />
      );
    }
  };
};
```

Wrap `HOC` to `_app.js`

```js
// pages/_app.js

import ErrorPage from 'next/error';
import {Provider, useStaticRendering} from 'mobx-react';
import withMobxStore from '../stores/with-mobx'; // *Here*

const isServer = !process.browser;
useStaticRendering(isServer); // not `true` value

class MyApp extends App {
  static async getInitialProps({Component, ctx}) {
    let pageProps = {};

    if (typeof Component.getInitialProps === 'function') {
      pageProps = await Component.getInitialProps(ctx);
    }

    return {pageProps};
  }

  render() {
    const {Component, pageProps, store} = this.props;
    const {statusCode} = pageProps;

    if (statusCode && statusCode >= 400) {
      return <ErrorPage statusCode={statusCode} />;
    }

    return (
      <Container>
        <Provider {...store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withMobxStore(MyApp); // *Here*
```

### Step 2: Create `userStore` sample

```js
// stores/user.js

import {BaseStore, getOrCreateStore} from 'next-mobx-wrapper'; // *Here*
import {observable, action, flow} from 'mobx';
import fetch from 'fetch';

class Store extends BaseStore {
  @observable userRegistry = new Map();

  fetchUser = flow(function*(id) {
    if (this.userRegistry.has(id)) {
      return;
    }

    const userPromise = yield fetch(`https://api.domain.com/users/${id}`).then(
      response => response.json(),
    );
    this.userRegistry.set(id, userPromise.data.user);
  });

  getUserById = id => {
    return this.userRegistry.get(id);
  };
}

// *Here*
// Make sure the store’s unique name
export const getUserStore = getOrCreateStore('userStore', Store);
```

### Step 3: Binding data

Any page

```js
// pages/user.js

class User extends React.Component {
  static async getInitialProps({store: {userStore}, query}) {
    const {id} = query;

    await userStore.fetchUser(id); // *Here*

    const user = userStore.getUserById(id);

    if (user) {
      return {
        user,
      };
    }

    return {
      statusCode: 404,
    };
  }

  render() {
    const {user} = this.props;

    console.log(user);

    return <div>Username: {user.name}</div>;
  }
}

export default User;
```

Or any component

```js
// components/UserInfo.jsx

import {inject, observer} from 'mobx-react';

@inject(({userStore: {getUserById}}, props) => ({
  user: getUserById(props.id),
}))
class UserInfo extends React.Component {
  static propTypes = {};

  render() {
    console.log(this.props.user);

    return <div>Username: {this.props.user.name}</div>;
  }
}

// Somewhere
<SampleThing>
    <UserInfo id={9}>
</SampleThing>
```

## API

```js
import {BaseStore, getOrCreateStore} from 'next-mobx-wrapper';
```

## License

MIT © [Nghiep](https://nghiepit.pro)
