/**
 * Compares `a` against `b` field-by-field over the given field names, using strict
 * equality. Used by the various *State models' equalsValueAttributes(other), which were
 * previously three independent, identical (null-check + field-by-field ===) implementations.
 *
 * @returns false if `b` is falsy, otherwise whether every field matches.
 */
export function shallowEqualsOn<T extends object>(a: T, b: T | null | undefined, fields: (keyof T)[]): boolean {
    if (!b) {return false;}
    return fields.every((field) => a[field] === b[field]);
}
