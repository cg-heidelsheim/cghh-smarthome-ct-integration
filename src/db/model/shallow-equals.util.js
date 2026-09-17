/**
 * Compares `a` against `b` field-by-field over the given field names, using strict
 * equality. Used by the various *State models' equalsValueAttributes(other), which were
 * previously three independent, identical (null-check + field-by-field ===) implementations.
 *
 * @param {object} a
 * @param {object} b
 * @param {string[]} fields
 * @returns {boolean} false if `b` is falsy, otherwise whether every field matches.
 */
function shallowEqualsOn(a, b, fields) {
    if (!b) {return false;}
    return fields.every((field) => a[field] === b[field]);
}

module.exports = {shallowEqualsOn};
