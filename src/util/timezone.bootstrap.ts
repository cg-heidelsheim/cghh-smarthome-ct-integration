import moment from 'moment-timezone';

// `moment-timezone` is a process-wide singleton (Node caches the module), so setting the
// default here affects every `moment()` call in the process regardless of which file
// required it first - this used to be repeated verbatim in 8 separate files. Any module
// that needs Berlin-local date math should require this file (which re-exports the
// already-configured `moment`) instead of requiring 'moment-timezone' and setting the
// default itself again.
moment.tz.setDefault('Europe/Berlin');

export = moment;
