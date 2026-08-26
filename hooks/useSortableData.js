"use client";

import { useMemo, useState } from "react";

function getByPath(item, path) {
  return path.split(".").reduce((value, segment) => value?.[segment], item);
}

/** Click-to-sort for a table's rows. `key` is a field name, or a dot path
 * for a nested value (e.g. "contact.name") — kept as a plain string rather
 * than a getter function so the "is this column active" check stays a
 * simple, stable equality comparison across renders. Clicking the same
 * column again flips direction; clicking a new column resets to ascending. */
export function useSortableData(items, initialKey = null, initialDir = "asc") {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);

  const sorted = useMemo(() => {
    if (!sortKey || !items) return items;
    const copy = [...items];
    copy.sort((a, b) => {
      const av = getByPath(a, sortKey);
      const bv = getByPath(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return av.localeCompare(bv, undefined, { sensitivity: "base" });
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    if (sortDir === "desc") copy.reverse();
    return copy;
  }, [items, sortKey, sortDir]);

  function requestSort(key) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return { sorted, sortKey, sortDir, requestSort };
}
