# next-mobx-wrapper

[![NPM version](https://img.shields.io/npm/v/next-mobx-wrapper.svg)](https://www.npmjs.com/package/next-mobx-wrapper)
[![NPM monthly download](https://img.shields.io/npm/dm/next-mobx-wrapper.svg)](https://www.npmjs.com/package/next-mobx-wrapper)

> Mobx wrapper for Next.js

:warning: This will work only with Next.js 6+ :warning:

## Example: [examples/with-mobx-wrapper](https://github.com/nghiepit/next.js/tree/canary/examples/with-mobx-wrapper)

## Features

- Simple and quick setup
- Multiple stores injection
- Works fine with [Observable Maps](https://mobx.js.org/refguide/map.html)

## Installation

```sh
$ yarn add next-mobx-wrapper
```

## Usage

### Step 1: Wrap `withMobx` into `_app.js`

```js
// pages/_app.js

import ErrorPage from 'next/error';
import {withMobx} from 'next-mobx-wrapper';
import {configure} from 'mobx';
import {Provider, useStaticRendering} from 'mobx-react';

import * as getStores from '../stores';

const isServer = !process.browser;

configure({enforceActions: 'observed'});
useStaticRendering(isServer); // NOT `true` value

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

export default withMobx(getStores)(MyApp);
```

### Step 2: Create the stores

- Create `userStore` sample:

```js
// stores/user.js

import {BaseStore, getOrCreateStore} from 'next-mobx-wrapper';
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

// Make sure the store’s unique name
// AND must be same formula
// Example: getUserStore => userStore
// Example: getProductStore => productStore
export const getUserStore = getOrCreateStore('userStore', Store);
```

- Create the `rootStore`:

```js
// stores/index.js
// Just only simple

export {getCounterStore} from './counter';
export {getUserStore} from './user';
```

### Step 3: Binding data

- Any pages

```js
// pages/user.js

class User extends React.Component {
  static async getInitialProps({store: {userStore}, query}) {
    const {id} = query;

    await userStore.fetchUser(id);

    const user = userStore.getUserById(id);

    if (!user) {
      return {
        statusCode: 404,
      };
    }

    return {
      user,
    };
  }

  render() {
    const {user} = this.props;
    return <div>Username: {user.name}</div>;
  }
}

export default User;
```

- Or any components

```js
// components/UserInfo.jsx

import {inject, observer} from 'mobx-react';

@inject(({userStore: {getUserById}}, props) => ({
  user: getUserById(props.id),
}))
class UserInfo extends React.Component {
  render() {
    return <div>Username: {this.props.user.name}</div>;
  }
}

// Somewhere
<SampleThing>
  <UserInfo id={9}>
</SampleThing>
```

### Note: `Next.js 8` you need more

```json
//.babelrc

{
  "presets": [
    [
      "next/babel",
      {
        "preset-env": {
          "useBuiltIns": "usage"
        },
        "transform-runtime": {
          "corejs": false
        }
      }
    ]
  ]
}
```

## API

```js
import {withMobx, BaseStore, getOrCreateStore} from 'next-mobx-wrapper';
```

## License

MIT © [Nghiep](https://nghiepit.dev)
