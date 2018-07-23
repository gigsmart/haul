/**
 * Copyright 2017-present, Callstack.
 * All rights reserved.
 *
 * @flow
 */

// The delta format is implemented in com.facebook.react.devsupport.BundleDeltaClient
type DeltaModuleEntry = [number, string | null];
type DeltaModuleMap = DeltaModuleEntry[];
type DeltaBundleObject = {
  id?: string,
  pre?: DeltaModuleMap,
  delta?: DeltaModuleMap,
  post?: DeltaModuleMap,
};

// The logic it uses is quite simple: the app keeps an initially empty copy of this data:
//
// ```
// constructor() {
//   this.id = null;
//   this.pre = {};
//   this.delta = {};
//   this.post = {};
// }
// ```
//
// Whenever a reload is requested, it appends `&deltaBundleId=${id}` to the url if
// `this.id` is set, and on receiving a result performs something like:
//
// ```
// deltaToBundle(delta) {
//   if ('id' in delta) this.id = delta.id;
//   for (const name of ['pre', 'delta', 'post']) {
//     if (name in delta) {
//       for (const [id, content] of delta[name]) {
//         if (content !== null) {
//           this[name][id] = content;
//         } else {
//           delete this[name][id];
//         }
//       }
//     }
//   }
//   return [
//     ...Object.values(this.pre),
//     ...Object.values(this.delta),
//     ...Object.values(this.post),
//   ].join('\n');
// }
// ```
//
// Note in particular that the map type it uses is LinkedHashMap,
// which preserves *initial* insertion order, but ideally your modules
// don't have order dependencies other than pre before delta before post.
//
// As you might imagine, react native packager uses pre for polyfills and
// the module system, and post for the entry calls to require() and the
// source[Mapping]URL comment.
//
// After all that, though, it's clear the simplest implementation of
// delta bundles is to simply have a one module bundle that contains
// the entire source.
//
// I assume the idea is the react native bundler looks at the deltaBundleId
// and a mapping of modules that have changed since that id so it knows
// what to rebuild - a better version of deltas could track the webpack
// asset and module hashes in the same way, but it would probably not help
// that much unless network transfer time is the limiting factor?

module.exports = function createDeltaBundle(source: string) {
  const deltaObject: DeltaBundleObject = {
    delta: [[0, source]],
  };

  return Buffer.from(JSON.stringify(deltaObject));
};
