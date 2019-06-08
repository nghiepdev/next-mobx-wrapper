# next-mobx-wrapper

[![NPM version](https://img.shields.io/npm/v/next-mobx-wrapper.svg)](https://www.npmjs.com/package/next-mobx-wrapper)
[![NPM monthly download](https://img.shields.io/npm/dy/next-mobx-wrapper.svg)](https://www.npmjs.com/package/next-mobx-wrapper)

> Mobx wrapper for Next.js

:warning: This will work only with Next.js 6+ :warning:

## Example: [examples/with-mobx-wrapper](https://github.com/nghiepit/next.js/tree/canary/examples/with-mobx-wrapper)

## Installation

```sh
$ yarn add next-mobx-wrapper
```

## Usage

### Step 1: Wrap `withMobx` into `_app.js`

```js
// pages/_app.js

import {withMobx} from 'next-mobx-wrapper';
import {configure} from 'mobx';
import {Provider, useStaticRendering} from 'mobx-react';

import * as getStores from '../stores';

const isServer = !process.browser;

configure({enforceActions: 'observed'});
useStaticRendering(isServer); // NOT `true` value

class MyApp extends App {
  render() {
    const {Component, pageProps, store} = this.props;

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

    try {
      const {data} = yield fetch(`https://api.domain.com/users/${id}`).then(
        response => response.json(),
      );

      this.userRegistry.set(id, data);
    } catch (error) {
      throw error;
    }
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

import {inject} from 'mobx-react';

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

- Or with Hooks

```js
// components/UserInfo.jsx

import React, {useMemo, useContext} from 'react';
import {MobXProviderContext} from 'mobx-react';

const UserInfo = ({id}) => {
  const {
    userStore: {getUserById},
  } = useContext(MobXProviderContext);

  const user = useMemo(() => getUserById(id), [id]);

  return <div>Username: {user.name}</div>;
};

export default UserInfo;
```

### **Note:** `Next.js 8` you need add more, if you want to use [Observable Maps](https://mobx.js.org/refguide/map.html)

```json
//.babelrc

{
  "presets": [
    [
      "next/babel",
      {
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
