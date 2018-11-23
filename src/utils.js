export const isServer = !process.browser;

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
