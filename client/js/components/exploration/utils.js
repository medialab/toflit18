// utility function to check if default values are loaded

function resolvePathInState(path, state) {
  return path.split('.').reduce((acc, p) => {
    return acc ? acc[p] : undefined;
  }, state);
}


export function checkDefaultValues(defaults, state) {

  for (const selector in defaults) {
    const currentValue = resolvePathInState(selector, state);

    if (!currentValue)
        return false;

    // case of multiple selection
    if (Array.isArray(defaults[selector])) {

      if (defaults[selector].length === currentValue.length)
        currentValue.forEach(s => {
          if (defaults[selector].indexOf(s.name) === -1) {
            return false;
          }
        });
      else {
        return false;
      }
    }
    // case not in state.selectors but in state directly
    else {
      // cancel trigger is no currentValue or not the default
      if (currentValue.name !== defaults[selector]) {
        return false;
      }
    }
  }
  return true;
}
