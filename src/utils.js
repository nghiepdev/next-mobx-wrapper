export const isServer = !process.browser;

// getCounterStore => counterStore
export const getKeyNameStore = fnName =>
  fnName.replace(/^get(.)/, (match, p1) => p1.toLowerCase());

export const mapToJson = map => {
  try {
    return JSON.stringify([...map]);
  } catch (e) {
    return map;
  }
};

export const jsonToMap = jsonStr => {
  if (!jsonStr) {
    return jsonStr;
  }

  try {
    return new Map(JSON.parse(jsonStr));
  } catch (e) {
    return jsonStr;
  }
};
