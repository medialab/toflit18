import decypher from "decypher";
const { Expression } = decypher;

// utility
const filterItemsByIdsRegexps = (items, variable) => {
  const params = {};
  let idsExpression = null;
  let regexpsExpression = null;
  if (items.ids && items.ids.length > 0) {
    idsExpression = new Expression(`${variable}.id IN \$${variable}Ids`);
    params[`${variable}Ids`] = items.ids;
  }

  let i = 0;
  items.regexps.forEach(r => {
    regexpsExpression = new Expression(`${variable}.name =~ \$${variable}Pattern${i}`);
    params[`${variable}Pattern${i}`] = `(?im).*${r}.*`;
    i++;
  });
  if (idsExpression && regexpsExpression) return { expression: idsExpression.or(regexpsExpression), params };

  if (idsExpression) return { expression: idsExpression, params };

  if (regexpsExpression) return { expression: regexpsExpression, params };

  return new Expression("true");
};

export default filterItemsByIdsRegexps;
