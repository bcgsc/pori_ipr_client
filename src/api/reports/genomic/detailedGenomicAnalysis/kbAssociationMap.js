/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.kb.associations', ['_', '$http', '$q', (_, $http, $q) => {

  let $kbAssoc = {};

  // Association Map
  let $map = {
    "inferred sensitivity": "therapeutic",
    "inferred resistance": "therapeutic",
    "sensitivity": "therapeutic",
    "resistance": "therapeutic",
    "targetable": "therapeutic",

    "favourable": "prognostic",
    "unfavourable": "prognostic",
    "progression": "prognostic",

    "diagnostic": "diagnostic",

    "cancer associated gene": "biological",
    "recurrent": "biological",
    "gain-of-function": "biological",
    "loss-of-function": "biological",
    "switch-of-function": "biological",
    "no gain-of-function": "biological",
    "no loss-of-function": "biological",
    "reduced-function": "biological",
    "inferred loss-of-function": "biological",
    "weakly-reduced-function": "biological",
    "increased-function": "biological",
    "weakly-increased-function": "biological",
    "putative oncogene": "biological",
    "oncogene": "biological",
    "putative tumour suppressor": "biological",
    "tumour suppressor": "biological",
    "oncogenic fusion": "biological",
    "disruptive fusion": "biological",
    "dominant negative": "biological",

    "not specified": "*",
    "not determined": "*",
  };

  // Lookup Associagtion
  $kbAssoc.association = (assoc) => {
    if(!(assoc in $map)) return false;
    return $map[assoc];
  };

  return $kbAssoc;

}]);
