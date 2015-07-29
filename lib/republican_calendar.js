/**
 * TOFLIT18 Republican Calendar Utilities
 * =======================================
 *
 * Collection of functions used to handle the Republican calendar.
 */
const AN_REGEX = /An (\d+)/i;

export function normalizeYear(year) {
  const m = year.match(AN_REGEX);

  if (!m)
    return +year;

  const nb = m[1];

  if (nb < 2 || nb > 14)
    throw Error(
      `toflit18.republican_calendar.normalizeYear: invalid year ${year}.`
    );

  return (nb < 14) ? 1792 + (+nb) : 1805;
}
