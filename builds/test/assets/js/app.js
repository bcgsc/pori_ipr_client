'use strict';

var app = angular.module('bcgscIPR', [
//	'env',
'templates', 'ngMaterial', 'ngResource', 'ngSanitize', 'ui.router', 'angularMoment', 'ngStorage', 'angularFileUpload', 'ngclipboard', 'angular-sortable-view', 'ngQuill', 'chart.js', 'btford.socket-io', 'ngMessages']);

// Register HTTP Error Handler
app.run(httpErrorHandler);

function httpErrorHandler($rootScope, toastService) {
		$rootScope.$on('httpError', function (event, eventData) {
				toastService.serverError(eventData.message);
		});
}

httpErrorHandler.$inject = ['$rootScope', 'toastService'];
'use strict';

app.filter('indefiniteArticle', function () {
  return function (noun) {
    return ['a', 'e', 'i', 'o', 'u'].indexOf(noun.charAt(0)) > -1 ? 'an' : 'a';
  };
});
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.analysis', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/analysis';

  var $analysis = {};

  /**
   * Get All Analyses
   *
   * Retrieve paginated analyses
   *
   * @param {object} params - URL parameters to append
   * @returns {promise} - Resolves with array of Analyses
   */
  $analysis.all = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api, { params: params }).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /**
   * Get Extended Analysis data for the provided ident
   *
   * @param {object} ident - UUID string to get extended analysis for
   * @returns {promise} - Resolves with object
   */
  $analysis.extended = function (ident) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/extended/' + ident).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /**
   * Add a new biopsy entry to API
   *
   * @param {object} data - New analysis object
   * @returns {*}
   */
  $analysis.add = function (data) {

    return $q(function (resolve, reject) {

      $http.post(api, data).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Update biopsy analysis entry
   *
   * @param {object} data - Updated object payload
   * @returns {Promise/object} - Resolves with updated entry
   */
  $analysis.update = function (data) {
    return $q(function (resolve, reject) {

      var payload = angular.copy(data);
      if (payload.analysis && Array.isArray(payload.analysis)) delete payload.analysis;

      $http.put(api + '/' + data.ident, payload).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Retrieve comparators list from API
   *
   * @returns {object} - Resolves with hashmap of comparators
   */
  $analysis.comparators = function () {
    return $q(function (resolve, reject) {

      $http.get(api + '/comparators').then(function (result) {
        resolve(result.data);
      }).catch(function (e) {
        reject(e);
      });
    });
  };

  return $analysis;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.bioapps', ['_', '$http', '$q', function (_, $http, $q) {

  var api = 'http://bioappsdev01:8104';
  var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJncm91cHMiOlsiZ3NjX2VtcGxveWVlIiwiUE9HIiwic2VxZGV2IiwiamlyYS11c2VycyIsImJpb2Z4Z3JwIiwidHVtb3VyX2NoYXJhY3Rlcml6YXRpb24iLCJTb2NpYWwgQ29tbWl0dGVlIiwiMXN0Zmxvb3IiLCJHU0NfQ09JX0FsbCIsIkdTQ19DT0lfUmVzZWFyY2hlciIsIlBPR2FuYWx5c2lzIiwiR1NDX1dlbGxuZXNzIiwiYmFtYm9vLWFkbWluIiwiZGV2X3N1cHBvcnQiXSwic3ViIjoiYnBpZXJjZSIsImlhdCI6MTUwNTc1NTA0OCwiZXhwIjoxNTA1ODQxNDQ4fQ.cuwFPEdkk3URFFDSTY2sbi5VbjUSsGM5gt4rEPAAVRuwl-t828BwtPb8IuLNjnSfj5dFwL8eX6b8kBzdX-UcMA';

  var $bioapps = {};

  /**
   * Get sample information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $bioapps.cancer_goup = function () {
    return $q(function (resolve, reject) {

      $http({
        method: 'GET',
        url: api + '/cancer_group',
        headers: {
          'x-token': token,
          Authorization: undefined,
          'Content-Type': 'application/json'
        }
      }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        console.log('Failed to get BioApps Cancer Group result', err);
        reject(err);
      });
      /*
      $http.get(api + '/cancer_group', {headers: {"X-Token": token, Authorization: undefined}}).then(
        (result) => { 
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to get BioApps Cancer Group result', err);
          reject(err);
        });
      */
    });
  };

  return $bioapps;
}]);
'use strict';

app.factory('api.complete', ['_', function (_) {

  // Dictionaries
  var dicts = {

    // Alterations
    alterations: {
      // Types
      type: {
        "biological": "Biological",
        "diagnostic": "Diagnostic",
        "prognostic": "Prognostic",
        "therapeutic": "Therapeutic",
        "unknown": "Uncharacterized"
      },
      variant: ["CNV", "ELV-RNA", "ELV-PROT", "FANN", "MUT", "SV"],
      evidence: {
        "case report": "Case Report",
        "case series": "Case Series",
        "clinical": "Clinical",
        "clinical trials": "Clinical Trials",
        "clinical-test": "Clinical-Test",
        "FDA-approved": "FDA-Approved",
        "inferred": "Inferred",
        "literature-review": "Literature-Review",
        "NCCN guidelines": "NCCN Guidelines",
        "not specified": "Not Specified",
        "pre-clinical": "Pre-Clinical",
        "reported": "Reported",
        "retrospective-clinical": "Retrospective-Clinical",
        "curated": "Curated"
      },
      disease: ["acute lymphocytic leukemia", "acute myeloid leukemia", "acute promyelocytic leukemia", "acute undifferentiated leukemia", "adenocarcinoma", "adrenocortical carcinoma", "adult sporadic papillary thyroid carcinoma", "aggressive systemic mastocytosis", "alveolar rhabdomyosarcoma", "anaplastic large cell lymphoma", "anaplastic oligodendroglioma", "anaplastic thyroid carcinoma", "aneurysmal bone cyst", "angiomatoid fibrous histiocytoma", "angiosarcoma", "B- and T-cell mixed leukemia", "B-cell acute lymphoblastic leukemia", "B-cell lymphoma", "basal cell carcinoma", "benign epithelial tumour", "benign melanocytic nevus", "biliary tract cancer", "bladder transitional cell carcinoma", "blue cell tumour", "bone Ewing's sarcoma", "brain cancer", "brain glioma", "breast cancer", "breast ductal carcinoma", "breast secretory carcinoma", "bronchiolo-alveolar adenocarcinoma", "Burkitt lymphoma", "carcinoma", "cellular schwannoma", "cervical cancer", "cholangiocarcinoma", "cholesteryl ester storage disease", "chondroid lipoma", "chondrosarcoma", "chronic eosinophilic leukemia", "chronic leukemia", "chronic lymphocytic leukemia", "chronic myeloid leukemia", "chronic myelomonocytic leukemia", "chronic myeloproliferative disease", "clear cell sarcoma", "collecting duct carcinoma", "colon cancer", "colorectal cancer", "congenital fibrosarcoma", "congenital mesoblastic nephroma", "cutaneous mastocytosis", "dermatofibrosarcoma protuberans", "desmoplastic small round cell tumour", "diffuse large B-cell lymphoma", "endometrial adenocarcinoma", "endometrial cancer", "endometrial stromal sarcoma", "epithelioid sarcoma-like hemangioendothelioma", "esophageal cancer", "esophagus squamous cell carcinoma", "estrogen-receptor positive breast cancer", "extraosseous Ewing's sarcoma", "extraskeletal myxoid chondrosarcoma", "familial adenomatous polyposis", "familial melanoma", "fibrosarcoma", "follicular lymphoma", "gallbladder adenocarcinoma", "gastric adenocarcinoma", "gastrointestinal stromal tumor", "germ cell cancer", "giant cell fibroblastoma", "glioblastoma multiforme", "haemangioma of the bone", "hairy cell leukemia", "head and neck cancer", "head and neck carcinoma", "head and neck squamous cell carcinoma", "hemangiopericytoma", "hemorrhagic thrombocythemia", "hepatocellular carcinoma", "hepatocellular fibrolamellar carcinoma", "Her2-receptor positive breast cancer", "high-grade ovarian serous carcinoma", "Hodgkin's lymphoma", "hypercalcemic type ovarian small cell carcinoma", "hypereosinophilic syndrome", "immunoblastic lymphoma", "indolent systemic mastocytosis", "inflammatory myofibroblastic tumor", "intrahepatic cholangiocarcinoma", "laryngeal carcinoma", "LEOPARD syndrome", "Li-Fraumeni syndrome", "lipoblastoma", "lipoma", "liposarcoma", "liposarcoma (with wildtype rb1 expression)", "low-grade fibromyxoid sarcoma", "low-grade glioma", "low-grade ovarian serous carcinoma", "lung adenocarcinoma", "lung adenoid cystic carcinoma", "lung cancer", "lung carcinoma", "lung large cell carcinoma", "lung small cell carcinoma", "lung squamous cell carcinoma", "lymphoma", "malignant pleural mesothelioma", "malignant spindle cell melanoma", "mammary analogue secretory carcinoma", "mantle cell lymphoma", "mast-cell leukemia", "mastocytosis", "medulloblastoma", "megakaryocytic leukemia", "melanoma", "mesenchymal chondrosarcoma", "mucinous adenocarcinoma", "mucoepidermoid carcinoma", "mucosal melanoma", "multiple myeloma", "myelodysplastic myeloproliferative cancer", "myelofibrosis", "myeloma", "myoepithelial tumour of soft tissue and bone", "myxoid chondrosarcoma", "nasopharyngeal angiofibroma", "nasopharynx carcinoma", "neuroblastoma", "neuroendocrine tumor", "nodular fasciitis", "non-small cell lung carcinoma", "Noonan syndrome", "not specified", "NUT midline carcinoma", "osteosarcoma", "ovarian cancer", "ovarian carcinoma", "ovarian clear cell carcinoma", "ovarian serous carcinoma", "ovary adenocarcinoma", "ovary epithelial cancer", "ovary serous adenocarcinoma", "pancreas adenocarcinoma", "pancreatic cancer", "pancreatic ductal adenocarcinoma", "pancreatic neuroendocrine tumor", "papillary renal cell carcinoma", "papillary thyroid carcinoma", "papillary transitional carcinoma", "pediatric acute myeloid leukemia", "pediatric fibrosarcoma", "pediatric primitive round cell sarcoma", "peripheral T-cell lymphoma", "peritoneal mesothelioma", "pilocytic astrocytoma", "pleomorphic salivary gland adenocarcinoma", "plexiform neurofibroma", "primary unknown", "progesterone-receptor positive breast cancer", "prostate cancer", "pulmonary myxoid sarcoma", "pulmonary sarcomatoid carcinoma", "rectosigmoid cancer", "renal cell carcinoma", "renal clear cell carcinoma", "retinoblastoma", "rhabdoid cancer", "rhabdomyosarcoma", "salivary gland adenoma", "salivary gland cancer", "salivary gland carcinoma", "salivary gland pleomorphic adenoma", "sarcoma", "sideroblastic anemia with ringed sideroblasts", "signet ring cell adenocarcinoma", "skin squamous cell carcinoma", "small round cell sarcoma", "spindle cell rhabdomyosarcoma", "squamous cell carcinoma", "stomach cancer", "synovial sarcoma", "systemic type anaplastic large cell lymphoma", "T-cell adult acute lymphocytic leukemia", "T-cell leukemia", "therapy-related myeloid neoplasia", "thymic carcinoma", "thyroid adenoma", "thyroid cancer", "transitional cell carcinoma", "urinary bladder cancer", "uterine corpus endometrial carcinoma", "uterine leiomyoma", "uveal melanoma", "vulva adenocarcinoma", "waldenstrom macroglobulinemia"],
      association: ["acquired resistance", "activates-pathway", "associated-pathway", "associated-with", "cancer associated gene", "characteristic-of", "conditional loss-of-function", "cooperative-events", "diagnostic", "disruptive fusion", "dominant gain-of-function", "dominant negative", "eligibility", "equally-as-effective-as", "favourable", "gain-of-function", "haploinsufficient", "increased-function", "inferred FDA-approved", "inferred gain-of-function", "inferred loss-of-function", "inferred resistance", "inferred sensitivity", "inhibits-pathway", "less-effective-than", "likely gain-of-function", "likely oncogenic", "loss-of-function", "minimal resistance", "minimal sensitivity", "more-effective-than", "mutation hotspot", "no dominant negative", "no functional effect", "no gain-of-function", "no loss-of-function", "no resistance", "no response", "no sensitivity", "not determined", "not specified", "observed", "oncogene", "oncogenic fusion", "pathogenic", "putative disease-driver", "putative oncogene", "putative tumour suppressor", "recurrent", "reduced-function", "reduced-sensitivity", "resistance", "response", "sensitivity", "switch-of-function", "targetable", "test target", "tumour suppressor", "unfavourable", "weakly-increased-function", "weakly-reduced-function"],
      zygosity: ["any", "ns", "homozygous", "heterozygous", "na"],
      referenceTypes: ["ClinicalTrials.gov id", "curated database", "database", "doi", "other", "pmcid", "pubmed", "url"]
    },
    knowledgebase: {

      sampleType: ["caenorhabditis elegans", "chicken", "drosophila melanogaster", "hamster", "human cell-line", "human patient", "human patient-cells", "human patient-xenograft", "mouse", "rat", "saccharomyces cerevisiae", "saccharomyces pombe"],
      preClinicalModel: ["dominant negative", "inhibitor", "knockout", "mutant", "RNAi"]

    }
  };

  return {
    // Create Searchable
    Alterations: {
      // For Alterations Type
      Type: function Type(query) {
        query = query && query.toLowerCase();
        return _.chain(_alterations.type).keys().filter(function (alteration) {
          if (!query) {
            return true;
          }
          return alteration.toLowerCase().indexOf(query) !== -1;
        }).map(function (alteration) {
          return _.startCase(alteration);
        }).value();
      }
    },

    get: function get(getter) {
      return dicts[getter];
    }
  };
}]);
'use strict';

/*
 * BCGSC - IPR-Client BCGSC JIRA API
 *
 * This API factory implements the IPR-API. Calls to and from the BCGSC JIRA API are
 * managed through this factory.
 *
 */
app.factory('api.jira', ['_', '$http', '$q', 'api.user', function (_, $http, $q, $user) {

  var api = 'https://www.bcgsc.ca/jira/rest/api/2';
  var apiProxy = CONFIG.ENDPOINTS.API + '/jira';
  var $jira = {};
  var $session = null;

  /**
   * JIRA Ticket Namespace
   *
   */
  $jira.ticket = {

    /**
     * Create a BCGSC JIRA Ticket
     *
     * @param {string} project - project key (DEVSU, TC, UGNE, SVIA, etc.)
     * @param {string} type - Ticket type (Task, Sub-task, Bug, etc.)
     * @param {string} summary - Ticket Title
     * @param {string} description - Body/text of ticket
     * @param {object} options - Key-value paired hashmap of other options: parent, assignee, labels, priority
     *
     * @returns promise
     */
    create: function create(project, type, summary, description) {
      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};


      var deferred = $q.defer();

      var ticket = {
        fields: {
          project: {
            key: project
          },
          summary: summary,
          issuetype: {
            name: type,
            subtask: options.subtask ? options.subtask : false
          },
          description: description,
          priority: {
            name: options.priority ? options.priority : "Medium" // Default priority is medium
          }
        }
      };

      // Are we adding asignee?
      if (options.assignee) ticket.fields.assignee = { key: options.assignee, name: options.assignee };
      if (options.components) ticket.fields.components = options.components;
      if (options.parent) ticket.fields.parent = { key: options.parent };
      if (options.labels) ticket.fields.labels = _.map(options.labels, function (l) {
        return l.replace(/\s+/g, '-');
      });
      if (options.security) ticket.fields.security = { "name": "POG Restricted" };

      // Send POST to JIRA
      $http.post(api + '/issue', ticket, { headers: { authorization: undefined }, withCredentials: true }).then(function (response) {
        // Resolve response
        deferred.resolve(response.data);
      }, function (error) {
        // Reject
        deferred.reject({ status: error.status, body: error.data });
      });

      return deferred.promise;
    },

    /**
     * Add subtask to existing ticket
     *
     *
     * @param {string} ticket
     * @param {string} title
     * @param {string} description
     * @returns {{resolve, reject, promise}|*|Deferred}
     */
    subtask: function subtask(ticket, title, description) {

      var deferred = $q.defer();

      // Try to create ticket
      $http.post(apiProxy + '/subtask', { title: title, ticket: ticket, description: description }).then(function (resp) {
        deferred.resolve(resp.data);
      }, function (err) {
        // After testing, we'll check response header to see if user needs to login to JIRA first.
        console.log('JIRA Sub-task create error', err);
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Get a ticket from JIRA
     *
     * @param {string} auth - a Base64 string of username:password
     * @param {string} ticket - JIRA ticket ID
     *
     * @returns promise
     */
    get: function get(ticket) {

      var deferred = $q.defer();

      // Send POST to JIRA
      $http.get(api + '/issue/' + ticket).then(function (response) {
        // Resolve response
        deferred.resolve(response.data);
      }, function (error) {
        // Reject
        deferred.reject({ status: error.status, body: error.data });
      });

      return deferred.promise;
    }

  };

  /**
   * Get JIRA ticket priorities available
   *
   * @returns {Promise} - Resolves with array of priorities
   */
  $jira.priority = function () {
    return $q(function (resolve, reject) {

      $http.get(api + '/priority', { headers: { authorization: undefined }, withCredentials: true }).then(function (response) {
        resolve(response.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * JIRA Session Management
   *
   */
  $jira.session = {
    /**
     * Attempt a login session on the BCGSC JIRA server
     *
     * @param {string} username - JIRA Username
     * @param {string} password - JIRA Password
     * @returns {*|promise|Promise}
     */
    login: function login(username, password) {

      var deferred = $q.defer();

      $http.post(api + '/session', { username: username, password: password }).then(function (response) {
        // TODO: Store the cookie on user table
        deferred.resolve(response.data);
      }, function (error) {
        deferred.reject({ status: error.status, body: error.data });
      });

      return deferred.promise;
    },

    current: function current() {
      $q(function (resolve, reject) {
        $http.get('https://www.bcgsc.ca/jira/rest/auth/' + '1/session', { headers: { authorization: undefined }, withCredentials: true }).then(function (response) {
          console.log('Current Authentication status', response);
          resolve(response);
        }, function (err) {
          console.log('Failed to retrieve authentication status from JIRA', err);
          reject();
        });
      });
    }
  };

  /**
   * JIRA Projects Namespace
   *
   */
  $jira.projects = {

    /**
     * Get All Projects available on JIRA
     *
     * @returns {Promise} - Resolves with array of projects
     */
    all: function all() {
      return $q(function (resolve, reject) {
        $http.get(api + '/project', { headers: { authorization: undefined }, withCredentials: true }).then(function (result) {
          resolve(result.data);
        }).catch(function (err) {
          reject(err);
        });
      });
    },

    /**
     * Get JIRA Project Details
     *
     * @returns {Promise} - Resolves with array of projects
     */
    get: function get(project) {
      return $q(function (resolve, reject) {
        $http.get(api + '/project/' + project, { headers: { authorization: undefined }, withCredentials: true }).then(function (result) {
          resolve(result.data);
        }).catch(function (err) {
          reject(err);
        });
      });
    },

    /**
     * Get Project Security Levels available
     *
     * @param {string} project - Project key name
     * @returns {*}
     */
    getSecurityLevels: function getSecurityLevels(project) {
      return $q(function (resolve, reject) {
        $http.get(api + '/project/' + project + '/securitylevel', { headers: { authorization: undefined }, withCredentials: true }).then(function (response) {
          resolve(response.data);
        }).catch(function (err) {
          reject(err);
        });
      });
    }

  };

  return $jira;
}]);
"use strict";

app.factory('api.knowledgebase', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/knowledgebase';

  var $kb = {};

  /**
   * Get controlled vocabulary JSON arrays
   *
   * @returns {Promise}
   */
  $kb.vocabulary = function () {
    var deferred = $q.defer();

    $http.get(api + '/controlled-vocabulary').then(function (result) {
      deferred.resolve(result.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  $kb.validate = {

    /**
     * Validate provided KB Events string
     *
     * @param {string} input - Input string to be validated against KB Regex
     * @returns {promise|object} - Resolves with {valid: {input}}
     */
    events: function events(input) {
      var deferred = $q.defer();

      $http.post(api + '/validate/events', { events_expression: input }).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

  };

  /**
   * Check for a gene or variant in KB & HUGO
   *
   * @param {string} query - Input string to search DB against
   * @returns {Promise|array} - Resolves an array of text values
   */
  $kb.genevar = function (query) {
    var deferred = $q.defer();

    $http.get(api + '/genevar?query=' + query).then(function (result) {
      deferred.resolve(result.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Get KB Metrics
   *
   * @returns {Promise|object} - Resolves a key-value pair of metric data
   */
  $kb.metrics = function () {
    var deferred = $q.defer();

    $http.get(api + '/metrics').then(function (result) {
      deferred.resolve(result.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Search the disease ontology list
   *
   * @param {string} query - Input string to search DB against
   * @returns {Promise|array} - Resolves an array of text values
   */
  $kb.diseaseOntology = function (query) {
    var deferred = $q.defer();

    $http.get(api + '/disease-ontology?query=' + query).then(function (result) {
      deferred.resolve(result.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Get history for a data entry
   *
   * @param {string} type - The type of entry to lookup history for (entry, reference)
   * @param {string} ident - The UUIDv4 identification string
   * @returns {Promise} - Resolves with the history array
   */
  $kb.history = function (type, ident) {

    var deferred = $q.defer();

    $http.get(api + '/history', { params: { type: type, entry: ident } }).then(function (result) {
      deferred.resolve(result.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  $kb.references = {

    /**
     * Get KB References
     *
     * Paginated interface
     *
     * @param {int} limit - Pagination records requested
     * @param {int} offset - Pagination start point
     * @param {object} filters - Query string filter arguments
     *
     * @returns {promise|collection} - Resolves with a collection
     */
    all: function all() {
      var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var filters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var deferred = $q.defer();
      var processFilters = {};

      // Process Filters
      _.forEach(filters, function (value, filter) {
        if (filter === 'search') return processFilters[filter] = value;
        processFilters[filter] = _.join(value, ',');
      });

      var opts = { params: processFilters };
      opts.params.limit = limit;
      opts.params.offset = offset;

      $http.get(api + '/references', opts).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Get the count of references
     *
     * Informs pagination
     *
     * @returns {promise} - Resolves a key-value pair object with the amount of references
     */
    count: function count() {
      var filters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var deferred = $q.defer();
      var processFilters = {};

      // Process Filters
      _.forEach(filters, function (value, filter) {
        if (filter === 'search') return processFilters[filter] = value;
        processFilters[filter] = _.join(value, ',');
      });

      var params = { params: processFilters };

      $http.get(api + '/references/count', params).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Update an existing reference entry
     *
     * @param {object} reference - The updated reference object
     * @returns {Promise} - Resolves with the updated entry
     */
    update: function update(reference) {
      var deferred = $q.defer();

      $http.put(api + '/references/' + reference.ident, reference).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Update reference status
     *
     * @param {object} reference - Reference object
     * @param {string} status - Status to update reference to
     * @param {string} comments - Comment to log update with
     * @returns {Promise} - Resolves with updated object
     */
    status: function status(reference, _status, comments) {
      var deferred = $q.defer();

      $http.put(api + '/references/' + reference.ident + '/status/' + _status, { comments: comments }).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Create a new reference entry
     *
     * @param {object} reference - The new reference object
     * @returns {Promise} - Resolves with the created entry
     */
    create: function create(reference) {
      var deferred = $q.defer();

      $http.post(api + '/references', reference).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Remove a reference entry
     *
     * @param {string} reference - The ident of the entry to be removed
     * @returns {Promise} - Resolves with success
     */
    remove: function remove(reference) {
      var deferred = $q.defer();

      $http.delete(api + '/references/' + reference).then(function (result) {
        deferred.resolve(result.status);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

  };

  $kb.events = {

    /**
     * Get KB Events
     *
     * Paginated interface
     *
     * @param {int} limit - Pagination records requested
     * @param {int} offset - Pagination start point
     * @param {object} filters - Query string filter arguments
     *
     * @returns {Promise|collection} - Resolves with a collection
     */
    all: function all(limit, offset, filters) {
      var deferred = $q.defer();
      var processFilters = {};

      // Process Filters
      _.forEach(filters, function (value, filter) {
        if (filter === 'search') return processFilters[filter] = value;
        processFilters[filter] = _.join(value, ',');
      });

      var opts = { params: processFilters };
      opts.params.limit = limit;
      opts.params.offset = offset;

      $http.get(api + '/events', opts).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Get the count of events
     *
     * Informs pagination
     *
     * @returns {promise} - Resolves a key-value pair object with the amount of events
     */
    count: function count() {
      var filters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var deferred = $q.defer();
      var processFilters = {};

      // Process Filters
      _.forEach(filters, function (value, filter) {
        if (filter === 'search') return processFilters[filter] = value;
        processFilters[filter] = _.join(value, ',');
      });

      var params = { params: processFilters };

      $http.get(api + '/events/count', params).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Update an existing event entry
     *
     * @param {object} event - The updated event object
     * @returns {Promise} - Resolves with the updated entry
     */
    update: function update(event) {
      var deferred = $q.defer();

      $http.put(api + '/events/' + event.ident, event).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Update event status
     *
     * @param {object} event - Event object
     * @param {string} status - Status to update event to
     * @param {string} comments - Comment to log update with
     * @returns {Promise} - Resolves with updated object
     */
    status: function status(event, _status2, comments) {
      var deferred = $q.defer();

      $http.put(api + '/events/' + event.ident + '/status/' + _status2, { comments: comments }).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Create a new event entry
     *
     * @param {object} event - The new reference object
     * @returns {Promise} - Resolves with the created entry
     */
    create: function create(event) {
      var deferred = $q.defer();

      $http.post(api + '/events', event).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Remove a event entry
     *
     * @param {string} event - The ident of the entry to be removed
     * @returns {Promise} - Resolves with success
     */
    remove: function remove(event) {
      var deferred = $q.defer();

      $http.delete(api + '/events/' + event).then(function (result) {
        deferred.resolve(result.status);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

  };

  return $kb;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.lims', ['_', '$http', '$q', function (_, $http, $q) {

  var api = 'https://lims16.bcgsc.ca';

  var $lims = {};

  $lims.diseaseOntology = function (query) {

    return $q(function (resolve, reject) {

      var req = $http({
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Authorization': undefined
        },
        url: api + '/alpha/limsapi/elastic/disease_ontology/' + query
      });

      //let = $http.get(api + '/elastic_search', opts)

      req.then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Get sample information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $lims.sample = function (pogs) {
    return $q(function (resolve, reject) {

      // Convert string pogid to array
      if (typeof pogs === 'string') {
        pogs = [pogs];
      }

      var body = {
        filters: {
          op: "in",
          content: {
            field: "participant_study_id",
            value: pogs
          }
        }
      };

      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/sample', body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        console.log('Failed to get LIMS sample result', err);
        reject(err);
      });
    });
  };

  /**
   * Get source information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $lims.source = function (pogs) {
    return $q(function (resolve, reject) {

      // Convert string pogid to array
      if (typeof pogs === 'string') {
        pogs = [pogs];
      }

      var body = {
        filters: {
          op: "in",
          content: {
            field: "participant_study_id",
            value: pogs
          }
        }
      };

      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/source', body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        console.log('Failed to get LIMS sample result', err);
        reject(err);
      });
    });
  };

  /**
   * Get Library information from LIMS
   *
   * @param {array} names - Names of libraries to look up
   * @returns {*}
   */
  $lims.library = function (names) {
    return $q(function (resolve, reject) {

      if (typeof names === 'string') {
        names = [names];
      }

      var body = {
        filters: {
          op: "in",
          content: {
            field: "name",
            value: names
          }
        }
      };

      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/library', body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        console.log('Failed to get LIMS library result', err);
        reject(err);
      });
    });
  };

  /**
   * Get Illumina Sequencing Run information from LIMS
   *
   * @param {array} libraries - Libraries to look up
   * @returns {*}
   */
  $lims.illumina_run = function (libraries) {
    return $q(function (resolve, reject) {

      if (typeof names === 'string') {
        libraries = [libraries];
      }

      var body = {
        filters: {
          op: "or",
          content: [{
            op: "in",
            content: {
              field: "library",
              value: libraries
            }
          }, {
            op: "in",
            content: {
              field: "multiplex_library",
              value: libraries
            }
          }]
        }
      };

      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/illumina_run', body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        console.log('Failed to get LIMS Illumina run result', err);
        reject(err);
      });
    });
  };

  return $lims;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pog', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';
  var _pogs = []; // Local POGS cache by ident


  var $pog = {};

  /**
   * Get All POGs
   *
   * Retrieve all POGs from API that user can access
   *
   * @param {object} opts - Options block
   * @returns {promise} - Resolves with array of POGs
   */
  $pog.all = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return $q(function (resolve, reject) {
      var url = api;

      /*
      if(opts.all !== false || opts.query !== null || opts.role) {
        url += '?';
        if(opts.all !== false) url += 'all=true&';
        if(opts.query) url += 'query='+opts.query+'&';
        if(opts.role) url += 'role='+opts.role+'&';
      }*/

      // Retrieve from API
      $http.get(url, { params: opts }).then(function (result) {
        // Empty Cache
        _pogs = [];

        // Load into cache
        _.forEach(result.data, function (val) {
          _pogs.push(val);
        });

        resolve(_pogs);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Get one POG
   *
   * Retrieve one POG from API.
   *
   */
  $pog.id = function (POGID) {

    return $q(function (resolve, reject) {

      // Lookup in cache first
      if (_pogs[POGID] !== undefined) return resolve(_pogs[POGID]);

      // Get result from API
      $http.get(api + '/' + POGID).then(function (result) {
        _pogs[result.data.POGID] = result.data;
        resolve(_pogs[result.data.POGID]);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Load a new POG
   *
   * Load a new POG into the API from sources
   *
   * @param string POGID
   *
   */
  $pog.load = function (POGID) {

    var deferred = $q.defer();

    // Custom data stream from API for loading
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function (stateChange) {

      // On data drip
      if (xhttp.readyState === 3) {
        deferred.notify(xhttp.responseText);
      }

      // Wait until readyState === 4 (request finished)
      if (xhttp.readyState === 4) {

        if (xhttp.status >= 200 && xhttp.status < 400) {

          deferred.resolve(xhttp.responseText);
        } else {
          reject(xhttp);
        }
      }
    };

    xhttp.open('GET', api + '/' + POGID + '/loadPog', true);
    xhttp.send();

    return deferred;
  };

  // Empty out cache
  $pog.destroy = function () {

    _pogs = {};
  };

  $pog.user = function (POGID) {
    return {
      bind: function bind(ident, role) {

        var deferred = $q.defer();

        $http.post(api + '/' + POGID + '/user', { user: ident, role: role }).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      },

      unbind: function unbind(ident, role) {
        var deferred = $q.defer();

        $http({
          url: api + '/' + POGID + '/user',
          method: 'DELETE',
          data: {
            user: ident,
            role: role
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };
  };

  $pog.export = function (POGID) {
    return {

      /**
       * Run export
       * @returns {promise} - Resolves the export return
       */
      csv: function csv() {
        var deferred = $q.defer();

        // Send request
        $http.get(api + '/' + POGID + '/export/csv').then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      },

      /**
       * Get all pog export entries
       *
       * @returns {promise} - Resolves with array of pog export events
       */
      all: function all() {

        var deferred = $q.defer();

        // Send request
        $http.get(api + '/' + POGID + '/export/all').then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };
  };

  return $pog;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pogDataHistory', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $history = {};

  /**
   * Setup History Object for Querying
   *
   * @params {string} POGID - PogID to be queried against (eg. POG123)
   */
  $history = function $history(POGID, report) {

    var API = api + '/' + POGID + '/report/' + report;

    return {

      /**
       * Get list of all history events for a POG
       *
       * @returns {promise|array} - Returns a list of all history events for a POG
       */
      all: function all() {
        var deferred = $q.defer();

        $http.get(API + '/history').then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      },

      /**
       * Get a detailed entry of a history event
       *
       * @param {string} ident - UUID of history event
       * @returns {promise|object} - Resolves with hashmap of detailed version data. Rejects with $http error response
       */
      detail: function detail(ident) {
        var deferred = $q.defer();

        $http.get(API + '/history/detail/' + ident).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      },

      /**
       * Reverts a change history event from new to previous
       *
       * @param {string} ident - UUID of history event
       * @returns {promise|object} - Returns new history object that defines the change
       */
      revert: function revert(ident, comment) {
        var deferred = $q.defer();

        $http.put(API + '/history/revert/' + ident, { comment: comment }).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      },

      /**
       * Restores a remove history event
       *
       * @param {string} ident - UUID of history event
       * @returns {promise|boolean} - Returns boolean
       */
      restore: function restore(ident, comment) {
        var deferred = $q.defer();

        $http.put(API + '/history/restore/' + ident, { comment: comment }).then(function (resp) {
          deferred.resolve(true);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      },

      /**
       * All Tag entries
       *
       */
      tag: {

        /**
         * Get all history tags
         *
         * @returns {promise|array} - Resolves with an array of tags associated to any history objects in the POG
         */
        all: function all() {
          var deferred = $q.defer();

          $http.get(API + '/history/tag').then(function (resp) {
            deferred.resolve(resp.data);
          }, function (err) {
            deferred.reject(err);
          });

          return deferred.promise;
        },

        /**
         * Create a new tag
         *
         * If no history ident string is provided, the API will make one on the HEAD of the history log
         *
         * @param {object} tag - Text/name of the tag
         * @param {string} ident? - Optional history UUID ident string
         * @returns {promise|object} - Resolves with new tag object
         */
        create: function create(tag) {
          var ident = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

          var deferred = $q.defer();

          $http.post(API + '/history/tag/' + ident, tag).then(function (resp) {
            deferred.resolve(resp.data);
          }, function (err) {
            deferred.reject(err);
          });
          return deferred.promise;
        },

        /**
         * Remove a tag
         *
         * If no history ident string is provided, the API will make one on the HEAD of the history log
         *
         * @param {string} ident - Tg UUID ident string
         * @returns {promise|boolean} - Returns boolean
         */
        remove: function remove(ident) {
          var deferred = $q.defer();

          $http.delete(API + '/history/tag/' + ident).then(function (resp) {
            deferred.resolve(true);
          }, function (err) {
            deferred.reject(err);
          });
          return deferred.promise;
        },

        /**
         * Search for tags
         *
         * @param {string} query - Tg UUID ident string
         * @returns {promise|array} - Resolves an array of tags
         */
        search: function search(query) {
          var deferred = $q.defer();

          $http.get(API + '/history/tag/search/' + query).then(function (resp) {
            deferred.resolve(resp.data);
          }, function (err) {
            deferred.reject(err);
          });

          return deferred.promise;
        }
      }
    };
  };

  return $history;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.project', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/projects';

  var $project = {};

  /**
   * Get All Projects
   *
   * Retrieve all projects from API that user can access
   *
   * @returns {promise} - Resolves with array of projects
   */
  $project.all = function () {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  return $project;
}]);
'use strict';

/*
 * BCGSC - IPR-Client PUBMED Central API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pubmed', ['_', '$http', '$q', function (_, $http, $q) {

  // https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&id=25081398
  var api = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&rettype=abstract&id=';

  var $pubmed = {};

  /*
   * Get All POGS
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $pubmed.article = function (pmid) {
    return $q(function (resolve, reject) {

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function (stateChange) {

        // Wait until readyState === 4 (request finished)
        if (xhttp.readyState === 4) {

          if (xhttp.status >= 200 && xhttp.status < 400) {
            resolve(JSON.parse(xhttp.responseText).result[parseInt(pmid, 10)]);
          } else {
            reject(xhttp);
          }
        }
      };

      xhttp.open('GET', api + pmid, true);
      xhttp.send();
    });
  };

  return $pubmed;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.session', ['_', '$http', '$q', '$localStorage', 'api.user', 'api.pog', function (_, $http, $q, $localStorage, $user, $pog) {

  var localStorageKey = 'bcgscIprToken'; // Local Storage Token Key
  var api = CONFIG.ENDPOINTS.API + '/session'; // API Namespace setting

  var _token = null,
      // User API token
  initialized = false,
      // Set initialization status
  me = null,
      // Local lib cache
  $session = {}; // Session lib


  /*
   * Retrieve local me
   *
   * Return the session API local copy of me object
   *
   */
  $session.user = function () {
    return me;
  };

  $session.getToken = function () {
    return angular.copy(_token);
  };

  /*
   * Retrieve local me promise
   *
   * Takes the user() function above and wraps it in promise
   * for the patient functions.
   *
   */
  $session.$user = function () {
    // Wrap local me in Q promise so it can wait...
    return $q.when($session.user());
  };

  /*
   * Store session data
   *
   * Store local and other session data
   *
   */
  $session.store = function (token, user) {

    $localStorage[localStorageKey] = token; // Set token on client storage for session permanence
    $http.defaults.headers.common['Authorization'] = token; // Set $http header token
    me = user; // Set lib cache
  };

  /*
   * Initialize session
   *
   * Look for active session token and initialize!
   *
   */
  $session.init = function () {

    return $q(function (resolve, reject) {

      // Are we already initialized?
      if (initialized === true) resolve(me);

      // Retrieve token from local storage
      var token = $localStorage[localStorageKey];
      _token = token; // Set local cache.

      // Token exists?
      if (token === false || token === undefined || token === null) {
        reject('No auth token');
      }

      $http.defaults.headers.common['Authorization'] = token;

      // We've got a session token, lets try and get account details
      $user.me().then(function (me) {
        // Got a good token, store local
        $session.store(token, me);
        resolve(me);
      }).catch(function (err) {
        console.log('Failed to retrieve user following session init', err);
        reject({ message: 'Failed to initialize session' });
      });
    });
  };

  /*
   * User login attempt
   *
   * Attempt to validated provided credentials against the API.
   *
   */
  $session.login = function (username, password) {

    return $q(function (resolve, reject) {

      // Make http API call
      $http.post(api + '/', { username: username, password: password }).then(function (resp) {
        // Successful authentication
        // Check token from header
        _token = resp.headers('X-Token'); // Retrieve token from response

        $localStorage[localStorageKey] = _token; // Set token on client storage for session permanence
        $http.defaults.headers.common['Authorization'] = _token; // Set $http header token

        //$session.store(_token, resp.data); // Store response!

        $user._me = resp.data;

        resolve(resp);
      }).catch(function (error) {
        console.log('Reject login attempt', error);
        reject(error);
      });
    });
  };

  /*
   * End Session
   *
   * Destroy either current or all sessions
   *
   */
  $session.logout = function () {
    var all = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


    var deferred = $q.defer();

    // Logout of all?
    if (all === true) {
      // Session destroy all keys
    }

    if (all === false) {
      // Session destroy this key

      $http.delete(api + '/').then(function (resp) {

        // Local logout
        delete $localStorage[localStorageKey]; // Remove localStorage entry
        me = null; // Reset lib cache
        $user._me = null; // Reset $user lib cache
        $user._token = null; // Reset $user lib token
        _token = null; // Reset lib token cache
        delete $http.defaults.headers.common['Authorization']; // Remove authorization token entry

        deferred.resolve(true);
      }, function (err) {
        console.log(err);
        deferred.reject({ status: false, message: 'Unable to destroy API token.' });
      });
    }

    return deferred.promise;
  };

  return $session;
}]);
'use strict';

app.factory('api.socket', ['socketFactory', '$localStorage', '$q', function (socketFactory, $localStorage, $q) {

  var _ready = false;

  var myIoSocket = io.connect(CONFIG.ENDPOINTS.SOCKET);

  var socket = socketFactory({
    ioSocket: myIoSocket
  });

  socket.on('connect', function () {
    socket.emit('authenticate', { token: $localStorage.bcgscIprToken });
  });

  socket.on('authenticated', function (msg) {
    _ready = true;
    console.log('Socket.io successfully authenticated');
  });

  socket.on('disconnect', function () {
    console.log('Connection dropped.');
  });

  socket.ready = function () {
    return $q(function (resolve, reject) {
      _ready ? resolve() : reject();
    });
  };

  return socket;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.therapeuticOptions', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $therapeutic = {};

  /**
   * Get all POG therapeutic targets
   *
   * @params {string} POGID - PogID to be queried against (eg. POG123)
   */
  $therapeutic.all = function (POGID, report) {
    var deferred = $q.defer();

    $http.get(api + '/' + POGID + '/report/' + report + '/genomic/therapeuticTargets').then(function (resp) {
      deferred.resolve(resp.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Create a new Therapeutic Target Entry
   *
   * @param {string} POGID - POGID this entry will be related to
   * @param {object} entry - The therapeutic target entry to be created
   * @returns {Function|promise} - Resolves with the new data entry
   */
  $therapeutic.create = function (POGID, report, entry) {
    var deferred = $q.defer();

    $http.post(api + '/' + POGID + '/report/' + report + '/genomic/therapeuticTargets', entry).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  /**
   * Get all POG therapeutic targets
   *
   * @params {string} POGID - PogID to be queried against (eg. POG123)
   */
  $therapeutic.one = function (POGID, report) {

    var API = api + '/' + POGID + '/report/' + report + '/genomic/therapeuticTargets';

    return {

      /**
       * Retrieve therapeutic target entry
       *
       * @param {string} ident - UUID of entry
       * @returns {Function|promise} - Resolves with object of entry
       */
      retrieve: function retrieve(ident) {
        var deferred = $q.defer();

        $http.get(API + '/' + ident).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },

      /**
       * Update a single therapeutic target entry
       *
       * @param {string} ident - UUID of entry
       * @param {object} entry - Object of entry to be created
       * @returns {Function|promise} - Resolves with object of entry
       */
      update: function update(ident, entry) {
        var deferred = $q.defer();

        $http.put(API + '/' + ident, entry).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },

      /**
       * Remove therapeutic target entry
       *
       * @param {string} ident - UUID of entry
       * @returns {Function|promise} - Resolves with object of entry
       */
      remove: function remove(ident) {
        var deferred = $q.defer();
        $http.delete(API + '/' + ident).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

    };
  };

  return $therapeutic;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.service('api.user', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/user';
  var _token = null; // User API token
  var _groups = [];

  var $user = {};
  $user._me = undefined; // Local User Cache


  /**
   * Retrieve the authenticated user object
   *
   *
   * @returns {Promise}
   */
  $user.me = function () {

    return new Promise(function (resolve, reject) {

      if ($user._me && $user._me.ident) {
        return resolve($user._me);
      }

      // Detect Promise
      if ($user._me && !$user._me.ident) {
        $user._me.then(function (self) {
          _groups = self.data.groups;
          $user._me = self.data;
          resolve($user._me);
        }).catch(function (e) {
          console.log('Failed to retrieve user', e);
        });
      }

      // Detect not init'd
      if ($user._me === undefined) {
        $user._me = $http.get(api + '/me');

        $user._me.then(function (self) {
          _groups = self.data.groups;
          $user._me = self.data;
          resolve($user._me);
        }, function (error) {
          reject(error);
        });
      }
    });
  };

  /**
   * Check if user is an admin
   *
   * @returns {boolean}
   */
  $user.isAdmin = function () {
    var aGroups = _.filter(_groups, function (g) {
      if (g.name === 'superUser' || g.name === 'admin') return g;
    });

    return aGroups.length > 0;
  };

  /**
   * Get all users (admin)
   *
   * @returns {promise}
   */
  $user.all = function () {

    var deferred = $q.defer();

    $http.get(api).then(function (result) {
      deferred.resolve(result.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Update a user entry
   *
   * @param user
   * @returns {Function}
   */
  $user.update = function (user) {
    var deferred = $q.defer();

    $http.put(api + '/' + user.ident, user).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Create a new user account
   *
   * @param user
   * @returns {promise}
   */
  $user.create = function (user) {
    var deferred = $q.defer();

    $http.post(api + '/', user).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  $user.search = function (query) {
    var deferred = $q.defer();

    $http.get(api + '/search?query=' + query).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  $user.delete = function (user) {

    var deferred = $q.defer();

    // Remove User
    $http.delete(api + '/' + user.ident).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /* Group Functions */
  $user.group = {

    /**
     * Get all groups
     * @returns {promise}
     */
    all: function all() {
      var deferred = $q.defer();

      $http.get(api + '/group').then(function (resp) {
        deferred.resolve(resp.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Retrieve group
     *
     * @param {string} ident - Group Ident to be looked up
     */
    retrieve: function retrieve(ident) {
      return $q(function (resolve, reject) {
        $http.get(api + '/group/' + ident).then(function (resp) {
          resolve(resp.data);
        }, function (err) {
          reject(err);
        });
      });
    },

    /**
     * Create new Group
     * @param name
     * @returns {promise}
     */
    create: function create(group) {
      var deferred = $q.defer();

      $http.post(api + '/group', group).then(function (resp) {
        deferred.resolve(resp.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Remove a group
     * @param {string} ident - Group UUID Ident
     * @returns {promise}
     */
    remove: function remove(group) {
      var deferred = $q.defer();

      $http.delete(api + '/group/' + group.ident).then(function (resp) {
        deferred.resolve(resp.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Update a group
     * @param {string} ident - Group UUID Ident
     * @param {object} group - Group object to be updated
     * @returns {promise}
     */
    update: function update(ident, group) {
      var deferred = $q.defer();

      $http.put(api + '/group/' + ident, group).then(function (resp) {
        deferred.resolve(resp.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Group membership functions
     * @param {string} group - Group UUID Ident
     * @returns {{add: (function()), remove: (function())}}
     */
    member: function member(group) {
      return {

        /**
         * Add a user to a group
         * @param {string} user - User UUID ident
         * @returns {promise}
         */
        add: function add(user) {
          var deferred = $q.defer();

          $http.post(api + '/group/' + group + '/member', { user: user }).then(function (resp) {
            deferred.resolve(resp.data);
          }, function (err) {
            deferred.reject(err);
          });

          return deferred.promise;
        },

        /**
         * Remove a user from a group
         * @param {string} user - User UUID ident
         * @returns {promise}
         */
        remove: function remove(user) {
          var deferred = $q.defer();

          $http({
            url: api + '/group/' + group + '/member',
            method: 'DELETE',
            data: {
              user: user
            },
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(function (resp) {
            deferred.resolve(resp.data);
          }, function (err) {
            deferred.reject(err);
          });

          return deferred.promise;
        }
      };
    } // End Member functions

  };

  return $user;
}]);
'use strict';

/*
 * BCGSC - VariantDB API Interface
 *
 * This API factory implements the VardDB-API. Calls to and from the API are
 * managed through this factory.
 *
 */
app.factory('api.vardb', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.VARDB;
  var _token = null; // User API token
  var authHeader = '4a43e0cb-0d21-446a-bdbc-d3698c3fa1b6'; // TEMPORARY !TODO: Updated auth system for VarDB to store a token

  var $varDB = {};

  /**
   * Get other libraries a variant is found int
   *
   *
   * @params {integer} chromosome
   * @params {integer} position
   * @params {string} ref - The expected base
   * @params {string} alt - The alternate base
   * @returns {Promise|array} - Resolves with an array of library IDs, the count, and the total scanned
   */
  $varDB.variantLibraries = function (chromosome, position, ref, alt) {

    var deferred = $q.defer();

    var opt = {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'text/plain'
      },
      params: {
        chromosome: chromosome,
        position: position,
        ref: ref,
        alt: alt
      }
    };

    $http.get(api + '/variant_libraries', opt).then(function (result) {
      deferred.resolve(result.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Retrieve library metadata for libraries
   *
   * @param libraries
   * @returns {Promise|collection} - Resolves a collection of library metadata
   */
  $varDB.libraryMeta = function (libraries) {

    var deferred = $q.defer();

    // Convert single library into array
    if (typeof libraries === "string") libraries = [libraries];

    var opts = {};
    opts.params = { libraries: _.join(libraries, ',') };
    opts.headers = { "Authorization": authHeader };

    $http.get(api + '/library_metadata', opts).then(function (results) {
      deferred.resolve(results.data);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  return $varDB;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.recentReports', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/analysis_reports/recent/report';

  var $recent = {};

  /**
   * Get all recent reports
   *
   * @returns {Promise} - Resolves with array of recent report entries
   */
  $recent.all = function () {
    return $q(function (resolve, reject) {

      $http.get(api + '/').then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Add new entry
   *
   * @param {string} report - Ident string of analysis report
   * @param {string} state - The state string to be stored (current page)
   *
   * @returns {Promise} - Resolves with recent report entry
   */
  $recent.addOrUpdate = function (report, state) {
    return $q(function (resolve, reject) {

      $http.put(api + '/' + report, { state: state }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Remove Recent Report entry
   *
   * @param {string} report - Ident string of analysis report
   *
   * @returns {Promise} - Resolves with nothing
   */
  $recent.remove = function (report) {
    return $q(function (resolve, reject) {

      $http.delete(api + '/' + report).then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  return $recent;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */

app.factory('api.germline.report', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/germline_small_mutation';

  var $report = {};

  /**
   * Get all small mutation reports
   *
   * @returns {Promise} - Resolves with object of {total: int, reports: [{collection},{},...]}
   */
  $report.all = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return $q(function (resolve, reject) {

      $http.get('' + api, { params: params }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Get all reports for a biopsy
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {object} params - Parameters to pass
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.biopsy = function (patient, biopsy) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return $q(function (resolve, reject) {

      $http.get(api + '/patient/' + patient + '/biopsy/' + biopsy, { params: params }).then(function (reports) {
        resolve(reports);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Get a single report
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {object} params - Parameters to pass
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.one = function (patient, biopsy, report) {
    var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    return $q(function (resolve, reject) {
      $http.get(api + '/patient/' + patient + '/biopsy/' + biopsy + '/report/' + report, { params: params }).then(function (report) {
        resolve(report.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Update a single report
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {object} data - Updated report data payload
   * @param {object} params - Parameters to pass
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.update = function (patient, biopsy, report, data) {
    var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

    return $q(function (resolve, reject) {
      $http.put(api + '/patient/' + patient + '/biopsy/' + biopsy + '/report/' + report, data, { params: params }).then(function (report) {
        resolve(report.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Delete a report
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.delete = function (patient, biopsy, report) {
    return $q(function (resolve, reject) {
      $http.delete(api + '/patient/' + patient + '/biopsy/' + biopsy + '/report/' + report).then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Retrieve a flash token to download a report
   *
   * @returns {Promise/object} - Resolves with token object
   */
  $report.flash_token = function () {
    return $q(function (resolve, reject) {

      $http.get(api + '/export/batch/token').then(function (response) {
        resolve(response.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  return $report;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */

app.factory('api.germline.review', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/germline_small_mutation';

  var $review = {};

  /**
   * Add a new review
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {object} data - Review body payload
   *
   * @returns {Promise/object} - Resolves with created review object
   */
  $review.add = function (patient, biopsy, report, data) {
    return $q(function (resolve, reject) {

      $http.put(api + '/patient/' + patient + '/biopsy/' + biopsy + '/report/' + report + '/review', data).then(function (review) {
        resolve(review.data);
      }).catch(function (e) {
        reject(e);
      });
    });
  };

  /**
   * Remove a review
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report object UUID
   * @param {string} review - Review object UUID
   * @param {object} data - Review body payload
   *
   * @returns {Promise/object} - Resolves with created review object
   */
  $review.remove = function (patient, biopsy, report, review, data) {
    return $q(function (resolve, reject) {

      $http.delete(api + '/patient/' + patient + '/biopsy/' + biopsy + '/report/' + report + '/review/' + review, data).then(function () {
        resolve();
      }).catch(function (e) {
        reject(e);
      });
    });
  };

  return $review;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */

app.factory('api.germline.variant', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/germline_small_mutation';

  var $variant = {};

  /**
   * Get a variant
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {string} variant - Variant UUID
   *
   * @returns {Promise/object} - Resolves with variant object
   */
  $variant.one = function (patient, biopsy, report, variant) {
    return $q(function (resolve, reject) {

      $http.get(api + '/patient/' + patient + '/biopsy/' + biopsy + '/report/' + report + '/variant/' + variant).then(function (variant) {
        resolve(variant);
      }).catch(function (e) {
        reject(e);
      });
    });
  };

  /**
   * Update a variant
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report object UUID
   * @param {string} variant - Variant object UUID
   * @param {object} data - Review body payload
   *
   * @returns {Promise/object} - Resolves with created review object
   */
  $variant.update = function (patient, biopsy, report, variant, data) {
    return $q(function (resolve, reject) {

      $http.put(api + '/patient/' + patient + '/biopsy/' + biopsy + '/report/' + report + '/variant/' + variant, data).then(function (response) {
        resolve(response.data);
      }).catch(function (e) {
        reject(e);
      });
    });
  };

  return $variant;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.probe.alterations', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $APC = {};

  $APC.getAll = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/probe/alterations').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $APC.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/probe/alterations/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update APC', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      },

      /**
       * Create new Detailed Genomic Alterations Entry
       *
       * @param {object} data - Alteration data object
       * @returns {promise|object} - Promise resolves new entry
       */
      create: function create(data) {
        var deferred = $q.defer();

        $http.post(api + '/' + pog + '/report/' + report + '/probe/alterations/', data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to create APC', error);
          deferred.reject('Unable to create');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $APC.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/probe/alterations/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve requested alterations', error);
    });

    return deferred.promise;
  };

  // Update an existing entry
  $APC.update = function (pog, gene) {
    var deferred = $q.defer();

    //$http.put
  };

  // Create a new entry
  $APC.create = function (pog, gene) {};

  return $APC;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.probe.signature', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $signature = {};

  /**
   * Get Probe Signature Details
   *
   * Retrieve probe sign-off details
   *
   */
  $signature.get = function (POGID, report) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/probe/signature').then(function (result) {
        resolve(result.data);
      }, function (error) {
        reject(error);
      });
    });
  };

  /**
   * Sign the probe report
   *
   * @param {string} POGID - POGID
   * @param {string} report - Report Ident string
   * @param {string} role - Report signing role
   * @returns {Promise|object}
   */
  $signature.sign = function (POGID, report, role) {
    return $q(function (resolve, reject) {

      $http.put(api + '/' + POGID + '/report/' + report + '/probe/signature/' + role, {}).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Revoke a probe report signature
   *
   * @param {string} POGID - POGID
   * @param {string} report - Report Ident string
   * @param {string} role - Report signing role
   * @returns {Promise|object}
   */
  $signature.revoke = function (POGID, report, role) {
    return $q(function (resolve, reject) {

      $http.put(api + '/' + POGID + '/report/' + report + '/probe/signature/revoke/' + role, {}).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  return $signature;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.probe.testInformation', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $testInformation = {};

  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $testInformation.get = function (POGID, report) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/probe/testInformation').then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $testInformation;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.geneViewer', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $gv = {};

  $gv.get = function (pog, report, gene) {
    return $q(function (resolve, reject) {
      // Get result from API
      $http.get(api + '/' + pog + '/report/' + report + '/geneviewer/' + gene).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $gv;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.image', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $image = {};

  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $image.get = function (POGID, report, key) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/image/retrieve/' + key).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Get Density Graphs
   *
   *
   */
  $image.expDensityGraphs = function (POGID, report) {

    return $q(function (resolve, reject) {

      // Get Graphs
      $http.get(api + '/' + POGID + '/report/' + report + '/image/expressionDensityGraphs').then(function (result) {
        resolve(result.data);
      }, function (error) {
        reject(error.status);
      });
    });
  };

  /**
   * Retrieve Mutation Summary images for this POG
   *
   * @param {string} POGID - Patient Identifier
   * @param {string} report - Analysis Report identifier
   *
   * @returns {*}
   */
  $image.mutationSummary = function (POGID, report) {

    return $q(function (resolve, reject) {

      // Get Graphs
      $http.get(api + '/' + POGID + '/report/' + report + '/image/mutationSummary').then(function (result) {
        resolve(result.data);
      }, function (error) {
        reject(error.status);
      });
    });
  };

  /*
   * Get Subtype Plots
   *
   *
   */
  $image.subtypePlots = function (POGID, report) {

    return $q(function (resolve, reject) {

      // Get Graphs
      $http.get(api + '/' + POGID + '/report/' + report + '/image/subtypePlots').then(function (result) {
        resolve(result.data);
      }, function (error) {
        reject(error.status);
      });
    });
  };

  return $image;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pog_analysis_report', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API;

  var $report = {};

  /**
   * Get All Reports
   *
   * Retrieve all report from API that user can access
   *
   * @returns {promise} - Resolves with array of reports
   */
  $report.all = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return $q(function (resolve, reject) {

      var opts = {
        params: params
      };

      // Retrieve from API
      $http.get(api + '/reports', opts).then(function (reports) {
        resolve(reports.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /**
   * Get one Report
   *
   * Retrieve one report from API.
   *
   * @param {string} report - The report ident string (4 chars)
   */
  $report.get = function (report) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/reports/' + report).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /**
   * Update a report entry
   *
   * @param {object} report - Report object to be updated
   * @returns {Promise|object}
   */
  $report.update = function (report) {

    return $q(function (resolve, reject) {

      $http.put(api + '/reports/' + report.ident, report).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(error);
      });
    });
  };

  /**
   * Bind a user to a report
   *
   * @param {string} report - Report Ident
   * @param {string} user - User Ident (or username)
   * @param {string} role - role name
   *
   * @returns {Promise}
   */
  $report.bindUser = function (report, user, role) {
    return $q(function (resolve, reject) {

      $http.post(api + '/reports/' + report + '/user', { user: user, role: role }).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(error);
      });
    });
  };

  /**
   * Unbind a user from a report
   *
   * @param {string} report - Report Ident
   * @param {string} user - User Ident (or username)
   * @param {string} role - role name
   *
   * @returns {Promise}
   */
  $report.unbindUser = function (report, user, role) {
    return $q(function (resolve, reject) {

      $http.delete(api + '/reports/' + report + '/user', {
        data: { user: user, role: role },
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        }
      }).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * POG Nested Reports
   * @param {string} pog - POGID
   */
  $report.pog = function (pog) {
    return {
      /**
       * Get All Reports for this POG
       *
       * Retrieve all report from API that user can access
       *
       * @returns {promise} - Resolves with array of reports
       */
      all: function all() {
        return $q(function (resolve, reject) {

          // Retrieve from API
          $http.get(api + '/POG/' + pog + '/reports').then(function (reports) {
            resolve(reports.data);
          }, function (error) {
            // TODO: Better error handling
            reject(error);
          });
        });
      },

      /**
       * Get one Report
       *
       * Retrieve one report from API.
       *
       * @param {string} report - The report ident string (4 chars)
       */
      get: function get(report) {

        return $q(function (resolve, reject) {

          // Get result from API
          $http.get(api + '/POG/' + pog + '/reports/' + report).then(function (result) {
            resolve(result.data);
          }, function (error) {
            // TODO: Better error handling
            reject();
          });
        });
      }

    };
  };

  return $report;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.analystComments', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $ac = {};

  /*
   * Get Analyst comments
   *
   * Retrieve anaylist comments for this POG
   *
   */
  $ac.get = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments').then(function (result) {
        // Return to requestee
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Update an Analyst comment
   *
   * @param string POGID - POGID, eg POG129
   * @param string summary - Text body of summary
   *
   */
  $ac.update = function (POGID, report, summary) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments', summary).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /**
   * Sign Analyst Comments
   *
   * @param {string} POGID
   * @param {string} report - Report unique identifier
   * @param {string} role - The role to sign for
   *
   */
  $ac.sign = function (POGID, report, role) {

    return $q(function (resolve, reject) {

      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments/sign/' + role, {}).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Revoke Analyst Comments Signature
   *
   * @param {string} POGID
   * @param {string} report - Report unique identifier
   * @param {string} role - The role to sign for
   *
   */
  $ac.revokeSign = function (POGID, report, role) {

    return $q(function (resolve, reject) {

      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments/sign/revoke/' + role, {}).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  return $ac;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.genomicAterationsIdentified', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $gai = {};

  /*
   * Get All POGS
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $gai.all = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicAlterationsIdentified').then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Get an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $gai.id = function (POGID, report, ident) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicAlterationsIdentified/' + ident).then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Update an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $gai.update = function (POGID, report, ident, gai) {

    return $q(function (resolve, reject) {

      // Lookup in cache first
      if (_gai[ident] !== undefined) return resolve(_gai[ident]);

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicAlterationsIdentified/' + ident, gai).then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Create an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $gai.create = function (POGID, report, alteration) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.post(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicAlterationsIdentified/', alteration).then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Remove an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $gai.remove = function (POGID, report, ident, comment) {
    var cascade = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;


    return $q(function (resolve, reject) {

      // Get result from API
      $http.delete(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicAlterationsIdentified/' + ident + (cascade ? '?cascade=true' : ''), { data: { comment: comment }, headers: { 'Content-Type': 'application/json' } }).then(function (result) {
        resolve(true);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $gai;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.genomicEventsTherapeutic', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $get = {};

  /*
   * Get Genomic Events with Therapeutic Association
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $get.all = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicEventsTherapeutic').then(function (result) {
        // Load into cache

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Get an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $get.id = function (POGID, report, ident) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicEventsTherapeutic/' + ident).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Update an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $get.update = function (POGID, report, ident, get) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicEventsTherapeutic/' + ident, get).then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Remove an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $get.remove = function (POGID, report, ident) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.delete(api + '/' + POGID + '/report/' + report + '/genomic/summary/genomicEventsTherapeutic/' + ident).then(function (result) {
        resolve(true);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $get;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.microbial', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $microbial = {};

  /**
   * Get Microbial Content
   *
   * @param {string} POGID - PogID of requested resource, eg. POG129
   * @param {string} report - Report ID
   *
   */
  $microbial.get = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/microbial').then(function (result) {
        // Load into cache
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  return $microbial;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.mutationSummary', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $ms = {};

  /*
   * Get Genomic Events with Therapeutic Association
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $ms.get = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/mutationSummary').then(function (result) {
        // Load into cache
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Update an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $ms.update = function (POGID, report, summary) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/mutationSummary/', summary).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $ms;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.pathwayAnalysis', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $pa = {};

  /*
   * Get Pathway Analysis
   *
   * Retrieve analysis for this POG
   *
   */
  $pa.get = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/pathwayAnalysis').then(function (result) {
        // Return to requestee
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Update Pathway Analysis for this POG
   *
   * @param string POGID - POGID, eg POG129
   * @param string XMLbody - text string of SVG
   *
   */
  $pa.update = function (POGID, report, summary) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/pathwayAnalysis', summary).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $pa;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.patientInformation', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $pi = {};

  /*
   * Get Patient Information for POG
   *
   */
  $pi.get = function (POGID) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/patientInformation').then(function (result) {
        // Load into cache

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  $pi.update = function (POGID, pi) {

    return $q(function (resolve, reject) {

      $http.put(api + '/' + POGID + '/patientInformation', pi).then(function (result) {
        // All done!
        resolve(result.data);
      }, function (error) {
        reject(error);
      });
    });
  };

  return $pi;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.probeTarget', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $pt = {};

  /*
   * Get All Probe Targets
   *
   * Retrieve all Probe Targets for this POG
   *
   * @param string POGID - POGID associated with these resource
   *
   */
  $pt.all = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget').then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Get a Probe Target
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $pt.id = function (POGID, report, ident) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget/' + ident).then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Update a Probe Target
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $pt.update = function (POGID, report, ident, gai) {

    return $q(function (resolve, reject) {

      // Lookup in cache first
      if (_gai[ident] !== undefined) return resolve(_gai[ident]);

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget/' + ident, gai).then(function (result) {

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  /*
   * Remove a Probe Target
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $pt.remove = function (POGID, report, ident) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.delete(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget/' + ident).then(function (result) {
        resolve(true);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $pt;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.tumourAnalysis', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $ta = {};

  /*
   * Get Tumour Analysis
   *
   *
   */
  $ta.get = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/tumourAnalysis').then(function (result) {
        // Load into cache

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Update Tumour Analysis
   *
   * @param string POGID - POGID, eg POG129
   *
   */
  $ta.update = function (POGID, report, analysis) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/tumourAnalysis/', analysis).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $ta;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.variantCounts', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $vc = {};

  /*
   * Get Variant Counts
   *
   * @param string POGID - PogID of requested resource, eg. POG129
   *
   */
  $vc.get = function (POGID, report) {
    return $q(function (resolve, reject) {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/variantCounts').then(function (result) {
        // Load into cache

        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject(error);
      });
    });
  };

  /*
   * Update Variant Counts
   *
   * @param string POGID - POGID, eg POG129
   *
   */
  $vc.update = function (POGID, report, analysis) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/variantCounts/', analysis).then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $vc;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.definition', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/tracking';

  var $definition = {};

  /**
   * Get all tracking state definitions
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $definition.all = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    return $q(function (resolve, reject) {

      $http.get(api + '/definition', { params: params }).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Create new definition
   *
   * @param {object} definition - The definition to be created
   * @returns {Promise} - Resolves with created object
   */
  $definition.create = function (definition) {
    return $q(function (resolve, reject) {

      $http.post(api + '/definition', definition).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Retrieve a single definition
   *
   * @param {string} ident - single UUID
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $definition.retrieve = function (ident) {
    return $q(function (resolve, reject) {

      $http.get(api + '/definition/' + ident).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Update an existing definition
   *
   * @param {string} ident - single UUID
   * @param {object} definition - the updated definition entry
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $definition.update = function (ident, definition) {
    return $q(function (resolve, reject) {

      $http.put(api + '/definition/' + ident, definition).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Remove a definition
   *
   * @param {string} ident - UUID of definition to be removed
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $definition.remove = function (ident) {
    return $q(function (resolve, reject) {

      $http.delete(api + '/definition/' + ident).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * User Load Counts
   *
   * @param {string} ident - Definition ident
   */
  $definition.userLoad = function (ident) {
    return $q(function (resolve, reject) {

      $http.get(api + '/definition/' + ident + '/userload').then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  return $definition;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.hook', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/tracking/hook';

  var $hook = {};

  /**
   * Get all tracking hooks
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $hook.all = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    return $q(function (resolve, reject) {

      $http.get(api, { params: params }).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Create new hook
   *
   * @param {object} hook - The hook to be created
   *
   * @returns {Promise} - Resolves with created object
   */
  $hook.create = function (hook) {
    return $q(function (resolve, reject) {

      $http.post(api, hook).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Retrieve a single hook
   *
   * @param {string} ident - single UUID
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $hook.retrieve = function (ident) {
    return $q(function (resolve, reject) {

      $http.get(api + '/' + ident).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Update an existing hook
   *
   * @param {string} ident - single UUID
   * @param {object} hook - the updated hook entry
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $hook.update = function (ident, hook) {
    return $q(function (resolve, reject) {

      $http.put(api + '/' + ident, hook).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  /**
   * Remove a hook
   *
   * @param {string} ident - UUID of hook to be removed
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $hook.remove = function (ident) {
    return $q(function (resolve, reject) {

      $http.delete(api + '/' + ident).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  return $hook;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.state', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/tracking';

  var $state = {};

  /**
   * Get all tracking state definitions
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $state.all = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return $q(function (resolve, reject) {

      $http.get(api + '/', { params: params }).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Get selected states
   *
   * @param {object} params - URL parameters to append
   *
   */
  $state.filtered = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return $q(function (resolve, reject) {

      $http.get(api + '/state', { params: params }).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Get get single state
   *
   * @params {object} ident - Options for querying states
   *
   * @returns {Promise} - Resolves with collection of states
   */
  $state.getState = function (ident) {

    return $q(function (resolve, reject) {
      $http.get(api + '/state/' + ident).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Update a state's details
   *
   * @param ident
   * @param state
   *
   * @returns {Promise} - Resolves with updated state
   */
  $state.update = function (ident, state) {

    return $q(function (resolve, reject) {

      $http.put(api + '/state/' + ident, state).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  return $state;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.task', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/tracking/task';

  var $task = {};

  /**
   * Get all tracking state definitions
   *
   * @param {string} ident - Retrieve the task by ident
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $task.getByIdent = function (ident) {
    return $q(function (resolve, reject) {

      $http.get(api + '/' + ident).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Get task by inheritance
   *
   * @param {string} POGID - POGID, eg POG123
   * @param {string} analysis - Analysis name, eg biopsy_1 or biop1
   * @param {string} state - State slug, eg bioinformatics
   * @param {string} task - Task slug, eg, HOMD_review
   *
   * @returns {Promise} - Resolves with object
   */
  $task.getTaskByState = function (POGID, analysis, state, task) {

    return $q(function (resolve, reject) {

      $http.get(api + '/' + POGID + '/' + analysis + '/' + state + '/' + task).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Run a check-in for a task
   *
   * @param {string} POGID - POGID, eg POG123
   * @param {string} analysis - Analysis name, eg biopsy_1 or biop1
   * @param {string} state - State slug, eg bioinformatics
   * @param {string} task - Task slug, eg, HOMD_review
   * @param {object|string} outcome - Task output result
   *
   * @returns {Promise} - Resolves with object
   */
  $task.checkInTask = function (POGID, analysis, state, task, outcome) {

    return $q(function (resolve, reject) {

      $http.patch(api + '/checkin/' + POGID + '/' + analysis + '/' + state + '/' + task, { outcome: outcome }).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Update a task's details
   *
   * @param {object} task - The updated task object to be submitted
   *
   * @returns {Promise} - Resolves with updated task
   */
  $task.update = function (task) {
    return $q(function (resolve, reject) {

      $http.put(api + '/' + task.ident, task).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Run a check-in for a task using UUID
   *
   * @param {string} task - Task UUID
   * @param {object|string} outcome - Task output result
   *
   * @returns {Promise} - Resolves with object
   */
  $task.checkInTaskIdent = function (task, outcome) {

    return $q(function (resolve, reject) {

      $http.patch(api + '/checkin/' + task, { outcome: outcome }).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Revoke a checkin entry
   *
   * @param {string} task - The task ident
   * @param {string} checkin - Checkin ident string to be removed
   * @returns {Promise} - Resolves with updated task
   */
  $task.revokeCheckin = function (task, checkin) {

    return $q(function (resolve, reject) {

      $http.delete(api + '/checkin/' + task + '/' + checkin).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Change the assigned user of a task
   *
   * @param {string} task - Task ident string
   * @param {string} user - User ident string
   * @returns {Promise} - Resolves with updated task object
   */
  $task.assignUser = function (task, user) {

    return $q(function (resolve, reject) {
      $http.put(api + '/' + task + '/assignTo/' + user).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  return $task;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */

app.factory('api.tracking.ticket_template', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/tracking/ticket/template';

  var $template = {};

  /**
   * Get all definition ticket templates
   *
   * @param {string} definition - Definition ident string
   *
   * @returns {Promise} - Resolves with array of templates
   */
  $template.getDefTasks = function (definition) {
    return $q(function (resolve, reject) {

      $http.get(api + '/definition/' + definition).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };

  /**
   * Create new ticket template for a definition
   *
   * @param {string} definition - Definition ident string
   * @param {string} template - Ticket template to pass to API
   *
   * @returns {Promise/object} - Resolves with new definition object
   */
  $template.create = function (definition, template) {
    return $q(function (resolve, reject) {

      $http.post(api + '/definition/' + definition, template).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        console.log('Failed to create new ticket template', err);
        reject(err);
      });
    });
  };

  /**
   * Update the ticket template
   *
   * @param {string} definition - The definition ident string
   * @param {string} template - The Ticket Template object
   *
   * @returns {Promise/object} - Resolves with updated object from API
   */
  $template.update = function (definition, template) {
    return $q(function (resolve, reject) {

      $http.put(api + '/definition/' + definition + '/template/' + template.ident, template).then(function (result) {
        resolve(result.data);
      }).catch(function (err) {
        console.log('Failed to update ticket template', err);
        reject(err);
      });
    });
  };

  /**
   * Remove a ticket template entry
   *
   * @param {string} definition - The definition ident string
   * @param {string} template - The template ident stirng
   *
   * @returns {Promise/boolean}
   */
  $template.remove = function (definition, template) {
    return $q(function (resolve, reject) {

      $http.delete(api + '/definition/' + definition + '/template/' + template).then(function (result) {
        resolve(true);
      }).catch(function (err) {
        console.log('Failed to remove the ticket template', err);
        reject(err);
      });
    });
  };

  return $template;
}]);
'use strict';

/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking', ['_', '$http', '$q', function (_, $http, $q) {
  var api = CONFIG.ENDPOINTS.API + '/tracking';

  var $tracking = {};

  /**
   * Get all tracking state definitions
   *
   * @param {object} track - POST body to initiate tracking
   *
   * @returns {Promise} - Resolves with object of new tracking data
   */
  $tracking.init = function (track) {
    return $q(function (resolve, reject) {

      $http.post(api + '/', track).then(function (result) {
        resolve(result.data);
      }, function (err) {
        reject(err);
      });
    });
  };
  return $tracking;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.appendices', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $appendices = {};

  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $appendices.tcga = function (POGID, report) {

    return $q(function (resolve, reject) {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/appendices/tcga').then(function (result) {
        resolve(result.data);
      }, function (error) {
        // TODO: Better error handling
        reject();
      });
    });
  };

  return $appendices;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.copyNumberAnalyses.cnv', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $cnv = {};

  $cnv.all = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/copyNumberAnalyses/cnv').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $cnv.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/copyNumberAnalyses/cnv/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update CNV', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $cnv.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/copyNumberAnalyses/cnv/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve the requested cnv', error);
    });

    return deferred.promise;
  };

  return $cnv;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.expressionAnalysis.drugTarget', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $drugTarget = {};

  $drugTarget.all = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/drugTarget').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $drugTarget.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/drugTarget/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update APC', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $drugTarget.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/drugTarget/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve requested alterations', error);
    });

    return deferred.promise;
  };

  return $drugTarget;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.expressionAnalysis.outlier', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $outlier = {};

  $outlier.all = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/outlier').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $outlier.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/outlier/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update APC', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $outlier.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/outlier/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve requested alterations', error);
    });

    return deferred.promise;
  };

  return $outlier;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.expressionAnalysis.protein', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $protein = {};

  $protein.all = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/protein').then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $protein.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/protein/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update APC', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $protein.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/expressionAnalysis/protein/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve requested alterations', error);
    });

    return deferred.promise;
  };

  return $protein;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.detailedGenomicAnalysis.alterations', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $APC = {};

  $APC.getAll = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/detailedGenomicAnalysis/alterations').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $APC.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/detailedGenomicAnalysis/alterations/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update APC', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      },

      /**
       * Create new Detailed Genomic Alterations Entry
       *
       * @param {object} data - Alteration data object
       * @returns {promise|object} - Promise resolves new entry
       */
      create: function create(data) {
        var deferred = $q.defer();

        $http.post(api + '/' + pog + '/report/' + report + '/genomic/detailedGenomicAnalysis/alterations/', data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to create APC', error);
          deferred.reject('Unable to create');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $APC.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/detailedGenomicAnalysis/alterations/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve requested alterations', error);
    });

    return deferred.promise;
  };

  // Update an existing entry
  $APC.update = function (pog, gene) {
    var deferred = $q.defer();

    //$http.put
  };

  // Create a new entry
  $APC.create = function (pog, gene) {};

  return $APC;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.kb.associations', ['_', '$http', '$q', function (_, $http, $q) {

  var $kbAssoc = {};

  // Association Map
  var $map = {
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
    "not determined": "*"
  };

  // Lookup Associagtion
  $kbAssoc.association = function (assoc) {
    if (!(assoc in $map)) return false;
    return $map[assoc];
  };

  return $kbAssoc;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.detailedGenomicAnalysis.targetedGenes', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $tg = {};

  $tg.getAll = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/detailedGenomicAnalysis/targetedGenes').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $tg.one = function (pog, report, ident) {
    return {

      get: function get() {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/detailedGenomicAnalysis/targetedGenes/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to retrieve targeted gene record', error);
          deferred.reject('Unable to retrieve the requested record');
        });

        return deferred.promise;
      },

      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/detailedGenomicAnalysis/targetedGenes/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to ', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      }
    };
  };

  return $tg;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.presentation', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $presentation = {};

  // Discussion Endpoints
  $presentation.discussion = {

    /**
     * Get All Discussion notes
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     *
     * @returns {Promise} - Resolves with all entries
     */
    all: function all(patient, report) {
      return $q(function (resolve, reject) {
        $http.get(api + '/' + patient + '/report/' + report + '/genomic/presentation/discussion').then(function (result) {
          resolve(result.data);
        }).catch(function (e) {
          reject(e);
        });
      });
    },

    /**
     * Create new discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {object} data - New entry data object
     *
     * @returns {Promise} - Resolves with new entry
     */
    create: function create(patient, report, data) {
      return $q(function (resolve, reject) {

        $http.post(api + '/' + patient + '/report/' + report + '/genomic/presentation/discussion', data).then(function (result) {
          resolve(result.data);
        }).catch(function (e) {
          reject(e);
        });
      });
    },

    /**
     * Get a discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Report ident string
     *
     * @returns {Promise} - Resolves with updated entry
     */
    get: function get(patient, report, ident) {
      return $q(function (resolve, reject) {

        $http.get(api + '/' + patient + '/report/' + report + '/genomic/presentation/discussion/' + ident).then(function (result) {
          resolve(result.data);
        }).catch(function (e) {
          reject(e);
        });
      });
    },

    /**
     * Update an existing discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Report ident string
     * @param {object} data - data object of entry
     *
     * @returns {Promise} - Resolves with updated entry
     */
    update: function update(patient, report, ident, data) {
      return $q(function (resolve, reject) {

        $http.put(api + '/' + patient + '/report/' + report + '/genomic/presentation/discussion/' + ident, data).then(function (result) {
          resolve(result.data);
        }).catch(function (e) {
          reject(e);
        });
      });
    },

    /**
     * Remove an existing discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Report ident string
     *
     * @returns {Promise} - Resolves with updated entry
     */
    remove: function remove(patient, report, ident) {
      return $q(function (resolve, reject) {

        $http.delete(api + '/' + patient + '/report/' + report + '/genomic/presentation/discussion/' + ident).then(function (result) {
          resolve();
        }).catch(function (e) {
          reject(e);
        });
      });
    }

  };

  // Slides endpoints
  $presentation.slide = {

    /**
     * Get all presentation slides for this report
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     *
     * @returns {Promise} - resolves with all slides
     */
    all: function all(patient, report) {
      return $q(function (resolve, reject) {
        $http.get(api + '/' + patient + '/report/' + report + '/genomic/presentation/slide').then(function (result) {
          resolve(result.data);
        }).catch(function (e) {
          reject(e);
        });
      });
    },

    /**
     * Get a presentation slide
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Slide ident string
     *
     * @returns {Promise} - resolves with all slides
     */
    get: function get(patient, report, ident) {
      return $q(function (resolve, reject) {
        $http.get(api + '/' + patient + '/report/' + report + '/genomic/presentation/slide').then(function (result) {
          resolve(reuslt.data);
        }).catch(function (e) {
          reject(e);
        });
      });
    },

    /**
     * Remove presentation slide
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Slide ident string
     *
     * @returns {Promise} - resolves with all slides
     */
    remove: function remove(patient, report, ident) {
      return $q(function (resolve, reject) {
        $http.delete(api + '/' + patient + '/report/' + report + '/genomic/presentation/slide/' + ident).then(function (result) {
          resolve();
        }).catch(function (e) {
          reject(e);
        });
      });
    }

  };

  return $presentation;
}]);
'use strict';

/*
 * BCGSC - IPR-Client Mutation Signature API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.somaticMutations.mutationSignature', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $mutationSignature = {};

  $mutationSignature.all = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/somaticMutations/mutationSignature').then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      console.log(error);
      deferred.reject('Unable to retrieve');
    });
    return deferred.promise;
  };

  return $mutationSignature;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.somaticMutations.smallMutations', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $smallMutations = {};

  $smallMutations.all = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/somaticMutations/smallMutations').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $smallMutations.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/somaticMutations/smallMutations/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update APC', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $smallMutations.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/somaticMutations/smallMutations/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve requested alterations', error);
    });

    return deferred.promise;
  };

  return $smallMutations;
}]);
'use strict';

/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.structuralVariation.sv', ['_', '$http', '$q', function (_, $http, $q) {

  var api = CONFIG.ENDPOINTS.API + '/POG';

  var $sv = {};

  $sv.all = function (pog, report) {

    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/structuralVariation/sv').then(function (resp) {
      // Successful authentication
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve');
    });

    return deferred.promise;
  };

  $sv.one = function (pog, report, ident) {
    return {
      update: function update(data) {
        var deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/' + report + '/genomic/structuralVariation/sv/' + ident, data).then(function (resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          console.log('Unable to update APC', error);
          deferred.reject('Unable to update');
        });

        return deferred.promise;
      }
    };
  };

  // Get alterations by specific type
  $sv.getType = function (pog, report, type) {
    var deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/' + report + '/genomic/structuralVariation/sv/' + type).then(function (resp) {
      deferred.resolve(resp.data);
    }, function (error) {
      deferred.reject('Unable to retrieve requested structural variation', error);
    });

    return deferred.promise;
  };

  return $sv;
}]);
'use strict';

app.service('$acl', ['_', 'api.session', 'api.user', function (_, $session, $user) {

  var user = void 0;

  // Init session & services
  $session.init().then($user.me).then(function (u) {
    user = u;
  }).catch(function (e) {
    console.log('acl failed to get user', e);
  });

  var actions = {
    report: {
      view: {
        allow: ['*'],
        reject: []
      },
      edit: {
        allow: ['admin', 'analyst', 'bioinformatician', 'reviewer'],
        reject: ['clinician']
      },
      remove: {
        allow: ['admin'],
        reject: []
      }
    },
    analyses: {
      view: {
        allow: ['*'],
        reject: ['clinician']
      },
      edit: {
        allow: ['projects', 'admin'],
        reject: ['clinician']
      },
      remove: {
        allow: ['projects', 'admin'],
        reject: []
      }
    },
    tracking: {
      view: {
        allow: ['*'],
        reject: ['clinician']
      },
      edit: {
        allow: ['*'],
        reject: ['clinician']
      },
      remove: {
        allow: ['projects', 'admin'],
        reject: []
      }
    }
  };

  var resources = {
    report: {
      allow: ['*'],
      reject: []
    },
    knowledgebase: {
      allow: ['*'],
      reject: ['clinician']
    },
    germline: {
      allow: ['*'],
      reject: ['clinician']
    },
    analyses: {
      allow: ['*'],
      reject: ['clinician']
    },
    tracking: {
      allow: ['*'],
      reject: ['clinician']
    }
  };

  return {

    /**
     * Global Permission Resource Lookup
     *
     * @param {string} r - Resource name
     * @param {object} u - User object to override late user values from init promise
     *
     * @returns {boolean} - User is allowed to see resource
     */
    resource: function resource(r) {
      var u = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var permission = false;
      var resource = void 0;

      if (u) user = u; // Fix for delayed user init response in construct

      try {
        resource = resources[r];
      } catch (e) {
        console.log('Failed to find resource: ', r);
        return false;
      }

      // Check Allows first
      var allows = _.intersection(resource.allow, _.map(_.mapValues(user.groups, function (r) {
        return { name: r.name.toLowerCase() };
      }), 'name'));
      if (resource.allow.indexOf('*') > -1) permission = true;
      if (allows && allows.length > 0) permission = true;

      // Check Rejections
      var rejects = _.intersection(resource.reject, _.map(_.mapValues(user.groups, function (r) {
        return { name: r.name.toLowerCase() };
      }), 'name'));
      if (resource.reject.indexOf('*') > -1) permission = false; // No clue why this would exist, but spec allows
      if (rejects && rejects.length > 0) permission = false;

      return permission;
    },

    /**
     * Check Action Permission
     *
     * Lookup if a user is in a group that allows them to perform a given action
     *
     * @param {string} a - The action string to be parsed
     * @param {object} u - User object to override late user values from init promise
     *
     * @returns {boolean}
     */
    action: function action(a) {
      var u = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var permission = false;
      var action = void 0;

      if (u) user = u;

      try {
        action = _.get(actions, a);
        var allow = action.allow;
        var reject = action.reject;
      } catch (e) {
        console.log('Failed to find action: ', a, e);
        return false;
      }

      // Check Allows first
      var allows = _.intersection(action.allow, _.map(_.mapValues(user.groups, function (r) {
        return { name: r.name.toLowerCase() };
      }), 'name'));
      if (action.allow.indexOf('*') > -1) permission = true;
      if (allows && allows.length > 0) permission = true;

      // Check Rejections
      var rejects = _.intersection(action.reject, _.map(_.mapValues(user.groups, function (r) {
        return { name: r.name.toLowerCase() };
      }), 'name'));
      if (action.reject.indexOf('*') > -1) permission = false; // No clue why this would exist, but spec allows
      if (rejects && rejects.length > 0) permission = false;

      return permission;
    },

    /**
     * Is the user in a specified group
     *
     * @param {string} group - Group to be checked for membership
     *
     */
    inGroup: function inGroup(group) {
      return !!_.find(user.groups, { name: group });
    },

    /**
     * Inject user object to ACL
     *
     * @param {object} u - User object
     */
    injectUser: function injectUser(u) {
      user = u;
    }
  };
}]);
'use strict';

/**
 * Knowledgebase Utilities Factory
 *
 * Some basic functions for managing Knowledge utilities
 *
 */
app.service('$kbUtils', ['_', function (_) {

  return {
    processReferences: function processReferences(references) {
      var output = [];

      if (references.ident) references = [references];
      _.forEach(references, function (r, k) {
        // Build Events Expression Object
        var refs = { ors: [], ands: [] };

        // Split by OR first
        if (r.events_expression.indexOf('|') > -1) {

          // Take each or block and blow it into "and" groups
          _.forEach(r.events_expression.split('|'), function (orGroup, i) {

            // Are there any "and" operators?
            if (orGroup.indexOf('&') > -1) {
              // Explode!
              refs.ors[i] = orGroup.split('&');
            } else {
              refs.ors[i] = [orGroup];
            }
          });
        } else if (r.events_expression.indexOf('&') > -1) {
          refs.ands = r.events_expression.split('&');
        } else {
          refs.ors[0] = [r.events_expression];
        }

        r.events_expression_expanded = refs;

        if (typeof r.disease_list === 'string') r.disease_list = r.disease_list.split(';');
        if (typeof r.context === 'string') r.context = r.context.split(';');

        // Add to array
        output.push(r);
      });

      return output;
    }
  };
}]);
'use strict';

/*
 * Lodash Factory
 *
 * Allows lodash to be an injectable object into
 * angular modules
 *
 */
app.factory('_', ['$window', function ($window) {
  var lodash = $window._;
  delete window._;
  return lodash;
}]);
"use strict";
'use strict';

/**
 * Knowledgebase Utilities Factory
 *
 * Some basic functions for managing Knowledge utilities
 *
 */
app.service('$ticketBody', ['_', function (_) {

  return {
    processReferences: function processReferences(references) {
      var output = [];

      if (references.ident) references = [references];
      _.forEach(references, function (r, k) {
        // Build Events Expression Object
        var refs = { ors: [], ands: [] };

        // Split by OR first
        if (r.events_expression.indexOf('|') > -1) {

          // Take each or block and blow it into "and" groups
          _.forEach(r.events_expression.split('|'), function (orGroup, i) {

            // Are there any "and" operators?
            if (orGroup.indexOf('&') > -1) {
              // Explode!
              refs.ors[i] = orGroup.split('&');
            } else {
              refs.ors[i] = [orGroup];
            }
          });
        } else if (r.events_expression.indexOf('&') > -1) {
          refs.ands = r.events_expression.split('&');
        } else {
          refs.ors[0] = [r.events_expression];
        }

        r.events_expression_expanded = refs;

        if (typeof r.disease_list === 'string') r.disease_list = r.disease_list.split(';');
        if (typeof r.context === 'string') r.context = r.context.split(';');

        // Add to array
        output.push(r);
      });

      return output;
    }
  };
}]);
'use strict';

app.factory('toastService', ['$mdToast', function ($mdToast) {

  function serverError(errorMessage) {
    var _this = this;

    this.message = errorMessage;

    this.toastOpen = false;

    if (this.toastOpen) return;

    $mdToast.show({
      templateUrl: 'views/toast.html',
      locals: {
        message: this.message
      },
      hideDelay: 0,
      position: 'bottom left',
      controller: ['$scope', '$mdToast', 'message', function ($scope, $mdToast, message) {
        $scope.message = message;

        $scope.class_style = "request-error";

        _this.toastOpen = true;

        $scope.closeToast = function () {
          $mdToast.hide().then(function () {
            _this.toastOpen = false;
          });
        };
      }]
    });
  }

  return {
    message: '',
    serverError: serverError
  };
}]);
'use strict';

/**
 * User Settings Service
 *
 * Basic functionality for tracking, getting & setting user settings.
 *
 */
app.factory('$userSettings', ['_', '$q', 'api.user', function (_, $q, $user) {

  var userSettings = {};

  var $us = {
    init: function init() {
      userSettings = $user._me.settings;
    },

    /**
     * Retrieve a setting value
     *
     * @param {string} setting - the key for the setting value
     * @returns {*} - Returns the desired value or false if no key exists
     */
    get: function get() {
      var setting = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (setting === undefined) return userSettings;

      if (userSettings === undefined) return {};

      return userSettings[setting];
    },

    /**
     * Save a user setting
     *
     * @param {string} setting - Setting key
     * @param {string} value - Setting value
     *
     * @returns {Promise} - Returns the $us.update() promise;
     */
    save: function save(setting, value) {
      if (userSettings === undefined) userSettings = {};
      userSettings[setting] = value;
      return $us.update();
    },

    /**
     * Updates
     *
     * @returns {Promise} - Returns updated user object
     */
    update: function update() {
      var deferred = $q.defer();

      var user = $user._me;
      user.settings = userSettings; // Overwrite previous settings value

      $user.update(user).then(function (result) {
        $user._me = result;
        deferred.resolve($user._me);
      }, function (err) {
        console.log('Failed to update user settings', err);
      });

      return deferred.promise;
    }
  };

  return $us;
}]);
'use strict';

app.directive('focusMe', function ($timeout) {
  return {
    link: function link(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function (value) {
        if (value === true) {
          $timeout(function () {
            element[0].focus();
            scope[attrs.focusMe] = false;
          }, 100);
        }
      });
    }
  };
});
'use strict';

app.directive("iprCnv", ['$q', '_', function ($q, _) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      cnvs: '=cnvs',
      pog: '=pog',
      report: '=report'
    },
    templateUrl: 'ipr-cnv/ipr-cnv.html',
    link: function link(scope, element, attr) {

      scope.copyFilter = function (copyChange) {
        return copyChange.match(/(((\+|\-)?)[0-9]{1,2})/g)[0];
      };
    } // end link
    // end return

  };
}]);
'use strict';

app.directive("iprCopypaste", ['$q', '_', '$timeout', '$mdToast', function ($q, _, $timeout, $mdToast) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      text: '=text'
    },
    templateUrl: 'ipr-copypaste/ipr-copypaste.html',
    link: function link(scope, element, attr) {

      scope.changeCopyTooltip = function () {
        scope.copyTooltip = 'Copied!';
        $timeout(function () {
          scope.copyTooltip = "Copy to clipboard";
        }, 3000);
        $mdToast.show($mdToast.simple().textContent('Copied to clipboard!'));
      };
    } // end link
    // end return

  };
}]);
'use strict';

app.directive("iprDataViewer", ['$q', '$parse', '$timeout', '$mdDialog', '_', function ($q, $parse, $timeout, $mdDialog, _) {

  return {
    restrict: 'A',
    scope: {
      data: '=iprDataViewer',
      hidden: '=iprHidden'
    },
    transclude: true,
    template: '<span ng-click="openDialog()" ng-transclude style="margin: 0 3px;"></span>',
    link: function link(scope, element, attr) {

      scope.openDialog = function () {
        $mdDialog.show({
          controller: 'controller.iprDataViewer',
          clickOutsideToClose: true,
          locals: {
            data: scope.data,
            hidden: scope.hidden
          },
          templateUrl: 'ipr-dataViewer/ipr-dataViewer.html'
        });
      };
    } // end return

  };
}]);

// Dialog Controller
app.controller("controller.iprDataViewer", ['$q', '_', '$scope', '$mdDialog', 'data', 'hidden', function ($q, _, $scope, $mdDialog, data, hidden) {

  // Ignored columns
  var ignored = _.merge(['ident', 'id', 'pog_id'], hidden);

  $scope.data = {};

  _.forEach(angular.copy(data), function (v, k) {
    if (ignored.indexOf(k) === -1) $scope.data[k] = v;
  });

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
}]);
'use strict';

app.directive("iprDiscussionEntry", ['$q', '_', '$mdToast', 'api.presentation', function ($q, _, $mdToast, $presentation) {

  return {
    restrict: 'E',
    scope: {
      patient: '=patient',
      report: '=report',
      entry: '=entry',
      user: '=user'
    },
    templateUrl: 'ipr-discussion-entry/ipr-discussion-entry.html',
    link: function link($scope, element, attr) {

      $scope.editing = false; // Editing mode
      $scope.entryCache = null; // Editing Cache
      $scope.removed = false; // Entry removed

      // Canceling edit / restoring previous state
      $scope.cancelEdit = function () {
        $scope.entry.body = $scope.entryCache;
        $scope.entryCache = null;
        $scope.editing = false;
      };

      // Enable editing mode
      $scope.edit = function () {
        $scope.entryCache = angular.copy($scope.entry.body);
        $scope.editing = true;
      };

      // Trigger save
      $scope.save = function (f) {

        $presentation.discussion.update($scope.patient.POGID, $scope.report.ident, $scope.entry.ident, { body: $scope.entry.body }).then(function (result) {
          $scope.entry = result;
          $scope.editing = false;
          $scope.entryCache = null;
        }).catch(function (e) {
          $mdToast.showSimple('Unable to save the updated entry');
        });
      };

      // Remove entry
      $scope.remove = function () {

        $presentation.discussion.remove($scope.patient.POGID, $scope.report.ident, $scope.entry.ident).then(function (result) {
          $scope.removed = true;
          $scope.entry.body = null;
          $scope.editing = false;
        }).catch(function (e) {
          $scope.editing = false;
        });
      };
    } // end return

  };
}]);
'use strict';

app.directive("iprGeneViewer", ['$q', '$parse', '$timeout', '$mdDialog', '_', function ($q, $parse, $timeout, $mdDialog, _) {

  return {
    restrict: 'E',
    scope: {
      pog: '=pog',
      report: '=report',
      gene: '=gene'
    },
    transclude: true,
    template: '<span ng-click="openDialog()" ng-transclude style="margin: 0 3px;" title="Open Gene Viewer"></span>',
    link: function link(scope, element, attr) {

      scope.openDialog = function () {
        $mdDialog.show({
          controller: 'controller.iprGeneViewer',
          clickOutsideToClose: true,
          locals: {
            report: scope.report,
            gene: scope.gene,
            pog: scope.pog
          },
          templateUrl: 'ipr-gene-viewer/ipr-gene-viewer.dialog.html'
        });
      };
    } // end return

  };
}]);

// Dialog Controller
app.controller("controller.iprGeneViewer", ['$q', '_', '$scope', '$mdDialog', 'api.geneViewer', 'report', 'pog', 'gene', function ($q, _, $scope, $mdDialog, $gv, report, pog, gene) {

  $scope.loading = true;
  $scope.report = report;
  $scope.pog = pog;
  $scope.gene = gene;
  $scope.samples = [];
  $scope.alterations = { therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: {} };

  // Group Entries by Type
  var groupEntries = function groupEntries(alterations) {
    // Process the entries for grouping
    alterations.forEach(function (row) {

      // Add to samples if not present
      if ($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);

      // Grouping
      if (!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};

      // Check if it exists already?
      if (!(row.gene + '-' + row.variant in $scope.alterations[row.alterationType])) {
        row.children = [];
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant] = row;
      }

      // Categorical entry already exists
      if (row.gene + '-' + row.variant in $scope.alterations[row.alterationType]) {
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant].children[$scope.alterations[row.alterationType][row.gene + '-' + row.variant].children.length] = row;
      }
    });

    _.forEach($scope.alterations, function (values, k) {
      $scope.alterations[k] = _.values(values);
      //console.log('Iteree: ', k, values, _.values(values));
    });
  };

  $gv.get(pog.POGID, report.ident, gene).then(function (result) {
    $scope.data = result;
    $scope.loading = false;

    // Group KB match Entries
    groupEntries($scope.data.kbMatches);
  });

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
}]);
'use strict';

app.directive("iprGenomicAlteration", ['$q', '_', '$mdDialog', '$mdToast', function ($q, _, $mdDialog, $mdToast) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      samples: '=samples',
      gene: '=gene',
      pog: '=pog',
      trigger: '=',
      report: '=report'
    },
    templateUrl: 'ipr-genomicAlteration/ipr-genomicAlteration.html',
    link: function link(scope, element, attr) {

      // Filter reference type
      scope.refType = function (ref) {
        if (ref.match(/^[0-9]{8}\#/)) {
          return 'pmid';
        }
        if (ref.match(/^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
          return 'link';
        }
        return 'text';
      };

      // Prepend a link with http:// if necessary
      scope.prependLink = function (link) {
        return link.indexOf('http://') == -1 ? 'http://' + link : link;
      };

      // Clean up PMIDs
      scope.cleanPMID = function (pmid) {
        return pmid.match(/^[0-9]{8}/)[0];
      };

      // Update entry icon clicked
      scope.updateRow = function ($event, row) {

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
          clickOutToClose: false,
          locals: {
            pog: scope.pog,
            report: scope.report,
            gene: row,
            samples: scope.samples,
            rowEvent: 'update'
          },
          controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller

        }).then(function (outcome) {
          if (outcome) $mdToast.show($mdToast.simple().textContent(outcome));
          scope.trigger(true);
        }, function (error) {
          $mdToast.show($mdToast.simple().textContent('No changes have been made'));
        });
      };

      // Create new entry...
      scope.createRow = function ($event, init) {

        var gene = angular.copy(init);
        delete gene.reference;
        delete gene.evidence;
        delete gene.therapeuticContext;
        delete gene.effect;
        delete gene.association;
        delete gene.disease;

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
          clickOutToClose: false,
          locals: {
            pog: scope.pog,
            gene: gene,
            samples: scope.samples,
            rowEvent: 'create'
          },
          controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
        });
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprMutationSignature", ['$q', '_', '$mdDialog', '$mdToast', function ($q, _, $mdDialog, $mdToast) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      pog: '=pog',
      report: '=report',
      mutationSummary: '=mutationSummary',
      mutationSignature: '=mutationSignature',
      mode: '=?mode' // Either normal or editor
    },
    templateUrl: 'ipr-mutation-landscape/ipr-mutation-landscape.html',
    link: function link(scope, element, attr) {

      scope.nnlsNormal = false;
      scope.mutationSort = { col: "signature", order: true };
      scope.selectedSigs = [];
      scope.modifier = {};

      if (!scope.mode) scope.mode = 'normal';

      var ms = scope.mutationSummary;
      var mutationSignature = angular.copy(scope.mutationSignature);

      // If mode is pick, preload selected sigs:
      if (scope.mode === 'pick') {
        _.forEach(ms.mutationSignature, function (v) {
          scope.selectedSigs.push(v.ident);
          scope.modifier[v.ident] = v.modifier;
        });
      }

      // For pick mode, adds to selected Sigs
      scope.addToSelection = function (signature) {

        // Check if it's currently selected
        var seek = scope.selectedSigs.indexOf(signature.ident) > -1;

        // Remove from Selected Signatures
        if (seek) _.pull(scope.selectedSigs, signature.ident);

        // Add to selected Signatures
        if (!seek) scope.selectedSigs.push(signature.ident);

        scope.updateSelectedSigs();
      };

      // Rebuild Selected Signatures
      scope.updateSelectedSigs = function () {

        scope.mutationSummary.mutationSignature = [];

        // Rebuild!
        _.forEach(scope.selectedSigs, function (s) {

          var seek = _.find(mutationSignature, { ident: s });

          console.log('Found a selected entry', seek);

          // Found a seek
          if (seek) {
            // Check for modifier
            if (scope.modifier[seek.ident]) seek.modifier = scope.modifier[seek.ident];
            scope.mutationSummary.mutationSignature.push(seek);
          }
        });
      };

      scope.sortMutations = function (col) {
        // Is this a valid column?
        if (['signature', 'nnls', 'pearson'].indexOf(col) === -1) return false;

        if (scope.mutationSort.col === col) {
          scope.mutationSort.order = !scope.mutationSort.order;
        } else {
          scope.mutationSort.col = col;
          scope.mutationSort.order = true;
        }

        processSignature(angular.copy(mutationSignature));
      };

      // Check if the current mutation is a selected one.
      scope.isSelectedMutation = function (ident) {
        var found = _.find(scope.mutationSummary.mutationSignature, function (m) {
          return m.ident === ident;
        });
        return found !== undefined;
      };

      scope.toggleNnlsNormalize = function () {
        scope.nnlsNormal = !scope.nnlsNormal;
        processSignature(angular.copy(mutationSignature));
      };

      var processSignature = function processSignature(sigs) {
        scope.mutationSignature = [];
        var nnlsMax = scope.nnlsNormal ? 0 : 1;

        _.forEach(sigs, function (r, k) {
          if (r.nnls > nnlsMax) nnlsMax = r.nnls;
        });

        _.forEach(sigs, function (r, k) {

          // Round to 3 sigfigs
          r.pearson = r.pearson.toFixed(3);
          r.nnls = r.nnls.toFixed(3);

          // Produced rounded numbers
          r.pearsonColour = Math.round((r.pearson < 0 ? 0 : r.pearson) * 100 / 5) * 5;
          r.nnlsColour = Math.round(r.nnls / nnlsMax * 100 / 5) * 5;

          scope.mutationSignature.push(r);
        });
        scope.mutationSignature = _.sortBy(scope.mutationSignature, scope.mutationSort.col);
        if (!scope.mutationSort.order) scope.mutationSignature.reverse();'';
      };

      processSignature(angular.copy(mutationSignature));
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprOutlier", ['$q', '_', function ($q, _) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      outliers: '=outliers',
      pog: '=pog',
      report: '=report',
      type: '=type',
      gv: '=?gv'
    },
    templateUrl: 'ipr-outlier/ipr-outlier.html',
    link: function link(scope, element, attr) {

      if (!scope.gv) scope.gv = true;
    } // end link
    // end return

  };
}]);
'use strict';

app.directive("iprPaginate", ['$q', '_', 'api.pog_analysis_report', '$timeout', function ($q, _, $report, $timeout) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      offset: '=offset',
      limit: '=limit',
      total: '=total',
      refresh: '=refresh'
    },
    templateUrl: 'ipr-paginate/ipr-paginate.html',
    link: function link(scope, element, attr) {

      scope.$watch('limit', function (newVal, oldVal) {
        if (newVal === oldVal) return;
        scope.offset = 0;
        $timeout(function () {
          scope.refresh();
        }, 100);
      });

      scope.prevPage = function () {
        scope.offset -= scope.limit;
        $timeout(function () {
          scope.refresh();
        }, 100);
      };

      scope.nextPage = function () {
        scope.offset += scope.limit;
        $timeout(function () {
          scope.refresh();
        }, 100);
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprPogRole", ['$q', '_', '$mdDialog', '$mdToast', 'indefiniteArticleFilter', function ($q, _, $mdDialog, $mdToast, indefiniteArticleFilter) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      role: '=role',
      removeEntry: '=remove'
    },
    templateUrl: 'ipr-pog-role/ipr-pog-role.html',
    link: function link(scope, element, attr) {

      scope.remove = function ($event) {

        var confirm = $mdDialog.confirm().title('Are you sure you want to remove this user?').textContent('Are you sure you want to remove ' + scope.role.user.firstName + ' ' + scope.role.user.lastName + ' as ' + indefiniteArticleFilter(scope.role.role) + ' ' + scope.role.role + '?').ariaLabel('Confirm remove user').targetEvent($event).ok('Confirm').cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
          var role = angular.copy(scope.role);
          $mdToast.show($mdToast.simple().textContent(role.user.firstName + ' ' + role.user.lastName + ' has been removed as ' + indefiniteArticleFilter(scope.role.role) + ' ' + role.role + '.'));
          // Remove Entry
          scope.removeEntry(scope.role);
        }, function () {
          $mdToast.show($mdToast.simple().textContent('No changes were made.'));
        });
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprProgressor", ['$q', '_', function ($q, _) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      stages: '=iprStages',
      active: '=iprActiveStage'
    },
    templateUrl: 'ipr-progressor/ipr-progressor.html',
    link: function link(scope, element, attr) {

      scope.changeStage = function (stage) {
        if (stage < scope.active) scope.active = stage;
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprRandomQuote", ['$q', '_', function ($q, _) {

  var quotes = ['"I dream of a better tomorrow, where chickens can cross the road and not be questioned about their motives."', '"I changed all my passwords to \'incorrect\'. So my computer just tells me when I forgot.', '"No I didn\'t trip, the floor looked like it needed a hug."', '"Whatever you do in life give 100%.....unless you\'re giving blood."', '"One time at the beach this guy was swimming in the ocean yelling Help! Shark! Help! I just laughed, I knew that shark wasn\'t going to help him.', '"Procrastinator? No, I just wait until the last second to do my work because I will be older, therefore wiser."', '"I do 5 sit-ups every morning. May not sound like much, but there is only so many times you can hit the snooze button...', '"I feel like getting something done today, so I\'m just going to sit here until the feeling passes."', '"I was complimented on my driving. Someone left a note on my windshield that said, \'Parking Fine.\'', '"I just dropped my laptop off the boat.....It\'s a Dell, rolling in the deep."', '"Why do banks lock their pens to the desk? If I\'m trusting you with my money, don\'t you think you can trust me with a pen?"', '"I really like ceilings......I guess you could call me a ceiling fan."', 'Grammar is somewhat important. Commas do save lives for instance: "Let\'s eat grandpa." "Lets eat, grandpa."', '"I was planning to do something today, but I haven\'t finished doing nothing from yesterday."', '"Light travels faster than sound. This is why some people appear bright, until you hear them talk."', '"The dictionary is the only place where success comes before work."', '"Better late then never, but never late is better."', '"I wish real life was like cartoons. I could wear the same outfit and nobody would care."', '"I haven\'t seen any statuses about Ninjas lately....well played Ninjas."', 'Did you hear about the restaurant on the moon? Great food, no atmosphere.', 'What do you call a fake noodle? An Impasta.', 'How many apples grow on a tree? All of them.', 'Want to hear a joke about paper? Never mind it\'s tearable.', 'I just watched a program about beavers. It was the best dam program I\'ve ever seen.', 'Why did the coffee file a police report? It got mugged.', 'How does a penguin build it\'s house? Igloos it together.', 'Why did the scarecrow win an award? Because he was outstanding in his field.', 'Why don\'t skeletons ever go trick or treating? Because they have no body to go with.', 'What do you call an elephant that doesn\'t matter? An irrelephant', 'Want to hear a joke about construction? I\'m still working on it.', 'Why couldn\'t the bicycle stand up by itself? It was two tired.', 'What did the grape do when he got stepped on? He let out a little wine.', 'I wouldn\'t buy anything with velcro. It\'s a total rip-off.', 'The shovel was a ground-breaking invention.', '5/4 of people admit that they’re bad with fractions.', 'Two goldfish are in a tank. One says to the other, "do you know how to drive this thing?"', 'The rotation of earth really makes my day.', 'I thought about going on an all-almond diet. But that\'s just nuts', 'Why do you never see elephants hiding in trees? Because they\'re so good at it.', 'I used to work in a shoe recycling shop. It was sole destroying.', 'I don’t play soccer because I enjoy the sport. I’m just doing it for kicks.', 'This graveyard looks overcrowded. People must be dying to get in there.', 'What\'s brown and sticky? A stick.', 'The rotation of earth really makes my day.', 'What do you call a man with a rubber toe? Roberto.', 'The shovel was a ground-breaking invention', 'I wouldn\'t buy anything with velcro. It\'s a total rip-off.', 'Why couldn\'t the bicycle stand up by itself? It was two tired.', 'What do you call an elephant that doesn\'t matter? An irrelephant', 'Why don\'t skeletons ever go trick or treating? Because they have no body to go with.', 'Why did the scarecrow win an award? Because he was outstanding in his field.', 'Did you hear about the restaurant on the moon? Great food, no atmosphere.'];

  return {
    restrict: 'E',
    transclude: false,
    templateUrl: 'ipr-random-quote/ipr-random-quote.html',
    link: function link(scope, element, attr) {

      scope.quote = quotes[_.random(0, quotes.length)];
    } // end link
    // end return

  };
}]);
'use strict';

app.directive("iprRecentReports", ['$q', '_', '$rootScope', '$state', '$interval', '$mdToast', 'api.recentReports', function ($q, _, $rootScope, $state, $interval, $mdToast, $recent) {

  return {
    restrict: 'E',
    transclude: false,
    templateUrl: 'ipr-recent-reports/ipr-recent-reports.html',
    link: function link(scope, element, attr) {

      // Local reports collection
      scope.reports = [];

      $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {

        if (toState.name.match(/^(dashboard\.reports\.pog\.report)\.(genomic|probe)\.([A-z0-9\.]{2,})$/)) {
          findOrCreate(toParams.analysis_report, toState.name);
        }
      });

      /**
       * Remove the selected recent report entry
       *
       * @param {string} report - The ident string of the report to be removed
       */
      scope.remove = function (i) {

        $recent.remove(scope.reports[i].report.ident).then(function () {
          scope.reports.splice(i, 1);
        }).catch(function (err) {
          console.log(err);
          $mdToast.showSimple('Failed to remove the recent report entry.');
        });
      };

      scope.goTo = function (i) {
        $state.go(scope.reports[i].state, { analysis_report: scope.reports[i].report.ident, POG: scope.reports[i].report.pog.POGID });
      };

      // Get all at startup
      $recent.all().then(function (result) {
        scope.reports = result;
      }).catch(function (err) {
        $mdToast.showSimple('Failed to get list of recent reports.');
      });

      /**
       * Find or Create Report Entry
       *
       * @param {string} report - Report Ident string
       * @param {string} state - Current state name
       */
      var findOrCreate = function findOrCreate(report, state) {

        var index = _.findIndex(scope.reports, { report: { ident: report } });

        // Report not yet in try
        if (index < 0) {
          $recent.addOrUpdate(report, state).then(function (result) {
            scope.reports.push(result);
          }).catch(function (err) {
            $mdToast.showSimple('Failed to add report to recent list');
          });
        }

        // Report in tray, update!
        if (index > -1) {
          $recent.addOrUpdate(report, state).then(function (result) {
            scope.reports[index] = result;
          }).catch(function (err) {
            $mdToast.showSimple('Failed to add report to recent list');
          });
        }
      };
    } // end link
    // end return

  };
}]);
'use strict';

app.directive("iprReportCard", ['$q', '_', '$mdDialog', '$mdToast', '$state', function ($q, _, $mdDialog, $mdToast, $state) {

  return {
    restrict: 'EA',
    transclude: false,
    scope: {
      report: '=report',
      pog: '=pog'
    },
    templateUrl: 'ipr-report-card/ipr-report-card.html',
    link: function link(scope, element, attr) {

      scope.goToReport = function (report) {
        if (report.type === 'genomic') $state.go('dashboard.reports.pog.report.genomic.summary', { POG: scope.pog.POGID, analysis_report: report.ident });
        if (report.type === 'probe') $state.go('dashboard.reports.pog.report.probe.summary', { POG: scope.pog.POGID, analysis_report: report.ident });
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprReportListingCard", ['$q', '_', '$mdDialog', '$mdToast', '$state', function ($q, _, $mdDialog, $mdToast, $state) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      report: '=report',
      pog: '=pog',
      state: '@state'
    },
    templateUrl: 'ipr-report-listing-card/ipr-report-listing-card.html',
    link: function link(scope, element, attr) {

      var pog = scope.pog;

      // Determine if probe/genomic available
      scope.checkProbeGenomic = function (pog, type) {
        return scope.report.type === type;
      };

      // Get Tumour Content
      scope.getTumourContent = function (pog) {
        if (scope.report.type !== 'genomic') return "N/A";
        return scope.report.tumourAnalysis.tumourContent;
      };

      // Get Ploidy Model Content
      scope.getPloidy = function (pog) {
        if (scope.report.type !== 'genomic') return "N/A";
        return scope.report.tumourAnalysis.ploidy;
      };

      // Get Report
      scope.getReport = function (pog, type) {
        return scope.report.type === type;
      };

      // Get Role
      scope.getRoleUser = function (pog, role, resp) {
        var user = _.find(scope.report.users, { role: role });

        if (!user) return null;

        switch (resp) {
          case 'name':
            return user.user.firstName + ' ' + user.user.lastName;
            break;
          case 'username':
            return user.user.username;
            break;
        }
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprReportState", ['$q', '_', function ($q, _) {

  return {
    restrict: 'EA',
    transclude: false,
    scope: {
      state: '=state'
    },
    templateUrl: 'ipr-report-state/ipr-report-state.html',
    link: function link(scope, element, attr) {

      var parse = function parse(state) {
        if (state === 'nonproduction') return 'Non-Production/Test';
        if (state === 'ready') return 'Ready for analysis';
        if (state === 'presented') return 'Review/Presentation';
        if (state === 'active') return 'Analysis underway';
        if (state === 'archived') return 'Archived';
        if (state === 'signedoff') return 'Signed-off';
        if (state === 'reviewed') return 'Reviewed';
        if (state === 'uploaded') return 'Uploaded';
      };

      scope.parsedState = parse(scope.state);
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprReportTable", ['$q', '_', 'api.pog_analysis_report', function ($q, _, $report) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      reports: '=reports',
      clinician: '=clinician',
      pagination: '=?pagination'
    },
    templateUrl: 'ipr-report-table/ipr-report-table.html',
    link: function link(scope, element, attr) {

      scope.paginate = {
        limit: scope.pagination.limit,
        offset: scope.pagination.offset,
        total: scope.pagination.total
      };

      scope.filter = {
        bound: false,
        states: 'ready,active,presented',
        project: 'POG',
        search: null
      };

      scope.loading = false;

      scope.clearSearch = function () {
        scope.showSearch = false;
        scope.focusSearch = false;

        scope.paginate.offset = 0;

        var filterCache = scope.filter.search;

        scope.filter.search = null;
        if (filterCache !== undefined) scope.refreshReports();
      };

      scope.displaySearch = function () {
        scope.showSearch = true;
        scope.focusSearch = true;
      };

      scope.prevPage = function () {
        scope.paginate.offset -= scope.paginate.limit;
        scope.refreshReports();
      };

      scope.nextPage = function () {
        scope.paginate.offset += scope.paginate.limit;
        scope.refreshReports();
      };

      scope.search = function () {
        scope.paginate.offset = 0;
        scope.refreshReports();
      };

      scope.readState = function (s) {
        switch (s) {
          case 'ready':
            return 'Ready for Analysis';
            break;

          case 'active':
            return 'Analysis underway';
            break;

          case 'presented':
            return 'Presentation';
            break;

          case 'archived':
            return 'Archived';
            break;

          default:
            return 'N/A';
            break;
        }
      };

      /**
       * Call API and refresh reports
       *
       * Makes call to IPR API with filters and pagination
       */
      scope.refreshReports = function () {

        var opts = {};

        scope.loading = true;

        opts.states = scope.filter.states;
        opts.project = scope.filter.project;
        opts.paginated = true;
        opts.offset = scope.paginate.offset;
        opts.limit = scope.paginate.limit;

        if (!scope.filter.bound) opts.all = true;
        if (scope.filter.search) opts.searchText = scope.filter.search;

        if (scope.clinician) opts.states = 'presented,archived';

        $report.all(opts).then(function (result) {
          scope.paginate.total = result.total;
          scope.reports = result.reports;

          scope.loading = false;
        }).catch(function (err) {});
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprSectionHide", ['$q', '_', function ($q, _) {

  return {
    restrict: 'EA',
    transclude: false,
    scope: {
      state: '=flipState'
    },
    templateUrl: 'ipr-section-hide/ipr-section-hide.html',
    link: function link(scope, element, attr) {} // end link
  }; // end return
}]);
'use strict';

app.directive("iprSmallMutations", ['$q', '_', '$mdDialog', function ($q, _, $mdDialog) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      mutations: '=mutations',
      pog: '=pog',
      report: '=report'
    },
    templateUrl: 'ipr-smallMutations/ipr-smallMutations.html',
    link: function link(scope, element, attr) {

      scope.copyFilter = function (copyChange) {
        return copyChange.match(/(((\+|\-)?)[0-9]{1,2})/g)[0];
      };

      scope.vardbVarLib = function ($event, mutation) {

        var variant = {
          chromosome: mutation.location.split(':')[0],
          position: mutation.location.split(':')[1],
          ref: mutation.refAlt.split('>')[0],
          alt: mutation.refAlt.split('>')[1]
        };

        // Prepare mutation for VarDB Lookup=
        $mdDialog.show({
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: {
            variant: variant,
            mutation: mutation
          },
          templateUrl: 'ipr-smallMutations/vardb-libraries.html',
          controller: ['scope', '$mdDialog', '$timeout', 'api.vardb', 'variant', 'mutation', function ($scope, $mdDialog, $timeout, $vardb, variant, mutation) {

            $scope.libraries = [];
            $scope.loading = true;
            $scope.mutation = mutation;
            $scope.step = 0;

            // Find libraries with alternate base
            $vardb.variantLibraries(variant.chromosome, variant.position, variant.ref, variant.alt).then(function (vardbLibs) {
              // Create response object
              var response = {
                libraries: [],
                total: vardbLibs.total_pog_libraries
              };

              $scope.step = 1;
              $timeout(function () {
                $scope.step = 2;
              }, 1000);

              // Get Library Meta Data
              $vardb.libraryMeta(vardbLibs.libraries).then(function (meta) {
                response.libraries = meta;

                $scope.loading = false;
                $scope.libraries = response.libraries;

                console.log('Libraries', $scope.libraries);
                console.log('libraries', vardbLibs);
              }, function (err) {
                console.log('Unable to get POG libraries', err);
              });
            }, function (err) {
              console.log('Unable to get libaries with variant', err);
            });

            $scope.cancel = function () {
              $mdDialog.hide();
            };
          }]
        });
      };
    } // end link
    // end return

  };
}]);
'use strict';

app.directive("iprSv", ['$q', '_', '$mdDialog', '$mdToast', function ($q, _, $mdDialog, $mdToast) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      svs: '=svs',
      pog: '=pog',
      report: '=report'
    },
    templateUrl: 'ipr-sv/ipr-sv.html',
    link: function link(scope, element, attr) {

      scope.svDetails = function ($event, sv) {

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'ipr-sv/ipr-sv.detail.html',
          controller: ['$q', 'scope', function ($q, $_scope) {
            $_scope.sv = sv;

            // Close Modal
            $_scope.cancel = function () {
              $mdDialog.cancel();
            };

            // Extract Ensembl Name from String
            $_scope.ensemblName = function (input) {
              return _.first(input.match(/(ENS[A-z0-9]*)/));
            };

            // Create SVG DOM element from String
            $_scope.svg = new DOMParser().parseFromString(sv.svg, 'application/xml');

            var xmlSVG = $_scope.svg.getElementsByTagName('svg')[0];
            xmlSVG.id = "fusionDiagram";

            // Load in SVG after delay.
            setTimeout(function () {
              var svgImage = document.getElementById('svgImage');

              svgImage.appendChild(svgImage.ownerDocument.importNode($_scope.svg.documentElement, true));
              var panzoom = svgPanZoom('#fusionDiagram', {
                preventMouseEventsDefault: true,
                enableControlIcons: true
              });
              panzoom.resize();
              panzoom.fit();
              panzoom.center();
            }, 500);
          }],
          clickOutToClose: false
        });
      };
    } // end link
    // end return

  };
}]);
'use strict';

app.directive('iprTicketBody', ['$rootScope', function ($rootScope) {
  return {
    link: function link(scope, element, attrs) {
      $rootScope.$on('insertText', function (e, val) {
        var domElement = element[0];

        // Is there any text selected?
        if (document.selection) {
          domElement.focus();
          var sel = document.selection.createRange();
          sel.text = val;
          domElement.focus();

          // Somewhere not selected, but in the middle
        } else if (domElement.selectionStart || domElement.selectionStart === 0) {

          var startPos = domElement.selectionStart;
          var endPos = domElement.selectionEnd;
          var scrollTop = domElement.scrollTop;

          domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
          domElement.focus();
          domElement.selectionStart = startPos + val.length;
          domElement.selectionEnd = startPos + val.length;
          domElement.scrollTop = scrollTop;
        } else {
          // Add to end
          domElement.value += val;
          domElement.focus();
        }
      });
    }
  };
}]);
'use strict';

app.directive("iprTrackingCard", ['$q', '_', '$mdDialog', '$mdToast', '$timeout', 'api.tracking.state', 'api.socket', function ($q, _, $mdDialog, $mdToast, $timeout, $state, socket) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      state: '=state',
      noTasks: '=?noTasks'
    },
    templateUrl: 'ipr-tracking-card/ipr-tracking-card.html',
    link: function link(scope, element, attr) {

      // Add state status to classList
      element[0].classList.add(scope.state.status);

      var pog = scope.pog = scope.state.analysis.pog;
      var analysis = scope.analysis = scope.state.analysis;
      var state = scope.state;

      // Sort Tasks by ordinal
      scope.state.tasks = state.tasks = _.sortBy(scope.state.tasks, 'ordinal');
      scope.showTasks = false;
      scope.error = false; // Default error state
      scope.priority = new Array(analysis.priority);
      scope.disableTasks = scope.noTasks !== undefined;

      // Check if there are any failed tasks
      var checkStates = function checkStates() {
        scope.error = _.find(scope.state.tasks, { status: 'failed' }) ? true : false;
        scope.hold = _.find(scope.state.tasks, { status: 'hold' }) ? true : false;
      };

      // Listen for changes to any task in this state
      socket.on('taskStatusChange', function (task) {
        if (task.state.ident === scope.state.ident) {
          checkStates();
        }
      });

      // Mouse hover
      scope.openUserWindow = function (assignee) {
        assignee.mouseLeft = false;
        $timeout(function () {
          if (!assignee.mouseLeft) assignee.show = true;
        }, 300);
      };

      scope.closeUserWindow = function (assignee) {
        assignee.mouseLeft = true;

        $timeout(function () {
          if (!assignee.keepOpen) assignee.show = false;
        }, 300);
      };

      scope.keepUserWindow = function (assignee) {
        assignee.keepOpen = true;
      };

      scope.unKeepUserWindow = function (assignee) {
        assignee.keepOpen = false;
        assignee.show = false;
      };

      scope.getTaskStateCount = function (state) {
        var count = 0;

        _.forEach(scope.state.tasks, function (t) {
          if (t.status === state) count++;
        });

        return count;
      };

      scope.getFirstOutcome = function (task) {
        var first = "";
        var k = 0;
        _.forEach(task.outcome, function (o, i) {
          if (k === 0) first = o;
          k++;
        });
        return first.value;
      };

      scope.getTasks = function () {
        scope.showTasks = !scope.showTasks;
      };

      var checkTaskCompletion = function checkTaskCompletion() {

        var completeTasks = 0;

        _.forEach(state.tasks, function (task, i) {
          if (task.status === 'complete') completeTasks++;
        });

        if (completeTasks === state.tasks.length) {
          // Add new state class
          element[0].classList.remove(scope.state.status);
          scope.state.status = 'complete';
          // Add new state class
          element[0].classList.add(scope.state.status);
        }
      };

      scope.showTask = function ($event, task) {
        $mdDialog.show({
          targetEvent: $event,
          escapeToClose: false,
          locals: {
            task: task,
            state: state,
            pog: pog
          },
          templateUrl: 'ipr-tracking-card/ipr-tracking-card.task.html',
          controller: 'controller.ipr-tracking-card.task',
          clickOutToClose: false
        }).then(function (data) {
          // Update scope copy of task - Check for completeness
          _.forEach(state.tasks, function (task, i) {
            if (data.task.ident === task.ident) state.tasks[i] = data.task;
          });

          checkStates();
          checkTaskCompletion();
          // Propagate
          scope.state = state;
        }, function (err) {
          console.log('Error closing err', err);
        });
      };

      scope.showState = function ($event) {

        $mdDialog.show({
          targetEvent: $event,
          escapeToClose: false,
          locals: {
            state: state,
            pog: pog
          },
          templateUrl: 'ipr-tracking-card/ipr-tracking-card.state.html',
          controller: 'controller.ipr-tracking-card.state',
          clickOutToClose: false
        }).then(function (data) {
          // Remove Previous state class
          element[0].classList.remove(scope.state.status);

          checkStates();
          // Propagate
          scope.state = data.state;
          state = data.state;
          scope.state.tasks = _.sortBy(data.state.tasks, 'ordinal');

          // Add new state class
          element[0].classList.add(scope.state.status);
        }, function (err) {
          console.log('Error closing err', err);
        });
      };

      // Trigger State Check
      checkStates();
    } // end link

  }; // end return
}]);
'use strict';

app.controller('controller.ipr-tracking-card.state', ['_', '$scope', '$q', '$mdDialog', '$mdToast', 'api.tracking.state', 'api.user', 'api.jira', 'pog', 'state', function (_, $scope, $q, $mdDialog, $mdToast, $state, $user, $jira, pog, state) {

  $scope.pog = pog;
  $scope.state = state;
  $scope.states = ['active', 'pending', 'complete', 'hold', 'failed', 'cancelled'];

  $scope.cancel = function () {
    $mdDialog.hide({ state: $scope.state });
  };

  $scope.updateStatus = function (status) {

    // Update the task's state
    var updateState = angular.copy($scope.state);
    updateState.status = status;

    $state.update(state.ident, updateState).then(function (result) {
      $scope.state = result;
    }, function (err) {
      console.log('Failed to update task', err);
    });
  };

  // Update State
  $scope.updateState = function (f) {

    // Update state settings
    if ($scope.assign.user !== null && $scope.assign.user.ident) $scope.state.assignedTo = $scope.assign.user.ident;

    $state.update($scope.state.ident, $scope.state).then(function (result) {
      $scope.state = result;
      $mdDialog.hide({ state: $scope.state });
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('Unable to save state.'));
      console.log(err);
    });
  };

  // Search Users with auto complete
  $scope.searchUsers = function (searchText) {
    var deferred = $q.defer();

    if (searchText.length === 0) return [];

    $user.search(searchText).then(function (resp) {
      deferred.resolve(resp);
    }, function (err) {
      console.log(err);
      deferred.reject();
    });

    return deferred.promise;
  };
}]);
'use strict';

app.controller('controller.ipr-tracking-card.task', ['_', '$scope', '$q', '$mdDialog', '$mdToast', 'api.tracking.task', 'api.tracking.state', 'api.user', 'pog', 'state', 'task', function (_, $scope, $q, $mdDialog, $mdToast, $task, $state, $user, pog, state, task) {

  $scope.pog = pog;
  $scope.state = state;
  $scope.task = task;
  $scope.addCheckin = false;
  $scope.assign = { user: null };
  $scope.showAssignUser = false;

  $scope.cancel = function () {
    $mdDialog.hide({ task: $scope.task, state: state });
  };

  $scope.toggleCheckIn = function () {
    $scope.addCheckin = !$scope.addCheckin;
  };

  $scope.$watch('task.checkins', function (newVal, oldVal) {
    if ($scope.addCheckin) $scope.addCheckin = false;
  });

  $scope.updateStatus = function (status) {

    // Update the task's state
    var updateTask = angular.copy($scope.task);

    updateTask.status = status;

    $task.update(updateTask).then(function (result) {
      $scope.task = result;
    }, function (err) {
      console.log('Failed to update task', err);
    });
  };

  $scope.removeCheckin = function (checkin) {

    $task.revokeCheckin(task.ident, checkin.ident).then(function (result) {
      // Remove date stamp
      $scope.task = task = result;
    });
  };

  $scope.states = ['pending', 'active', 'hold', 'complete', 'failed', 'cancelled'];

  // Search Users with auto complete
  $scope.searchUsers = function (searchText) {
    var deferred = $q.defer();

    if (searchText.length === 0) return [];

    $user.search(searchText).then(function (resp) {
      deferred.resolve(resp);
    }, function (err) {
      console.log(err);
      deferred.reject();
    });

    return deferred.promise;
  };

  $scope.assignUser = function () {

    $task.assignUser(task.ident, $scope.assign.user.ident).then(function (result) {
      $scope.task = task = result;
      $scope.showAssignUser = false;
    }, function (err) {
      console.log('Failed to assign user', err);
    });
  };
}]);
'use strict';

app.directive("iprTrackingCheckin", ['$q', '_', '$mdDialog', '$mdToast', '$state', '$timeout', 'api.tracking.task', 'moment', function ($q, _, $mdDialog, $mdToast, $state, $timeout, $task, moment) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      state: '=state',
      task: '=task'
    },
    templateUrl: 'ipr-tracking-checkin/ipr-tracking-checkin.html',
    link: function link(scope, element, attr) {

      var task = scope.task;
      var state = scope.state;

      scope.type = task.outcomeType;

      // Build response object
      scope.outcome = {
        type: task.outcomeType,
        value: null
      };

      /** Submit Check-in **/
      scope.checkin = function () {

        // If date, reformat
        if (scope.type === 'date') {
          scope.outcome.value = moment(scope.outcome.value).toISOString();
        }

        // Building check-in body
        $task.checkInTaskIdent(task.ident, scope.outcome.value).then(function (result) {
          scope.task = result;
          task = scope.task;
        }, function (err) {
          console.log('Failed to check-in', err);

          var message = "";

          message += "Failed to perform checkin.";

          if (err.data.error && err.data.error.cause && err.data.error.cause.error && err.data.error.cause.error.message) {
            message += " Reason: " + err.data.error.cause.error.message;
          }

          $mdToast.show($mdToast.simple().textContent(message));
        });
      };
    } // end link
  }; // end return
}]);
'use strict';

app.directive("iprTumourContent", ['$q', '_', function ($q, _) {

  // Return Directive Class
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    templateUrl: 'ipr-tumourContent/ipr-tumourContent.html',
    link: function link(scope, element, attr) {
      // Define Scope Details
      var colourCode = Math.round((attr.tc == "ND" ? 200 : attr.tc) / 5) * 5;

      scope.tc = attr.tc;
      element.addClass('tc-' + colourCode);
    }
  };
}]);
'use strict';

/**
 * uiBreadcrumbs automatic breadcrumbs directive for AngularJS & Angular ui-router.
 *
 * https://github.com/michaelbromley/angularUtils/tree/master/src/directives/uiBreadcrumbs
 *
 * Copyright 2014 Michael Bromley <michael@michaelbromley.co.uk>
 */

app.directive('uiBreadcrumbs', ['$interpolate', '$state', function ($interpolate, $state) {
  return {
    restrict: 'E',
    templateUrl: function (_templateUrl) {
      function templateUrl(_x, _x2) {
        return _templateUrl.apply(this, arguments);
      }

      templateUrl.toString = function () {
        return _templateUrl.toString();
      };

      return templateUrl;
    }(function (elem, attrs) {
      return attrs.templateUrl || templateUrl;
    }),
    scope: {
      displaynameProperty: '@',
      abstractProxyProperty: '@?'
    },
    link: function link(scope) {

      scope.dataProxy = scope.abstractProxyProperty.split('.')[1];

      scope.breadcrumbs = [];
      if ($state.$current.name !== '') {
        updateBreadcrumbsArray();
      }
      scope.$on('$stateChangeSuccess', function () {
        updateBreadcrumbsArray();
      });

      /**
       * Start with the current state and traverse up the path to build the
       * array of breadcrumbs that can be used in an ng-repeat in the template.
       */
      function updateBreadcrumbsArray() {
        var workingState;
        var displayName;
        var breadcrumbs = [];
        var currentState = $state.$current;

        while (currentState && currentState.name !== '') {
          workingState = getWorkingState(currentState);
          if (workingState) {
            displayName = getDisplayName(workingState);

            if (displayName !== false && !stateAlreadyInBreadcrumbs(workingState, breadcrumbs)) {

              var proxyState = workingState.data[scope.dataProxy];

              // If the proxy state is a function, pass in $state and receive string back
              if (workingState.data && workingState.data[scope.dataProxy] && typeof workingState.data[scope.dataProxy] === 'function') {
                proxyState = workingState.data[scope.dataProxy]($state);
              }

              breadcrumbs.push({
                displayName: displayName,
                route: workingState.data && workingState.data[scope.dataProxy] ? proxyState : workingState.name
              });
            }
          }
          currentState = currentState.parent;
        }
        breadcrumbs.reverse();
        scope.breadcrumbs = breadcrumbs;
      }

      /**
       * Get the state to put in the breadcrumbs array, taking into account that if the current state is abstract,
       * we need to either substitute it with the state named in the `scope.abstractProxyProperty` property, or
       * set it to `false` which means this breadcrumb level will be skipped entirely.
       * @param currentState
       * @returns {*}
       */
      function getWorkingState(currentState) {
        var proxyStateName;
        var workingState = currentState;
        if (currentState.abstract === true) {
          if (typeof scope.abstractProxyProperty !== 'undefined') {
            proxyStateName = getObjectValue(scope.abstractProxyProperty, currentState);
            if (proxyStateName) {
              workingState = angular.copy($state.get(proxyStateName));
              if (workingState) {
                workingState.locals = currentState.locals;
              }
            } else {
              workingState = false;
            }
          } else {
            workingState = false;
          }
        }
        return workingState;
      }

      /**
       * Resolve the displayName of the specified state. Take the property specified by the `displayname-property`
       * attribute and look up the corresponding property on the state's config object. The specified string can be interpolated against any resolved
       * properties on the state config object, by using the usual {{ }} syntax.
       * @param currentState
       * @returns {*}
       */
      function getDisplayName(currentState) {
        var interpolationContext;
        var propertyReference;
        var displayName;

        if (!scope.displaynameProperty) {
          // if the displayname-property attribute was not specified, default to the state's name
          return currentState.name;
        }
        propertyReference = getObjectValue(scope.displaynameProperty, currentState);

        if (propertyReference === false) {
          return false;
        } else if (typeof propertyReference === 'undefined') {
          return currentState.name;
        } else {
          // use the $interpolate service to handle any bindings in the propertyReference string.
          interpolationContext = typeof currentState.locals !== 'undefined' ? currentState.locals.globals : currentState;
          displayName = $interpolate(propertyReference)(interpolationContext);
          return displayName;
        }
      }

      /**
       * Given a string of the type 'object.property.property', traverse the given context (eg the current $state object) and return the
       * value found at that path.
       *
       * @param objectPath
       * @param context
       * @returns {*}
       */
      function getObjectValue(objectPath, context) {
        var i;
        var propertyArray = objectPath.split('.');
        var propertyReference = context;

        for (i = 0; i < propertyArray.length; i++) {
          if (angular.isDefined(propertyReference[propertyArray[i]])) {
            propertyReference = propertyReference[propertyArray[i]];

            if (typeof propertyReference === 'function') {
              propertyReference = propertyReference($state);
            }
          } else {
            // if the specified property was not found, default to the state's name
            return undefined;
          }
        }
        return propertyReference;
      }

      /**
       * Check whether the current `state` has already appeared in the current breadcrumbs array. This check is necessary
       * when using abstract states that might specify a proxy that is already there in the breadcrumbs.
       * @param state
       * @param breadcrumbs
       * @returns {boolean}
       */
      function stateAlreadyInBreadcrumbs(state, breadcrumbs) {
        var i;
        var alreadyUsed = false;
        for (i = 0; i < breadcrumbs.length; i++) {
          if (breadcrumbs[i].route === state.name) {
            alreadyUsed = true;
          }
        }
        return alreadyUsed;
      }
    }
  };
}]);
"use strict";
'use strict';

app.directive("iprPrintDiagram", ['$q', '_', '$mdDialog', '$mdToast', function ($q, _, $mdDialog, $mdToast) {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      sv: '=sv',
      pog: '=pog',
      report: '=report'
    },
    templateUrl: 'print/ipr-print-diagram/ipr-print-diagram.html',
    link: function link(scope, element, attr) {

      var sv = scope.sv;

      scope.frame = function (frame) {
        if (frame === 'UNDET') return "Not determined";
        if (frame === 'IN') return "In frame";
        if (frame === 'OUT') return "Out of frame";
      };

      // Extract Ensembl Name from String
      scope.ensemblName = function (input) {
        return _.first(input.match(/(ENS[A-z0-9]*)/));
      };

      // Create SVG DOM element from String
      scope.svg = new DOMParser().parseFromString(sv.svg, 'application/xml');

      var xmlSVG = scope.svg.getElementsByTagName('svg')[0];
      xmlSVG.id = "fusionDiagram-" + sv.ident;

      // Load in SVG after delay.
      setTimeout(function () {
        var svgImage = document.getElementById(sv.ident);

        svgImage.appendChild(svgImage.ownerDocument.importNode(scope.svg.documentElement, true));
        var panzoom = svgPanZoom("#fusionDiagram-" + sv.ident, {
          preventMouseEventsDefault: true,
          enableControlIcons: true
        });
        panzoom.resize();
        panzoom.fit();
        panzoom.center();
        panzoom.disablePan();
        panzoom.disableMouseWheelZoom();
        panzoom.disableZoom();
        panzoom.disableDblClickZoom();
      }, 500);
    } // end link
    // end return

  };
}]);
"use strict";
/*
app.config(['$httpProvider', ($httpProvider) => {

  
  // Configure interceptor for 403 responses from API
  $httpProvider.interceptors.push(['$q', '$injector', '$window', ($q, $injector, $window) => {
    
    return {
      // Build Error Response Handler
      responseError: (responseError) => {

        let $state = $injector.get('$state');
        let $mdToast = $injector.get('$mdToast');
        
        // API Is not Available
        if(responseError.status === -1) {
          
          $mdToast().show($mdToast.simple().textContent('Uh oh! A system error prevented the request from processing.'));
          
          return $q.reject(responseError);
        }
        
        // Check if the response has a 403 error status
        if(responseError.status === 403) {
          
          // Get Route details
          let route = ($state.current && $state.current.name) ? $state.current.name : "invalud_path";
          
          // If the error happened on a public page, return the intercepted response.
          if(route.split('.')[0] === 'public') return $q.reject(responseError);
          
          // Bad Token or not logged in
          if(responseError.data.code == 'invalidAuthorizationToken') $state.go('public.login');
          
          // Otherwise, user is not permitted to perform this action, but is otherwise logged in
          return $q.reject(responseError);
        }

        if(responseError.status >= 400) {
          return $q.reject(responseError);
        }
        
      } // end ResponseError
    }; // end return
    
  }]);
  
}]);
*/

app.config(['$httpProvider', function ($httpProvider) {
  // Add Error Interceptors Wrapper
  $httpProvider.interceptors.push('httpInterceptors');
}]);

// Create Interceptors Factory
app.factory('httpInterceptors', httpInterceptors);

/**
 * HTTP Interceptors handler wrapper
 *
 * @param {object} $rootScope - Root scope object
 * @param {object} $q -
 *
 * @returns {{responseError: (function(*=))}}
 */
function httpInterceptors($rootScope, $q) {
  /**
   * Response Error response handler
   *
   * @param {object} response - $http response object
   */
  return {
    responseError: function responseError(response) {

      console.log('Error triggered', response);

      switch (response.status) {
        case 500:
          console.log('500 Error');
          $rootScope.$broadcast('httpError', { message: 'An unexpected error has occurred. Please try again.' });
          break;

        case 405:
          console.log('405 error');
          break;
        case 403:
          console.log('Access Denied error');
          $rootScope.$broadcast('httpError', { message: 'You are not authorized to access the requested resource.' });
          break;
        case -1:
          console.log('API Request failed', response);
          $rootScope.$broadcast('httpError', { message: 'The API server was not able to process the request. See console for details' });
          break;
      }

      return $q.reject(response);
    }
  };
}

// Inject dependencies into wrapper
httpInterceptors.$inject = ['$rootScope', '$q'];
'use strict';

/* /src/config/application.js */
app.run(function ($rootScope) {

  // On State Change, Show Spinner!
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    $rootScope.showLoader = true;
  });

  // On State Change Success, Hide Spinner!
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    $rootScope.showLoader = false;

    // If toState
    if (toState.name === 'public.login') {
      setTimeout(function () {
        $rootScope.showLoader = false;
      }, 200);
    }
  });

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {

    console.log('State Change Error:', event, toState, toParams);
    $rootScope.showLoader = false;
  });

  // Mount configuration
  $rootScope.PROJECT = CONFIG.PROJECT;
  $rootScope.CONFIG = CONFIG;
});

app.config(function ($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = function (date) {
    return date ? moment(date).format('YYYY-MM-DD') : '';
  };
});

/*
app.factory('httpLoadSpinner', ['$q', '$rootScope', '$injector', ($q, $rootScope, $injector) => {

  return {
    'request': (config) => {
      $rootScope.showLoader = true;
      //console.log("Request Made", config);
      return config || $q.when(config);
    },
    'requestError': (rejection) => {
      console.log('Request Rejected');
    },
    'response': (resp) => {
      $rootScope.showLoader = false;
      //console.log('Successful request', resp);
      return resp || $q.when($resp);
    },
    'responseError': (rejection) => {
      return $q.reject(rejection);
    }
  }

}]);

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpLoadSpinner');
});
*/
"use strict";
'use strict';

app.config(['$locationProvider', '$urlRouterProvider', '$stateProvider', '$urlMatcherFactoryProvider', function ($locationProvider, $urlRouterProvider, $stateProvider, $urlMatcherFactoryProvider) {
  // Enable HTML5 mode for URL access
  $locationProvider.html5Mode(true);

  // Don't require a perfect URL match (trailing slashes, etc)
  $urlMatcherFactoryProvider.strictMode(false);

  // If no path could be found, send user to 404 error
  $urlRouterProvider.otherwise(function ($injector, $location) {
    $injector.get('$state').go('error.404', null, { location: false });
    return $location.path();
  });

  // Master State Provider
  // All states are defined and configured on this object
  $stateProvider

  // Default Public Entrance for Interactive-Pog-Report
  .state('public', {
    abstract: true,
    templateUrl: 'public/layout.html',
    resolve: {
      _: ['$q', 'api.session', '$state', function ($q, $session, $state) {
        return $q(function (resolve, reject) {

          if (!$session.getToken()) return resolve();

          $session.init().then(function (user) {
            if (user) $state.go('dashboard.reports.dashboard');
            reject('Already logged in');
          }, function (err) {
            resolve();
          });
        });
      }]
    }
  })

  // Request access account for Interactive-Pog-Report
  .state('public.request', {
    url: '/request',
    templateUrl: 'public/request/request.html',
    controller: 'controller.public.request'
  })

  // Login to App
  .state('public.login', {
    url: '/login',
    templateUrl: 'public/login/login.html',
    controller: 'controller.public.login'
  })

  // Errors
  .state('error', {
    abstract: true,
    url: '/error',
    templateUrl: 'errors/error.html'
  })

  // 403 Error - Unauthorized Access
  .state('error.403', {
    url: '/403',
    templateUrl: 'errors/403.html'
  })

  // 404 Error - Resource Not Found
  .state('error.404', {
    url: '/404',
    templateUrl: 'errors/404.html'
  })

  // 500 Error - Server/API Error
  .state('error.500', {
    url: '/500',
    templateUrl: 'errors/500.html'
  })

  // Setup Dashboard state
  .state('dashboard', {
    abstract: true,
    views: {
      "@": {
        templateUrl: 'dashboard/dashboard.html',
        controller: 'controller.dashboard'
      },
      "toolbar@dashboard": {
        templateUrl: 'dashboard/toolbar.html',
        controller: 'controller.dashboard.toolbar'
      },
      "adminbar@dashboard": {
        templateUrl: 'dashboard/adminbar/adminbar.html',
        controller: 'controller.dashboard.adminbar'
      }
    },
    data: {
      displayName: 'Dashboard',
      breadcrumbProxy: 'dashboard.reports'
    },
    resolve: {
      user: ['$q', 'api.session', 'api.user', '$state', '$userSettings', 'api.socket', function ($q, $session, $user, $state, $userSettings, socket) {
        return $q(function (resolve, reject) {
          // Attempt session initialization
          $session.init().then($user.me).then(function (user) {
            // Session init'd, return user
            $userSettings.init(); // Init settings

            resolve(user);
          }).catch(function (err) {
            // No session, go to login page
            $state.go('public.login');
            reject(err);
          });
        });
      }],
      isAdmin: ['$q', 'api.user', 'user', function ($q, $user, user) {
        return $q(function (resolve, reject) {
          resolve($user.isAdmin());
        });
      }],
      pogs: ['$q', 'api.pog', function ($q, $pog) {
        return $q(function (resolve, reject) {
          $pog.all().then(function (pogs) {
            resolve(pogs);
          }, function (err) {
            reject(err);
          });
        });
      }],
      projects: ['api.project', function ($project) {
        return $project.all();
      }]
    }
  }).state('dashboard.home', {
    url: '/',
    templateUrl: 'dashboard/home/home.html',
    controller: 'controller.dashboard.home'
  })

  // Dashboard Overview/POG Listing
  .state('dashboard.reports', {
    abstract: true,
    url: '/reports',
    templateUrl: 'dashboard/reports/reports.html',
    data: {
      displayName: 'Reports',
      breadcrumbProxy: 'dashboard.reports.dashboard'
    },
    resolve: {
      permission: ['$q', '$acl', '$state', 'user', '$mdToast', function ($q, $acl, $state, user, $mdToast) {
        return $q(function (resolve, reject) {

          // Passing option user to avoid delay problem
          if (!$acl.action('report.view', user)) {
            $mdToast.showSimple('You are not allowed to view reports');
            $state.go('dashboard.home');

            resolve(false);
          } else {
            resolve(true);
          }
        });
      }]
    }
  }).state('dashboard.reports.dashboard', {
    url: '/dashboard',
    templateUrl: 'dashboard/reports/dashboard/dashboard.html',
    controller: 'controller.dashboard.reports.dashboard',
    data: {
      displayName: 'Listing',
      breadcrumbProxy: function breadcrumbProxy($state) {
        if ($state.current.name.indexOf('report.probe') > -1) return 'dashboard.reports.probe';
        if ($state.current.name.indexOf('report.genomic') > -1) return 'dashboard.reports.genomic';
        return 'dashboard.reports.dashboard';
      }
    },
    resolve: {
      reports: ['$q', 'permission', '$acl', 'api.pog_analysis_report', '$state', function ($q, permission, $acl, $report, $state) {
        if ($acl.inGroup('clinician')) return $state.go('dashboard.reports.genomic');
        return $report.all({ states: 'ready,active' });
      }]
    }
  }).state('dashboard.reports.genomic', {
    url: '/genomic',
    templateUrl: 'dashboard/reports/genomic/genomic.html',
    controller: 'controller.dashboard.reports.genomic',
    data: {
      displayName: 'Genomic Reports'
    },
    resolve: {
      reports: ['$q', 'permission', '$acl', 'api.pog_analysis_report', '$userSettings', '$state', 'user', function ($q, permission, $acl, $report, $userSettings, $state, user) {
        var currentUser = $userSettings.get('genomicReportListCurrentUser');
        var project = $userSettings.get('selectedProject') || undefined;
        if ($acl.inGroup('clinician')) return $state.go('dashboard.reports.clinician');

        if (currentUser === null || currentUser === undefined || currentUser === true) return $report.all({ type: 'genomic', states: 'ready,active,presented', project: project });
        if (currentUser === false) return $report.all({ all: true, type: 'genomic', states: 'ready,active,presented', project: project });
      }]
    }
  }).state('dashboard.reports.probe', {
    url: '/probe',
    templateUrl: 'dashboard/reports/probe/probe.html',
    controller: 'controller.dashboard.reports.probe',
    data: {
      displayName: 'Probe Reports'
    },
    resolve: {
      reports: ['$q', 'api.pog_analysis_report', '$userSettings', 'user', function ($q, $report, $userSettings) {
        var currentUser = $userSettings.get('probeReportListCurrentUser');
        if (currentUser === null || currentUser === undefined || currentUser === true) return $report.all({ type: 'probe', states: 'uploaded,signedoff' });
        if (currentUser === false) return $report.all({ all: true, type: 'probe', states: 'uploaded,signedoff' });
      }]
    }
  }).state('dashboard.reports.clinician', {
    url: '/clinician',
    templateUrl: 'dashboard/reports/clinician/clinician.html',
    controller: 'controller.dashboard.reports.clinician',
    data: {
      displayName: 'Clinician Reports'
    },
    resolve: {
      reports: ['$q', 'api.pog_analysis_report', '$userSettings', 'user', function ($q, $report, $userSettings, user) {
        var settings = { currentUser: $userSettings.get('genomicReportListCurrentUser') };
        var opts = {
          project: 'POG',
          states: 'presented,archived',
          paginated: true
        };

        if (settings.currentUser === false) opts.all = true;

        return $report.all(opts);
      }]
    }
  }).state('dashboard.reports.pog', {
    data: {
      displayName: '{{pog.POGID}}',
      breadcrumbProxy: 'dashboard.reports.pog.report.listing'
    },
    url: '/' + CONFIG.PROJECT.NAME + '/{POG}',
    controller: 'controller.dashboard.pog',
    templateUrl: 'dashboard/pog/pog.html',
    resolve: {
      pog: ['_', '$q', '$stateParams', 'api.pog', 'user', function (_, $q, $stateParams, $pog, user) {
        return $q(function (resolve, reject) {
          $pog.id($stateParams.POG).then(function (pog) {
            pog.myRoles = _.filter(pog.POGUsers, { user: { ident: user.ident } });
            resolve(pog);
          }, function (err) {
            reject('Unable to load pog');
          });
        });
      }]
    }
  }).state('dashboard.reports.pog.report', {
    abstract: true,
    url: '/report',
    data: {
      displayName: "Analysis Reports",
      breadcrumbProxy: 'dashboard.reports.pog.report.listing'
    },
    templateUrl: 'dashboard/report/report.html',
    resolve: {
      reports: ['$q', '$stateParams', 'api.pog_analysis_report', function ($q, $stateParams, $report) {
        return $report.pog($stateParams.POG).all();
      }]
    }
  }).state('dashboard.reports.pog.report.listing', {
    url: '/listing',
    data: {
      displayName: "Analysis Reports"
    },
    templateUrl: 'dashboard/report/listing/listing.html',
    controller: 'controller.dashboard.pog.report.listing'
  })

  /**
   * Probing
   *
   */
  .state('dashboard.reports.pog.report.probe', {
    url: '/{analysis_report}/probe',
    data: {
      displayName: "Probe",
      breadcrumbProxy: 'dashboard.reports.pog.report.probe.summary'
    },
    templateUrl: 'dashboard/report/probe/probe.html',
    controller: 'controller.dashboard.report.probe',
    resolve: {
      report: ['$q', '$stateParams', 'api.pog_analysis_report', function ($q, $stateParams, $report) {
        return $report.pog($stateParams.POG).get($stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.probe.summary', {
    url: '/summary',
    templateUrl: 'dashboard/report/probe/summary/summary.html',
    controller: 'controller.dashboard.report.probe.summary',
    data: {
      displayName: "Summary"
    },
    resolve: {
      testInformation: ['$q', '$stateParams', 'api.probe.testInformation', function ($q, $stateParams, $ti) {
        return $ti.get($stateParams.POG, $stateParams.analysis_report);
      }],
      genomicEvents: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', function ($q, $stateParams, $get) {
        return $get.all($stateParams.POG, $stateParams.analysis_report);
      }],
      signature: ['$q', '$stateParams', 'api.probe.signature', function ($q, $stateParams, $signature) {
        return $signature.get($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.probe.detailedGenomicAnalysis', {
    url: '/appendices',
    data: {
      displayName: "Appendices"
    },
    templateUrl: 'dashboard/report/probe/detailedGenomicAnalysis/detailedGenomicAnalysis.html',
    controller: 'controller.dashboard.report.probe.detailedGenomicAnalysis',
    resolve: {
      alterations: ['$q', '$stateParams', 'api.probe.alterations', function ($q, $stateParams, $alterations) {
        return $alterations.getAll($stateParams.POG, $stateParams.analysis_report);
      }],
      approvedThisCancer: ['$q', '$stateParams', 'api.probe.alterations', function ($q, $stateParams, $alterations) {
        return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
      }],
      approvedOtherCancer: ['$q', '$stateParams', 'api.probe.alterations', function ($q, $stateParams, $alterations) {
        return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
      }]
    }
  }).state('dashboard.reports.pog.report.probe.appendices', {
    url: '/appendices',
    data: {
      displayName: "Appendices"
    },
    templateUrl: 'dashboard/report/probe/appendices/appendices.html',
    controller: 'controller.dashboard.report.probe.appendices',
    resolve: {
      tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', function ($q, $stateParams, $appendices) {
        return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.probe.meta', {
    url: '/meta',
    data: {
      displayName: "Report Meta Information"
    },
    templateUrl: 'dashboard/report/probe/meta/meta.html',
    controller: 'controller.dashboard.report.probe.meta'
  })

  /**
   * Genomic
   *
   */
  .state('dashboard.reports.pog.report.genomic', {
    url: '/{analysis_report}/genomic',
    data: {
      displayName: "Genomic",
      breadcrumbProxy: 'dashboard.reports.pog.report.genomic.summary'
    },
    templateUrl: 'dashboard/report/genomic/genomic.html',
    controller: 'controller.dashboard.report.genomic',
    resolve: {
      report: ['$q', '$stateParams', 'api.pog_analysis_report', function ($q, $stateParams, $report) {
        return $report.pog($stateParams.POG).get($stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.summary', {
    url: '/summary',
    templateUrl: 'dashboard/report/genomic/summary/summary.html',
    controller: 'controller.dashboard.report.genomic.summary',
    data: {
      displayName: "Summary"
    },
    resolve: {
      gai: ['$q', '$stateParams', 'api.summary.genomicAterationsIdentified', function ($q, $stateParams, $gai) {
        return $gai.all($stateParams.POG, $stateParams.analysis_report);
      }],
      vc: ['$q', '$stateParams', 'api.summary.variantCounts', function ($q, $stateParams, $vc) {
        return $vc.get($stateParams.POG, $stateParams.analysis_report);
      }],
      get: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', function ($q, $stateParams, $get) {
        return $get.all($stateParams.POG, $stateParams.analysis_report);
      }],
      ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
        return $ms.get($stateParams.POG, $stateParams.analysis_report);
      }],
      pt: ['$q', '$stateParams', 'api.summary.probeTarget', function ($q, $stateParams, $pt) {
        return $pt.all($stateParams.POG, $stateParams.analysis_report);
      }],
      mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', function ($q, $stateParams, $mutationSignature) {
        return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
      }],
      microbial: ['$q', '$stateParams', 'api.summary.microbial', function ($q, $stateParams, $microbial) {
        return $microbial.get($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.analystComments', {
    url: '/analystComments',
    data: {
      displayName: "Analyst Comments"
    },
    templateUrl: 'dashboard/report/genomic/analystComments/analystComments.html',
    controller: 'controller.dashboard.report.genomic.analystComments',
    resolve: {
      comments: ['$q', '$stateParams', 'api.summary.analystComments', function ($q, $stateParams, $comments) {
        return $comments.get($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.pathwayAnalysis', {
    url: '/pathwayAnalysis',
    data: {
      displayName: "Pathway Analysis"
    },
    templateUrl: 'dashboard/report/genomic/pathwayAnalysis/pathwayAnalysis.html',
    controller: 'controller.dashboard.report.genomic.pathwayAnalysis',
    resolve: {
      pathway: ['$q', '$stateParams', 'api.summary.pathwayAnalysis', function ($q, $stateParams, $pathway) {
        return $pathway.get($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.knowledgebase', {
    url: '/knowledgebase',
    data: {
      displayName: "Detailed Genomic Analysis"
    },
    templateUrl: 'dashboard/report/genomic/knowledgebase/knowledgebase.html',
    controller: 'controller.dashboard.report.genomic.knowledgebase',
    resolve: {
      alterations: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', function ($q, $stateParams, $APC) {
        return $APC.getAll($stateParams.POG, $stateParams.analysis_report);
      }],
      approvedThisCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', function ($q, $stateParams, $APC) {
        return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
      }],
      approvedOtherCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', function ($q, $stateParams, $APC) {
        return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
      }],
      targetedGenes: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.targetedGenes', function ($q, $stateParams, $tg) {
        return $tg.getAll($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.diseaseSpecificAnalysis', {
    url: '/diseaseSpecificAnalysis',
    data: {
      displayName: "Disease Specific Analysis"
    },
    templateUrl: 'dashboard/report/genomic/diseaseSpecificAnalysis/diseaseSpecificAnalysis.html',
    controller: 'controller.dashboard.report.genomic.diseaseSpecificAnalysis',
    resolve: {
      images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.get($stateParams.POG, $stateParams.analysis_report, 'microbial.circos');
      }],
      subtypePlotImages: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.subtypePlots($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.microbial', {
    url: '/microbial',
    data: {
      displayName: "Microbial"
    },
    templateUrl: 'dashboard/report/genomic/microbial/microbial.html',
    controller: 'controller.dashboard.report.genomic.microbial',
    resolve: {
      images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.get($stateParams.POG, $stateParams.analysis_report, 'microbial.circos');
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.spearman', {
    url: '/spearman',
    data: {
      displayName: "Spearman Plot Analysis"
    },
    templateUrl: 'dashboard/report/genomic/spearman/spearman.html',
    controller: 'controller.dashboard.report.genomic.spearman',
    resolve: {
      images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.get($stateParams.POG, $stateParams.analysis_report, 'expression.chart,expression.legend');
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.smallMutations', {
    url: '/smallMutations',
    data: {
      displayName: "Somatic Mutations"
    },
    templateUrl: 'dashboard/report/genomic/smallMutations/smallMutations.html',
    controller: 'controller.dashboard.report.genomic.smallMutations',
    resolve: {
      images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSignature.corPcors,mutSignature.snvsAllStrelka');
      }],
      mutationSummaryImages: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.mutationSummary($stateParams.POG, $stateParams.analysis_report);
      }],
      ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
        return $ms.get($stateParams.POG, $stateParams.analysis_report);
      }],
      smallMutations: ['$q', '$stateParams', 'api.somaticMutations.smallMutations', function ($q, $stateParams, $smallMuts) {
        return $smallMuts.all($stateParams.POG, $stateParams.analysis_report);
      }],
      mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', function ($q, $stateParams, $mutationSignature) {
        return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.copyNumberAnalyses', {
    url: '/copyNumberAnalyses',
    data: {
      displayName: "Copy Number Analyses"
    },
    templateUrl: 'dashboard/report/genomic/copyNumberAnalyses/copyNumberAnalyses.html',
    controller: 'controller.dashboard.report.genomic.copyNumberAnalyses',
    resolve: {
      images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5');
      }],
      ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
        return $ms.get($stateParams.POG, $stateParams.analysis_report);
      }],
      cnvs: ['$q', '$stateParams', 'api.copyNumberAnalyses.cnv', function ($q, $stateParams, $cnv) {
        return $cnv.all($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.structuralVariation', {
    url: '/structuralVariation',
    data: {
      displayName: "Structural Variation"
    },
    templateUrl: 'dashboard/report/genomic/structuralVariation/structuralVariation.html',
    controller: 'controller.dashboard.report.genomic.structuralVariation',
    resolve: {
      images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutation_summary.barplot_sv,mutation_summary.density_plot_sv,circosSv.genome,circosSv.transcriptome');
      }],
      ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
        return $ms.get($stateParams.POG, $stateParams.analysis_report);
      }],
      svs: ['$q', '$stateParams', 'api.structuralVariation.sv', function ($q, $stateParams, $sv) {
        return $sv.all($stateParams.POG, $stateParams.analysis_report);
      }],
      mutationSummaryImages: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.mutationSummary($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.expressionAnalysis', {
    url: '/expressionAnalysis',
    data: {
      displayName: "Expression Analysis"
    },
    templateUrl: 'dashboard/report/genomic/expressionAnalysis/version02/expressionAnalysis.html',
    controller: 'controller.dashboard.report.genomic.expressionAnalysis',
    resolve: {
      ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
        return $ms.get($stateParams.POG, $stateParams.analysis_report);
      }],
      outliers: ['$q', '$stateParams', 'api.expressionAnalysis.outlier', function ($q, $stateParams, $outliers) {
        return $outliers.all($stateParams.POG, $stateParams.analysis_report);
      }],
      drugTargets: ['$q', '$stateParams', 'api.expressionAnalysis.drugTarget', function ($q, $stateParams, $drugTarget) {
        return $drugTarget.all($stateParams.POG, $stateParams.analysis_report);
      }],
      densityGraphs: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
        return $image.expDensityGraphs($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.discussion', {
    url: '/discussion',
    data: {
      displayName: "Presentation Discussion"
    },
    templateUrl: 'dashboard/report/genomic/presentation/discussion/discussion.html',
    controller: 'controller.dashboard.report.genomic.discussion',
    resolve: {
      discussions: ['$q', '$stateParams', 'api.presentation', function ($q, $stateParams, $presentation) {
        return $presentation.discussion.all($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.slide', {
    url: '/slide',
    data: {
      displayName: "Presentation Slides"
    },
    templateUrl: 'dashboard/report/genomic/presentation/slide/slide.html',
    controller: 'controller.dashboard.report.genomic.slide',
    resolve: {
      slides: ['$q', '$stateParams', 'api.presentation', function ($q, $stateParams, $presentation) {
        return $presentation.slide.all($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.appendices', {
    url: '/appendices',
    data: {
      displayName: "Appendices"
    },
    templateUrl: 'dashboard/report/genomic/appendices/appendices.html',
    controller: 'controller.dashboard.report.genomic.appendices',
    resolve: {
      tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', function ($q, $stateParams, $appendices) {
        return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.meta', {
    url: '/meta',
    data: {
      displayName: "POG Meta Information"
    },
    templateUrl: 'dashboard/report/genomic/meta/meta.html',
    controller: 'controller.dashboard.report.genomic.meta'
  }).state('dashboard.reports.pog.report.genomic.history', {
    url: '/history',
    data: {
      displayName: "Data History"
    },
    templateUrl: 'dashboard/report/genomic/history/history.html',
    controller: 'controller.dashboard.report.genomic.history',
    resolve: {
      history: ['$q', '$stateParams', 'api.pogDataHistory', function ($q, $stateParams, $history) {
        return $history($stateParams.POG, $stateParams.analysis_report).all();
      }],
      tags: ['$q', '$stateParams', 'api.pogDataHistory', function ($q, $stateParams, $history) {
        return $history($stateParams.POG, $stateParams.analysis_report).tag.all();
      }]
    }
  }).state('dashboard.reports.pog.report.genomic.therapeutic', {
    url: '/therapeutic',
    data: {
      displayName: "Potential Therapeutic Targets"
    },
    templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.html',
    controller: 'controller.dashboard.report.genomic.therapeutic',
    resolve: {
      therapeutic: ['$q', '$stateParams', 'api.therapeuticOptions', function ($q, $stateParams, $therapeutic) {
        return $therapeutic.all($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('dashboard.admin', {
    url: '/admin',
    data: {
      displayName: 'Administration'
    },
    templateUrl: 'dashboard/admin/admin.html'
  }).state('dashboard.admin.users', {
    url: '/users',
    data: {
      displayName: 'Users & Groups',
      breadcrumbProxy: 'dashboard.admin.users.userList'
    },
    controller: 'controller.dashboard.admin.users',
    templateUrl: 'dashboard/admin/user/users.html',
    resolve: {
      users: ['$q', 'api.user', function ($q, $user) {
        return $user.all();
      }],
      groups: ['$q', 'api.user', function ($q, $user) {
        return $user.group.all();
      }]
    }
  }).state('dashboard.admin.users.userList', {
    url: '/userList',
    data: {
      displayName: 'Users'
    },
    controller: 'controller.dashboard.admin.users.userList',
    templateUrl: 'dashboard/admin/user/userList.html'
  }).state('dashboard.admin.users.groups', {
    url: '/groups',
    data: {
      displayName: 'Groups'
    },
    controller: 'controller.dashboard.admin.users.groups',
    templateUrl: 'dashboard/admin/user/group.html'
  }).state('print', {
    url: '/print',
    abstract: true,
    templateUrl: 'print/print.html',
    controller: 'controller.print',
    data: {
      displayName: 'Print'
    },
    resolve: {
      user: ['$q', 'api.session', '$state', function ($q, $session, $state) {
        return $q(function (resolve, reject) {
          // Attempt session initialization
          $session.init().then(function (user) {
            // Session init'd, return user
            resolve(user);
          }, function (err) {
            // No session, go to login page
            $state.go('public.login');
            reject(err);
          });
        });
      }]
    }
  }).state('print.POG', {
    url: '/POG/:POG',
    abstract: true,
    data: {
      displayName: '{{POG.POGID}}'
    },
    template: '<ui-view \\>',
    resolve: {
      pog: ['$q', '$stateParams', 'api.pog', function ($q, $stateParams, $pog) {
        return $pog.id($stateParams.POG);
      }]
    }
  }).state('print.POG.report', {
    url: '/report/:analysis_report',
    abstract: true,
    template: '<ui-view \\>',
    resolve: {
      report: ['$q', '$stateParams', 'api.pog_analysis_report', function ($q, $stateParams, $report) {
        return $report.pog($stateParams.POG).get($stateParams.analysis_report);
      }]
    }
  }).state('print.POG.report.genomic', {
    url: '/genomic',
    data: {
      displayName: 'Genomic Report'
    },
    views: {
      "": {
        templateUrl: 'print/report/genomic/genomic.html',
        controller: 'controller.print.POG.report.genomic'
      },
      "summary@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/summary/summary.html',
        controller: 'controller.print.POG.report.genomic.summary',
        resolve: {
          gai: ['$q', '$stateParams', 'api.summary.genomicAterationsIdentified', function ($q, $stateParams, $gai) {
            return $gai.all($stateParams.POG, $stateParams.analysis_report);
          }],
          get: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', function ($q, $stateParams, $get) {
            return $get.all($stateParams.POG, $stateParams.analysis_report);
          }],
          ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
            return $ms.get($stateParams.POG, $stateParams.analysis_report);
          }],
          vc: ['$q', '$stateParams', 'api.summary.variantCounts', function ($q, $stateParams, $vc) {
            return $vc.get($stateParams.POG, $stateParams.analysis_report);
          }],
          pt: ['$q', '$stateParams', 'api.summary.probeTarget', function ($q, $stateParams, $pt) {
            return $pt.all($stateParams.POG, $stateParams.analysis_report);
          }],
          mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', function ($q, $stateParams, $mutationSignature) {
            return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "analystComments@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/analystComments/analystComments.html',
        controller: 'controller.print.POG.report.genomic.analystComments',
        resolve: {
          comments: ['$q', '$stateParams', 'api.summary.analystComments', function ($q, $stateParams, $comments) {
            return $comments.get($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "pathwayAnalysis@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/pathwayAnalysis/pathwayAnalysis.html',
        controller: 'controller.print.POG.report.genomic.pathwayAnalysis',
        resolve: {
          pathway: ['$q', '$stateParams', 'api.summary.pathwayAnalysis', function ($q, $stateParams, $pathway) {
            return $pathway.get($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "pathwayAnalysisLegend@print.POG.report.genomic": { templateUrl: 'print/report/genomic/sections/pathwayAnalysis/pathwayAnalysisLegend.html' },
      "therapeuticOptions@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/therapeuticOptions/therapeuticOptions.html',
        controller: 'controller.print.POG.report.genomic.therapeuticOptions',
        resolve: {
          therapeutic: ['$q', '$stateParams', 'api.therapeuticOptions', function ($q, $stateParams, $therapeutic) {
            return $therapeutic.all($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "presentationSlide@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/presentation/slide.html',
        controller: 'controller.print.POG.report.genomic.slide',
        resolve: {
          slides: ['$q', '$stateParams', 'api.presentation', function ($q, $stateParams, $presentation) {
            return $presentation.slide.all($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "dga@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/dga/dga.html',
        controller: 'controller.print.POG.report.genomic.dga',
        resolve: {
          alterations: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', function ($q, $stateParams, $APC) {
            return $APC.getAll($stateParams.POG, $stateParams.analysis_report);
          }],
          unknownAlterations: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', function ($q, $stateParams, $APC) {
            return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'unknown');
          }],
          approvedThisCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', function ($q, $stateParams, $APC) {
            return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
          }],
          approvedOtherCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', function ($q, $stateParams, $APC) {
            return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
          }]
        }
      },
      "diseaseSpecificAnalysis@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/diseaseSpecificAnalysis/diseaseSpecificAnalysis.html',
        controller: 'controller.print.POG.report.genomic.diseaseSpecificAnalysis',
        resolve: {
          images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.get($stateParams.POG, $stateParams.analysis_report, 'microbial.circos');
          }],
          subtypePlotImages: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.subtypePlots($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "somaticMutations@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/somaticMutations/somaticMutations.html',
        controller: 'controller.print.POG.report.genomic.somaticMutations',
        resolve: {
          images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSummary.snv,mutSummary.indel,mutSummary.barSnv,mutSummary.barIndel,mutSignature.corPcors,mutSignature.snvsAllStrelka');
          }],
          ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
            return $ms.get($stateParams.POG, $stateParams.analysis_report);
          }],
          smallMutations: ['$q', '$stateParams', 'api.somaticMutations.smallMutations', function ($q, $stateParams, $smallMuts) {
            return $smallMuts.all($stateParams.POG, $stateParams.analysis_report);
          }],
          mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', function ($q, $stateParams, $mutationSignature) {
            return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
          }],
          mutationSummaryImages: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.mutationSummary($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "copyNumberAnalysis@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/copyNumberAnalysis/copyNumberAnalysis.html',
        controller: 'controller.print.POG.report.genomic.copyNumberAnalysis',
        resolve: {
          images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnvLoh.circos');
          }],
          ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
            return $ms.get($stateParams.POG, $stateParams.analysis_report);
          }],
          cnvs: ['$q', '$stateParams', 'api.copyNumberAnalyses.cnv', function ($q, $stateParams, $cnv) {
            return $cnv.all($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "copyNumberAnalysisCNVLOH@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/copyNumberAnalysis/copyNumberAnalysisCNVLOH.html',
        controller: 'controller.print.POG.report.genomic.copyNumberAnalysisCNVLOH',
        resolve: {
          images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5');
          }]
        }
      },
      "structuralVariants@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/structuralVariants/structuralVariants.html',
        controller: 'controller.print.POG.report.genomic.structuralVariants',
        resolve: {
          images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSummary.barSv,mutSummary.sv,circosSv.genome,circosSv.transcriptome');
          }],
          ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
            return $ms.get($stateParams.POG, $stateParams.analysis_report);
          }],
          svs: ['$q', '$stateParams', 'api.structuralVariation.sv', function ($q, $stateParams, $sv) {
            return $sv.all($stateParams.POG, $stateParams.analysis_report);
          }],
          mutationSummaryImages: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.mutationSummary($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "expressionAnalysis@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/expressionAnalysis/expressionAnalysis.html',
        controller: 'controller.print.POG.report.genomic.expressionAnalysis',
        resolve: {
          images: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.get($stateParams.POG, $stateParams.analysis_report, 'expression.chart,expression.legend');
          }],
          ms: ['$q', '$stateParams', 'api.summary.mutationSummary', function ($q, $stateParams, $ms) {
            return $ms.get($stateParams.POG, $stateParams.analysis_report);
          }],
          outliers: ['$q', '$stateParams', 'api.expressionAnalysis.outlier', function ($q, $stateParams, $outliers) {
            return $outliers.all($stateParams.POG, $stateParams.analysis_report);
          }],
          drugTargets: ['$q', '$stateParams', 'api.expressionAnalysis.drugTarget', function ($q, $stateParams, $drugTarget) {
            return $drugTarget.all($stateParams.POG, $stateParams.analysis_report);
          }],
          densityGraphs: ['$q', '$stateParams', 'api.image', function ($q, $stateParams, $image) {
            return $image.expDensityGraphs($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "appendices@print.POG.report.genomic": {
        templateUrl: 'print/report/genomic/sections/appendices/appendices.html',
        controller: 'controller.print.POG.report.genomic.appendices',
        resolve: {
          tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', function ($q, $stateParams, $appendices) {
            return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      }
    },
    resolve: {
      targetedGenes: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.targetedGenes', function ($q, $stateParams, $tg) {
        return $tg.getAll($stateParams.POG, $stateParams.analysis_report);
      }]
    }
  }).state('print.POG.report.probe', {
    url: '/probe',
    data: {
      displayName: 'Probe Report'
    },
    views: {
      "": {
        templateUrl: 'print/report/probe/probe.html',
        controller: 'controller.print.POG.report.probe'
      },
      "summary@print.POG.report.probe": {
        templateUrl: 'print/report/probe/sections/summary/summary.html',
        controller: 'controller.print.POG.report.probe.summary',
        resolve: {
          testInformation: ['$q', '$stateParams', 'api.probe.testInformation', function ($q, $stateParams, $ti) {
            return $ti.get($stateParams.POG, $stateParams.analysis_report);
          }],
          genomicEvents: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', function ($q, $stateParams, $get) {
            return $get.all($stateParams.POG, $stateParams.analysis_report);
          }],
          metrics: ['$q', 'api.knowledgebase', function ($q, $kb) {
            return $kb.metrics();
          }],
          signature: ['$q', '$stateParams', 'api.probe.signature', function ($q, $stateParams, $signature) {
            return $signature.get($stateParams.POG, $stateParams.analysis_report);
          }]
        }
      },
      "alterations@print.POG.report.probe": {
        templateUrl: 'print/report/probe/sections/alterations/alterations.html',
        controller: 'controller.print.POG.report.probe.alterations',
        resolve: {
          alterations: ['$q', '$stateParams', 'api.probe.alterations', function ($q, $stateParams, $alterations) {
            return $alterations.getAll($stateParams.POG, $stateParams.analysis_report);
          }],
          approvedThisCancer: ['$q', '$stateParams', 'api.probe.alterations', function ($q, $stateParams, $alterations) {
            return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
          }],
          approvedOtherCancer: ['$q', '$stateParams', 'api.probe.alterations', function ($q, $stateParams, $alterations) {
            return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
          }]
        }
      },
      "appendices@print.POG.report.probe": {
        templateUrl: 'print/report/probe/sections/appendices/appendices.html',
        controller: 'controller.print.POG.report.probe.appendices'
      }
    }
  }).state('dashboard.knowledgebase', {
    url: '/knowledgebase',
    abstract: true,
    data: {
      displayName: 'Dashboard',
      breadcrumbProxy: 'dashboard.knowledgebase.references'
    },
    controller: 'knowledgebase',
    templateUrl: 'dashboard/knowledgebase/knowledgebase.html'
  }).state('dashboard.knowledgebase.dashboard', {
    url: '/dashboard',
    data: {
      displayName: "Knowledgebase"
    },
    controller: 'knowledgebase.dashboard',
    templateUrl: 'dashboard/knowledgebase/dashboard/dashboard.html',
    resolve: {
      metrics: ['$q', 'api.knowledgebase', function ($q, $kb) {
        return $kb.metrics();
      }]
    }
  }).state('dashboard.knowledgebase.references', {
    url: '/references',
    data: {
      displayName: "References"
    },
    params: {
      filters: null
    },
    controller: 'knowledgebase.references',
    templateUrl: 'dashboard/knowledgebase/references/references.html',
    resolve: {
      references: ['$q', 'api.knowledgebase', '$stateParams', function ($q, $kb, $stateParams) {
        if ($stateParams.filters) {
          return $kb.references.all(100, 0, $stateParams.filters);
        } else {
          return $kb.references.all(100, 0);
        }
      }],
      ref_count: ['$q', 'api.knowledgebase', '$stateParams', function ($q, $kb, $stateParams) {
        if ($stateParams.filters !== null) {
          return $kb.references.count($stateParams.filters);
        } else {
          return $kb.references.count();
        }
      }],
      vocabulary: ['$q', 'api.knowledgebase', function ($q, $kb) {
        return $kb.vocabulary();
      }]
    }
  }).state('dashboard.knowledgebase.events', {
    url: '/events',
    data: {
      displayName: "Events"
    },
    params: {
      filters: null
    },
    controller: 'knowledgebase.events',
    templateUrl: 'dashboard/knowledgebase/events/events.html',
    resolve: {
      events: ['$q', 'api.knowledgebase', '$stateParams', function ($q, $kb, $stateParams) {
        if ($stateParams.filters) {
          return $kb.events.all(100, 0, $stateParams.filters);
        } else {
          return $kb.events.all(100, 0);
        }
      }],
      events_count: ['$q', 'api.knowledgebase', '$stateParams', function ($q, $kb, $stateParams) {
        if ($stateParams.filters !== null) {
          return $kb.events.count($stateParams.filters);
        } else {
          return $kb.events.count();
        }
      }]
    }
  }).state('dashboard.tracking', {
    url: '/tracking',
    data: {
      displayName: 'POG Tracking',
      breadcrumbProxy: 'dashboard.tracking.board'
    },
    controller: 'controller.dashboard.tracking',
    templateUrl: 'dashboard/tracking/tracking.html',
    resolve: {
      definitions: ['$q', 'api.tracking.definition', function ($q, $definition) {
        return $definition.all();
      }],
      // User object injected to ensure settings have been captured
      myDefinitions: ['$q', '_', 'api.tracking.definition', 'user', '$userSettings', function ($q, _, $definition, user, $userSettings) {
        return $definition.all({ slug: $userSettings.get('tracking.definition') ? _.join($userSettings.get('tracking.definition').slug, ',') : undefined });
      }]
    }
  }).state('dashboard.tracking.board', {
    url: '/board',
    data: {
      displayName: 'Board'
    },
    controller: 'controller.dashboard.tracking.board',
    templateUrl: 'dashboard/tracking/board/board.html',
    resolve: {
      states: ['$q', '_', 'api.tracking.state', 'user', '$userSettings', function ($q, _, $state, user, $userSettings) {
        return $state.all({ status: $userSettings.get('tracking.state') ? _.join($userSettings.get('tracking.state').status, ',') : 'pending,active,hold,failed' });
      }]
    }
  }).state('dashboard.tracking.lane', {
    url: '/board/:slug',
    data: {
      displayName: '{{lane.name}}'
    },
    controller: 'controller.dashboard.tracking.lane',
    templateUrl: 'dashboard/tracking/board/board.lane.html',
    resolve: {
      lane: ['$q', '$stateParams', 'api.tracking.definition', function ($q, $stateParams, $definition) {
        return $definition.retrieve($stateParams.slug);
      }],
      states: ['$q', '$stateParams', 'api.tracking.state', function ($q, $stateParams, $state) {
        return $state.filtered({ slug: $stateParams.slug, status: 'active,pending' });
      }]
    }
  }).state('dashboard.tracking.definition', {
    url: '/definition',
    data: {
      displayName: 'State Definitions'
    },
    controller: 'controller.dashboard.tracking.definition',
    templateUrl: 'dashboard/tracking/definition/definition.html',
    resolve: {
      groups: ['$q', 'api.user', function ($q, $user) {
        return $user.group.all();
      }],
      definitions: ['$q', 'api.tracking.definition', function ($q, $definition) {
        return $definition.all({ hidden: true });
      }],
      hooks: ['$q', 'api.tracking.hook', function ($q, $hook) {
        return $hook.all();
      }]
    }
  }).state('dashboard.tracking.assignment', {
    url: '/assignment/:definition',
    data: {
      displayName: 'User Task Assignment'
    },
    controller: 'controller.dashboard.tracking.assignment',
    templateUrl: 'dashboard/tracking/assignment/assignment.html',
    resolve: {
      definition: ['$q', '$stateParams', 'api.tracking.definition', function ($q, $stateParams, $definition) {
        return $definition.retrieve($stateParams.definition);
      }],
      ticket_templates: ['$q', '$stateParams', 'api.tracking.ticket_template', function ($q, $stateParams, $ticket) {
        return $ticket.getDefTasks($stateParams.definition);
      }],
      states: ['$q', 'api.tracking.state', 'definition', function ($q, $state, definition) {
        return $state.filtered({ slug: definition.slug, status: 'active,pending' });
      }],
      group: ['$q', 'definition', 'api.user', function ($q, definition, $user) {
        return $user.group.retrieve(definition.group.ident);
      }],
      userLoad: ['$q', 'definition', 'api.tracking.definition', function ($q, definition, $definition) {
        return $definition.userLoad(definition.ident);
      }]
    }
  }).state('dashboard.tracking.ticket_template', {

    url: '/definition/:definition/ticket/template',
    data: {
      displayName: 'Ticket Templates'
    },
    controller: 'controller.dashboard.tracking.ticket_template',
    templateUrl: 'dashboard/tracking/assignment/assignment.ticket_template.html',
    resolve: {
      templates: ['$q', '$stateParams', 'api.tracking.ticket_template', function ($q, $stateParams, $template) {
        return $template.getDefTasks($stateParams.definition);
      }],
      definition: ['$q', '$stateParams', 'api.tracking.definition', function ($q, $stateParams, $definition) {
        return $definition.retrieve($stateParams.definition);
      }]
    }
  }).state('dashboard.biopsy', {
    url: '/biopsy',
    data: {
      displayName: 'Biopsies',
      breadcrumbProxy: 'dashboard.biopsy.board'
    },
    controller: 'controller.dashboard.biopsy',
    templateUrl: 'dashboard/biopsy/biopsy.html'
  }).state('dashboard.biopsy.board', {
    url: '/board',
    data: {
      displayName: 'Home'
    },
    controller: 'controller.dashboard.biopsy.board',
    templateUrl: 'dashboard/biopsy/board/board.html',
    resolve: {
      analyses: ['$q', 'api.analysis', function ($q, $analysis) {
        return $analysis.all({ paginated: true, project: 'POG' });
      }],
      comparators: ['$q', 'api.analysis', function ($q, $analysis) {
        return $analysis.comparators();
      }]
    }
  }).state('dashboard.germline', {
    url: '/germline',
    data: {
      displayName: 'Germline',
      breadcrumbProxy: 'dashboard.germline.board'
    },
    controller: 'controller.dashboard.germline',
    templateUrl: 'dashboard/germline/germline.html'
  }).state('dashboard.germline.board', {
    url: '/board',
    data: {
      displayName: 'Reports'
    },
    controller: 'controller.dashboard.germline.board',
    templateUrl: 'dashboard/germline/board/board.html',
    resolve: {
      reports: ['api.germline.report', function ($report) {
        return $report.all({ project: 'POG' });
      }]
    }
  }).state('dashboard.germline.report', {
    url: '/report/patient/:patient/biopsy/:biopsy/report/:report',
    data: {
      displayName: 'Reports'
    },
    controller: 'controller.dashboard.germline.report',
    templateUrl: 'dashboard/germline/report/report.html',
    resolve: {
      report: ['api.germline.report', '$stateParams', function ($report, $stateParams) {
        return $report.one($stateParams.patient, $stateParams.biopsy, $stateParams.report);
      }]
    }
  });
}]);
'use strict';

/*
 * User Edit Injector on RootScope
 *
 * Calls user API on run and checks for editing permissions.
 * Current iteration only checks for presence of clinician group. If found, no editing capability will be
 * provided.
 *
 *
 */

app.run(['$rootScope', '$http', '$injector', '$localStorage', 'api.user', '_', function ($rootScope, $http, $injector, $localStorage, $user, _) {

  // Retrieve token from local storage
  var token = $localStorage['bcgscIprToken'];

  // Token exists?
  if (token) {
    $http.defaults.headers.common['Authorization'] = token;
  }

  var user = void 0;

  $user.me().then(function (u) {

    // Check for Clinician group
    // Temporary logic to hide UI elements.
    $rootScope._clinicianMode = !!_.find(_.mapValues(u.groups, function (r) {
      return { name: r.name.toLowerCase() };
    }), { 'name': 'clinician' });

    // TODO: Plugin to API permission system

    user = u;

    var $acl = $injector.get('$acl');

    /**
     * Global Permission Resource Lookup
     *
     * @param {string} r - Resource name
     * @returns {boolean} - User is allowed to see resource
     * @private
     */
    $rootScope.SES_permissionResource = $acl.resource;

    $rootScope.SES_permissionAction = $acl.action;
  }).catch(function (err) {
    // Probably not logged in....
    $rootScope._clinicianMode = false;
    console.log('run user error', err);
  });
}]);
'use strict';

app.factory('socket', ['socketFactory', function (socketFactory) {

  return socketFactory({
    ioSocket: io(CONFIG.ENDPOINTS.SOCKET)
  });
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.appendices', ['_', '$q', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog', 'report', 'tcgaAcronyms', function (_, $q, $scope, $pog, $mdDialog, $mdToast, pog, report, tcga) {

  $scope.pog = pog;
  $scope.report = report;
  $scope.tcga = tcga;

  $scope.hashClean = function (i) {
    return String(i).replace('#', '');
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.diseaseSpecificAnalysis', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'images', 'subtypePlotImages', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, images, subtypePlotImages) {

  // Load Images into template
  $scope.images = images;

  // Load Subtype Plot Images into template
  $scope.subtypePlotImages = subtypePlotImages;
  $scope.hasSubtypePlot = !(Object.keys(subtypePlotImages).length === 0);
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.analystComments', ['_', '$q', '$scope', '$mdDialog', '$mdToast', '$sce', 'api.pog', 'api.summary.analystComments', 'pog', 'report', 'comments', function (_, $q, $scope, $mdDialog, $mdToast, $sce, $pog, $comments, pog, report, analystComments) {

  $scope.pog = pog;
  $scope.analystComments = analystComments === null ? "" : analystComments.comments;
  $scope.commentsHTML = $sce.trustAsHtml($scope.analystComments);
  $scope.comments = analystComments;

  // Sign The comments
  $scope.sign = function (role) {

    // Send signature to API
    $comments.sign(pog.POGID, report.ident, role).then(function (result) {
      $scope.comments = result;
    });
  };

  // Sign The comments
  $scope.revokeSign = function (role) {

    // Send signature to API
    $comments.revokeSign(pog.POGID, report.ident, role).then(function (result) {
      $scope.comments = result;
    });
  };

  // Editor Update Modal
  $scope.updateComments = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/analystComments/analystComments.edit.html',
      locals: {
        pog: pog
      },
      clickOutToClose: false,
      controller: ['$q', '_', '$scope', '$mdDialog', '$timeout', 'api.summary.analystComments', function ($q, _, scope, $mdDialog, $timeout, $comments) {

        scope.analystComments = analystComments;

        // Cancel Dialog
        scope.cancel = function () {
          $mdDialog.cancel('Canceled Edit - No changes made.');
        };

        // Update Details
        scope.update = function (f) {

          if (f.$invalid) {
            f.$setDirty();
            angular.forEach(f.$error, function (field) {
              angular.forEach(field, function (errorField) {
                errorField.$setTouched();
              });
            });
            return;
          }

          var updatedComment = { 'comments': scope.analystComments.comments };

          $comments.update(pog.POGID, report.ident, updatedComment).then(function (result) {
            $mdDialog.hide({ message: 'Entry has been updated', comment: updatedComment });
          }, function (error) {
            alert('Unable to update. See console');
            console.log(error);
          });
        }; // End update
      }]
    }).then(function (result) {
      // Update current page content
      $scope.commentsHTML = $sce.trustAsHtml(result.comment.comments);
      $scope.comments = analystComments = result.comment;

      // Display Message from Hiding
      $mdToast.show($mdToast.simple().textContent(result.message));
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.copyNumberAnalyses', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'pog', 'report', 'ms', 'images', 'cnvs', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, pog, report, ms, images, cnvs) {

  // Load Images into template
  $scope.images = images;
  $scope.pog = pog;
  $scope.report = report;
  $scope.cnvGroups = {};

  $scope.titleMap = {
    clinical: 'CNVs of Potential Clinical Relevance',
    nostic: 'CNVs of Prognostic or Diagnostic Relevance',
    biological: 'CNVs of Biological Relevance',
    commonAmplified: 'Commonly Amplified Oncogenes with Copy Gains',
    homodTumourSupress: 'Homozygously Deleted Tumour Suppresors',
    highlyExpOncoGain: 'Highly Expressed Oncogenes with Copy Gains',
    lowlyExpTSloss: 'Lowly Expressed Tumour Suppressors with Copy Losses'
  };

  var processCNV = function processCNV(cnvs) {

    var container = {
      clinical: [],
      nostic: [],
      biological: [],
      commonAmplified: [],
      homodTumourSupress: [],
      highlyExpOncoGain: [],
      lowlyExpTSloss: []
    };

    // Run over mutations and group
    _.forEach(cnvs, function (row, k) {
      if (!(row.cnvVariant in container)) container[row.cnvVariant] = [];
      // Add to type
      container[row.cnvVariant].push(row);
    });

    // Set Small Mutations
    $scope.cnvGroups = container;
  };

  processCNV(cnvs);
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.history.detail', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.pogDataHistory', 'pog', 'entry', 'details', 'tags', function (_, $q, scope, $state, $mdDialog, $mdToast, $pog, $history, pog, entry, details, tags) {

  scope.entry = entry;
  scope.details = details;
  scope.tags = tags;
  scope.tagSelected = entry.tags;
  scope.newEntry = details[entry.new];
  scope.previousEntry = details[entry.previous];
  scope.ignored = ['ident', 'dataVersion', 'createdAt', 'updatedAt', 'deletedAt'];
  scope.tagSearch = {
    selectedItem: null,
    searchText: null
  };

  scope.action = {
    revert: {
      disableButton: false,
      active: false,
      comment: ""
    },
    restore: {
      disableButton: false,
      active: false,
      comment: ""
    }
  };

  scope.test = "bar";

  scope.cancel = function () {
    $mdDialog.cancel();
  };

  scope.changeFields = [];

  scope.changed = function (f) {
    return scope.changeFields.indexOf(f) > -1;
  };

  // Auto-complete search filter
  scope.tagSearch.filter = function (query) {

    var deferred = $q.defer();

    $history(pog.POGID, report.ident).tag.search(query).then(function (tags) {
      deferred.resolve(tags);
    }, function (err) {
      console.log('Unable to search for tags', err);
    });
    return deferred.promise;
  };

  // Create new tag on API
  scope.newTag = function (newTag) {
    // Create new Tag
    $history(pog.POGID, report.ident).tag.create({ tag: newTag.tag }, entry.ident).then(function (resp) {
      // Need to find the tag we made, and replace it.
      var found = false;
      _.forEach(scope.tagSelected, function (v, k) {
        if (v.tag === resp.tag) {
          scope.tagSelected[k] = resp;
          found = true;
        }
      });

      if (!found) scope.tagSelected.push(resp);
      $mdToast.show($mdToast.simple().textContent('The tag has been added').position('bottom left'));
    }, function (err) {
      console.log('Failed to create new tag');
    });
  };

  // Remove tag on API
  scope.removeTag = function (removed) {
    var cachedTag = angular.copy(removed);

    $history(pog.POGID, report.ident).tag.remove(removed.ident).then(function (resp) {
      var toast = $mdToast.simple().textContent('The tag has been removed.').action('Undo').highlightAction(true).highlightClass('md-acceent').hideDelay(4000).position('bottom left');

      $mdToast.show(toast).then(function (undo) {
        // Does the user want to undo?
        if (undo === 'ok') {
          // Add it again!
          scope.newTag({ tag: cachedTag.tag });
        }
      } // end undo
      );
    }, function (err) {
      console.log('Failed to create new tag');
    });
  };

  // Revert the opened change
  scope.revert = function () {
    // Hit API
    $history(pog.POGID, report.ident).revert(entry.ident, scope.action.revert.comment).then(function (resp) {
      // Add to history
      $mdDialog.hide({ event: 'revert', data: resp });
    }, function (err) {
      console.log('Failed to revert', err);
      $mdToast.show($mdToast.simple().textContent('Unable to revert the history entry').position('bottom left'));
    });
  };

  // Restore entry
  scope.restore = function () {
    var cached = angular.copy(entry);
    $history(pog.POGID, report.ident).restore(entry.ident, scope.action.restore.comment).then(function (result) {
      // Add to history
      $mdDialog.hide({ event: 'restore', data: cached });
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('Unable to restore the history event').position('bottom left'));
    });
  };

  // Transform chip for auto complete
  scope.transformChip = function (tag) {
    // If it is an object, it's already a known chip
    if (angular.isObject(tag)) return tag;

    // Otherwise, create a new one
    return { tag: tag, type: 'new' };
  };

  // Search for changes
  var findChanges = function findChanges(preVal, newVal) {
    var ignored = ['dataVersion', 'createdAt', 'updatedAt', 'deletedAt'];
    _.forEach(preVal, function (v, k) {
      if (newVal[k] !== v && ignored.indexOf(k) === -1) {
        scope.changeFields.push(k);
      }
    });
  };

  // If it's a change map changes
  if (entry.type == 'change') {
    findChanges(scope.previousEntry, scope.newEntry);
  }
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.history.export', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', '$timeout', 'api.pog', 'api.pogDataHistory', 'pog', function (_, $q, scope, $state, $mdDialog, $mdToast, $timeout, $pog, $history, pog) {

  // Load in values needed
  scope.pog = pog;

  // Default stage is start
  scope.stage = 'start';
  scope.command = '';

  scope.export = {};

  scope.changeCopyTooltip = function () {
    scope.copyTooltip = 'Copied!';
    $timeout(function () {
      scope.copyTooltip = "Copy to clipboard";
    }, 3000);
    $mdToast.show($mdToast.simple().textContent('Copied to clipboard!'));
  };

  // Close window function
  scope.cancel = function () {
    $mdDialog.cancel();
  };

  scope.runExport = function () {
    scope.stage = 'running';

    $pog.export(pog.POGID).csv().then(function (resp) {
      scope.command = resp.command;
      scope.export = resp.export;
      scope.stage = 'complete';

      $mdToast.show($mdToast.simple().textContent('Export successfully generated'));
    }, function (err) {
      console.log('Failed to finished export');
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.history', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'api.pogDataHistory', 'history', 'tags', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, $history, history, tags) {

  $scope.history = history;
  $scope.history = _.sortBy($scope.history, 'createdAt').reverse();
  $scope.tags = tags;

  // Open history detail
  $scope.detail = function ($event, entry) {

    $history(pog.POGID, report.ident).detail(entry.ident).then(function (details) {
      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/report/genomic/history/history.detail.html',
        clickOutToClose: false,
        locals: {
          entry: entry,
          details: details,
          tags: tags,
          pog: pog
        },
        controller: 'controller.dashboard.report.genomic.history.detail'
      }).then(function (result) {

        // Revert!
        console.log('Hidden dialog', event);
        if (result.event === 'revert') {
          $scope.history = _.concat(result.data, $scope.history);
          $mdToast.show($mdToast.simple().textContent('The history event has been reverted'));
        }

        // Removal
        if (result.event === 'restore') {
          // Find and remove the entry from history
          $scope.history = _.filter($scope.history, function (h) {
            return h.ident !== result.data.ident;
          });
          $mdToast.show($mdToast.simple().textContent('The history event has been restored'));
        }
      }, function (err) {
        console.log('Canceled dialog', err);
      });
    }, function (err) {
      console.log('Unable to load details');
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.microbial', ['_', '$q', '$scope', 'pog', 'images', function (_, $q, $scope, $state, pog, images) {

  // Load Images into template
  $scope.images = images;
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.knowledgebase', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.detailedGenomicAnalysis.alterations', 'pog', 'report', 'alterations', 'approvedThisCancer', 'approvedOtherCancer', 'targetedGenes', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $alterations, pog, report, alterations, approvedThisCancer, approvedOtherCancer, targetedGenes) {

  $scope.approvedThisCancer = {};
  $scope.approvedOtherCancer = {};
  $scope.pog = pog;
  $scope.report = report;
  $scope.samples = [];
  $scope.alterations = { therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: null };
  $scope.targetedGenes = targetedGenes;
  $scope.showUnknown = false;
  $scope.disableUnknownButtons = false;

  // Create new entry...
  $scope.createNewKBEntry = function ($event) {

    var gene = {};

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
      clickOutToClose: false,
      locals: {
        pog: $scope.pog,
        gene: gene,
        samples: $scope.samples,
        rowEvent: 'new',
        report: report
      },
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
    });
  };

  // Toggle viewing unknowns state
  $scope.toggleUnknown = function () {

    $scope.disableUnknownButtons = true;

    // Show unknowns
    if (!$scope.showUnknown) {
      // First dump all alterations
      $scope.alterations = { therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: {} };

      // Load unknowns
      $alterations.getType(pog.POGID, report.ident, 'unknown').then(function (resp) {
        groupEntries(resp);
        $scope.showUnknown = true;
        $scope.disableUnknownButtons = false;
      }, function (err) {
        console.log('Unable to load unknowns', err);
      });
    }

    // Show All others
    if ($scope.showUnknown) {

      // First dump all alterations
      $scope.alterations = { therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: null };

      // Load unknowns
      $alterations.getAll(pog.POGID, report.ident).then(function (resp) {
        groupEntries(resp);
        $scope.disableUnknownButtons = $scope.showUnknown = false;
      }, function (err) {
        console.log('Unable to load unknowns', err);
      });
    }
  };

  // Resort Groupings
  $scope.trigger = function (val) {
    if (val === false) return;

    // Loop over defined alterations
    _.forEach($scope.alterations, function (v, k) {
      // Loop over alterion type
      _.forEach(v, function (row, rowID) {
        // Is there a mismatch?
        if (row && row.alterationType !== k) {

          // Move to new alteration
          $scope.alterations[row.alterationType].unshift(row);

          $scope.alterations[k].splice(rowID, 1);
        }
      });
    });
  };

  // Filter reference type
  $scope.refType = function (ref) {
    if (ref.match(/^[0-9]{8}\#/)) {
      return 'pmid';
    }
    if (ref.match(/^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
      return 'link';
    }
    return 'text';
  };

  // Prepend a link with http:// if necessary
  $scope.prependLink = function (link) {
    return link.indexOf('http://') == -1 ? 'http://' + link : link;
  };

  // Clean up PMIDs
  $scope.cleanPMID = function (pmid) {
    return pmid.match(/^[0-9]{8}/)[0];
  };

  // Group Alterations by type
  var groupAlterations = function groupAlterations(collection, alterations) {

    alterations.forEach(function (row) {

      // Modify type

      // Does grouping exist?
      if (!(row.gene + '-' + row.variant in collection)) {
        row.children = [];
        return collection[row.gene + '-' + row.variant] = row; // Add row to collection
      }

      if (row.gene + '-' + row.variant in collection) return collection[row.gene + '-' + row.variant].children.push(row);
    });

    return _.values(collection);
  };

  // Group Entries by Type
  var groupEntries = function groupEntries(alterations) {
    // Process the entries for grouping
    alterations.forEach(function (row) {

      // Add to samples if not present
      if ($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);

      // Grouping
      if (!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};

      // Check if it exists already?
      if (!(row.gene + '-' + row.variant in $scope.alterations[row.alterationType])) {
        row.children = [];
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant] = row;
      }

      // Categorical entry already exists
      if (row.gene + '-' + row.variant in $scope.alterations[row.alterationType]) {
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant].children[$scope.alterations[row.alterationType][row.gene + '-' + row.variant].children.length] = row;
      }
    });

    _.forEach($scope.alterations, function (values, k) {
      $scope.alterations[k] = _.values(values);
      //console.log('Iteree: ', k, values, _.values(values));
    });
  };

  // Group Entries
  groupEntries(alterations);

  // Group Approved
  $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
  $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.meta', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.pog_analysis_report', 'pog', 'report', 'indefiniteArticleFilter', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $report, pog, report, indefiniteArticleFilter) {

  $scope.pog = pog;
  $scope.roles = ['bioinformatician', 'analyst', 'reviewer', 'admin', 'clinician'];
  $scope.report = report;
  $scope.reportSettingsChanged = false;

  var reportCache = angular.copy(report);

  // Unbind user
  var removeEntry = function removeEntry(role) {

    $report.unbindUser($scope.report.ident, role.user.ident, role.role).then(function (result) {
      // Find and remove the ident!
      $scope.report = report = result;
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('Failed to unbind user.'));
    });
  };

  //
  $scope.remove = function () {
    return removeEntry;
  };

  $scope.roleFilter = function (filter) {
    return function (puser) {
      return puser.role == filter;
    };
  };

  // Update Patient Information
  $scope.addUser = function ($event, suggestedRole) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/meta/role.add.html',
      clickOutToClose: false,
      controller: ['scope', 'api.user', function (scope, $user) {

        scope.role = { role: suggestedRole };

        scope.cancel = function () {
          $mdDialog.cancel();
        };

        scope.searchUsers = function (searchText) {
          var deferred = $q.defer();

          if (searchText.length === 0) return [];

          $user.search(searchText).then(function (resp) {
            deferred.resolve(resp);
          }, function (err) {
            console.log(err);
            deferred.reject();
          });

          return deferred.promise;
        };

        scope.add = function (f) {

          // Check for valid inputs by touching each entry
          if (f.$invalid) {
            f.$setDirty();
            angular.forEach(f.$error, function (field) {
              angular.forEach(field, function (errorField) {
                errorField.$setTouched();
              });
            });
            return;
          }

          // Perform binding
          $report.bindUser($scope.report.ident, scope.role.user.ident, scope.role.role).then(function (resp) {
            $mdDialog.hide({ data: resp, message: scope.role.user.firstName + ' ' + scope.role.user.lastName + ' has been added as ' + indefiniteArticleFilter(scope.role.role) + ' ' + scope.role.role });
          }, function (err) {
            console.log('Binding error', err);
          });
        }; // end Add
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.report = report = outcome.data;
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent('No changes were made'));
    });
  }; // End add user

  $scope.checkChange = function () {

    if ($scope.report.type !== reportCache.type) $scope.reportSettingsChanged = true;
    if ($scope.report.state !== reportCache.state) $scope.reportSettingsChanged = true;
    if ($scope.report.reportVersion !== reportCache.reportVersion) $scope.reportSettingsChanged = true;
    if ($scope.report.kbVersion !== reportCache.kbVersion) $scope.reportSettingsChanged = true;

    if ($scope.reportSettingsChanged && JSON.stringify($scope.report) === JSON.stringify(reportCache)) {
      $scope.reportSettingsChanged = false;
    }
  };

  $scope.updateSettings = function () {

    $scope.reportSettingsChanged = false;

    // Send updated settings to API
    $report.update($scope.report).then(function (result) {
      // Report successfully updated
      $scope.report = result;
      reportCache = angular.copy(result);

      $mdToast.show($mdToast.simple().textContent('Report settings have been updated.'));
    }, function (err) {
      // Failed to update, restore from cache.
      $scope.report = angular.copy(reportCache);
      $mdToast.show($mdToast.simple().textContent('The report settings could not be updated.'));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.pathwayAnalysis', ['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.pog', 'api.summary.pathwayAnalysis', 'FileUploader', 'api.session', 'pog', 'report', 'pathway', function (_, $q, $scope, $mdDialog, $mdToast, $pog, $pathway, FileUploader, $session, pog, report, pathway) {

  $scope.pog = pog;

  var processSVG = function processSVG(svg) {

    // Get container div
    var svgImage = document.getElementById('svgImage');

    if (svgImage.innerHTML.length > 0) {
      // Destroy so we can build it bigger, faster, better than before!
      svgImage.innerHTML = '';
    }

    // Create SVG DOM element from String
    $scope.pathway = new DOMParser().parseFromString(svg, 'application/xml');

    // Extract SVG element from within XML wrapper.
    var xmlSVG = $scope.pathway.getElementsByTagName('svg')[0];
    xmlSVG.id = "pathway"; // Set ID that we can grapple.
    xmlSVG.style = 'width: 100%; height: 800px;'; // Set width & height TODO: Make responsive

    // Create PanZoom object
    var panZoom = {};

    // Load in SVG after slight delay. (otherwise xmlSVG processing isn't ready.
    // TODO: Use promises to clean this up.
    setTimeout(function () {
      svgImage = document.getElementById('svgImage');

      svgImage.appendChild(svgImage.ownerDocument.importNode($scope.pathway.documentElement, true));
      var panZoom = svgPanZoom('#pathway', {
        preventMouseEventsDefault: true,
        enableControlIcons: true,
        controlIconsEnabled: true
      });
      panZoom.resize();
      panZoom.fit();
      panZoom.center();
    }, 100);
  };

  // Show a message if pathway isn't created yet.
  if (pathway !== null) processSVG(pathway.pathway);
  if (pathway === null) processSVG('<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="0" y="0" fill="rgb(210,210,210)">Pathway not yet analyzed.</text></svg>');

  /**
   * Update The SVG Pathway diagram
   *
   * @param $event
   */
  $scope.update = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/pathwayAnalysis/pathwayAnalysis.edit.html',
      locals: {
        pog: pog
      },
      clickOutToClose: false,
      controller: ['$q', '_', '$scope', '$mdDialog', '$timeout', function ($q, _, scope, $mdDialog, $timeout) {

        scope.process = 'select';
        scope.progress = 0;
        scope.filename = "";

        // Cancel Dialog
        scope.cancel = function () {
          $mdDialog.cancel('Canceled Edit - No changes made.');
        };

        var selectedItem = void 0;
        var uploader = scope.uploader = new FileUploader({
          url: CONFIG.ENDPOINTS.API + '/POG/' + pog.POGID + '/report/' + report.ident + '/genomic/summary/pathwayAnalysis'
        });

        uploader.headers['Authorization'] = $session.getToken();
        uploader.method = 'PUT';
        uploader.alias = "pathway";

        // Sync filter
        uploader.filters.push({
          name: 'syncFilter',
          fn: function fn(item, options) {
            if (item.type !== "image/svg+xml") console.log('That is not an SVG!');
            return item.type === "image/svg+xml";
          }
        });

        uploader.onErrorItem = function (fileItem, response, status, headers) {
          console.info('onErrorItem', fileItem, response, status, headers);
        };

        // Kick off upload
        uploader.onAfterAddingFile = function (fileItem) {
          console.log('Selected ', fileItem);
          scope.filename = fileItem.file.name;
          selectedItem = fileItem;
          scope.process = "upload";
        };

        uploader.onProgressItem = function (fileItem, progress) {
          scope.progress = progress;
        };

        // Initiate Upload
        scope.initiateUpload = function () {
          scope.startedUpload = true;
          uploader.uploadItem(selectedItem);
        };

        // Only allow 1 upload. When Finished
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
          console.info('API Response on complete', response);
          $mdDialog.hide({ data: response, message: 'Pathway Analysis data updated.' });
        };
      }]
    }).then(function (result) {
      // Update current page content
      processSVG(result.data.pathway);
      // Display Message from Hiding
      $mdToast.show($mdToast.simple().textContent(result.message));
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.smallMutations', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'api.vardb', 'pog', 'report', 'ms', 'images', 'smallMutations', 'mutationSignature', 'mutationSummaryImages', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, $vardb, pog, report, ms, images, smallMutations, mutationSignature, mutationSummaryImages) {

  // Load Images into template
  $scope.images = images;
  $scope.pog = pog;
  $scope.report = report;
  $scope.smallMutations = {};
  $scope.mutationSignature = mutationSignature;
  $scope.ms = null;
  $scope.mutationSummaryImages = {};

  var processMutations = function processMutations(muts) {
    var mutations = {
      clinical: [],
      nostic: [],
      biological: [],
      unknown: []
    };

    // Run over mutations and group
    _.forEach(muts, function (row, k) {
      if (!(row.mutationType in mutations)) mutations[row.mutationType] = [];
      // Add to type
      mutations[row.mutationType].push(row);
    });

    // Set Small Mutations
    $scope.smallMutations = mutations;
  };

  var pickCompatator = function pickCompatator() {
    var search = _.find(ms, { comparator: report.tumourAnalysis.diseaseExpressionComparator });

    if (!search) search = _.find(ms, { comparator: 'average' });

    $scope.ms = search;
  };

  var processMutationSummaryImages = function processMutationSummaryImages(images) {

    var ssorted = {
      barplot: {
        indel: [],
        snv: [],
        sv: []
      },
      densityPlot: {
        indel: [],
        snv: [],
        sv: []
      },
      legend: {
        indel_snv: [],
        sv: []
      }
    };

    var sorted = {
      comparators: [],
      indel: {
        barplot: [],
        densityPlot: []
      },
      snv: {
        barplot: [],
        densityPlot: []
      },
      sv: {
        barplot: [],
        densityPlot: []
      },
      legend: {
        snv_indel: [],
        sv: null
      }
    };

    _.forEach(images, function (img) {

      // If it's an SV image, skip!
      if (img.filename.indexOf('_sv.') > -1) return;

      // Explode filename to extract comparator
      var pieces = img.key.split('.');

      // If no comparator in key, set to null
      img.comparator = pieces[2] || null;

      // If there's no comparator, and the file isn't an sv image, set the comparator to the value selected from tumour analysis (Backwards compatibility for v4.5.1 and older)
      if (!img.comparator) img.comparator = report.tumourAnalysis.diseaseExpressionComparator; // If no comparator found in image, likely legacy and use report setting.

      // Legend image
      if (img.filename.indexOf('legend') > -1 && img.filename.indexOf('snv_indel') > -1) return sorted.legend.snv_indel = img;

      // Set comparator to lowercase
      if (img.comparator.toLowerCase() && !_.find(sorted.comparators, { name: img.comparator.toLowerCase() })) sorted.comparators.push({ name: img.comparator.toLowerCase(), visible: false });

      if (pieces[1].indexOf('barplot_indel') > -1 || pieces[1] === 'bar_indel') sorted.indel.barplot.push(img);
      if (pieces[1].indexOf('barplot_snv') > -1 || pieces[1] === 'bar_snv') sorted.snv.barplot.push(img);

      if (pieces[1].indexOf('density_plot_indel') > -1 || pieces[1] === 'indel') sorted.indel.densityPlot.push(img);
      if (pieces[1].indexOf('density_plot_snv') > -1 || pieces[1] === 'snv') sorted.snv.densityPlot.push(img);
    });

    console.log(sorted);

    $scope.mutationSummaryImages = sorted;
  };

  /**
   * Retrieve specific mutation summary image
   *
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   *
   * @returns
   */
  $scope.getMutationSummaryImage = function (graph, type) {
    var comparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    //return _.find($scope.mutationSummaryImages[type][graph], {comparator: comparator});
    return _.find($scope.mutationSummaryImages[type][graph], function (c) {
      return c.comparator.toLowerCase() === comparator.toLowerCase();
    });
  };

  processMutationSummaryImages(mutationSummaryImages);
  processMutations(smallMutations);
  pickCompatator();
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.spearman', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'images', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, images) {

  // Load Images into template
  $scope.images = images;

  // Convert full hex to 6chr
  $scope.colourHex = function (hex) {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.structuralVariation', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'images', 'svs', 'ms', 'mutationSummaryImages', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, images, svs, ms, mutationSummaryImages) {

  // Load Images into template
  $scope.images = images;
  $scope.pog = pog;
  $scope.report = report;
  $scope.ms = ms;
  $scope.StrucVars = {};

  var pickCompatator = function pickCompatator() {
    var search = _.find(ms, { comparator: report.tumourAnalysis.diseaseExpressionComparator });

    if (!search) search = _.find(ms, { comparator: 'average' });

    $scope.ms = search;
  };

  $scope.titleMap = {
    clinical: 'Gene Fusions of Potential Clinical Relevance with Genome & Transcriptome Support',
    nostic: 'Gene Fusions of Prognostic and Diagnostic Relevance',
    biological: 'Gene Fusions with Biological Relevance',
    fusionOmicSupport: 'Gene Fusions with Genome and Transcriptome Support'
  };

  var processMutationSummaryImages = function processMutationSummaryImages(images) {

    var sorted = {
      comparators: [],
      sv: {
        barplot: [],
        densityPlot: []
      },
      legend: {
        sv: null
      }
    };

    _.forEach(images, function (img) {

      if (img.key.indexOf('sv') === -1) return;

      var pieces = img.key.split('.');
      img.comparator = pieces[2] || null;
      if (!img.comparator) img.comparator = report.tumourAnalysis.diseaseExpressionComparator; // If no comparator found in image, likely legacy and use report setting.

      if (img.comparator.toLowerCase() && !_.find(sorted.comparators, { name: img.comparator.toLowerCase() })) sorted.comparators.push({ name: img.comparator.toLowerCase(), visible: false });

      if (pieces[1].indexOf('barplot_sv') > -1 || pieces[1] === 'bar_sv') sorted.sv.barplot.push(img);
      if (pieces[1].indexOf('density_plot_sv') > -1 || pieces[1] === 'sv') sorted.sv.densityPlot.push(img);

      if (pieces[1].indexOf('legend_sv') > -1) sorted.legend.sv = img;
    });

    console.log('Sorted Images', sorted);

    $scope.mutationSummaryImages = sorted;
  };

  /**
   * Retrieve specific mutation summary image
   *
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   *
   * @returns
   */
  $scope.getMutationSummaryImage = function (graph, type) {
    var comparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    if (comparator === null) {
      var img = $scope.mutationSummaryImages[type][graph];
      if (img && img.length === 1) return img[0];
    }
    return _.find($scope.mutationSummaryImages[type][graph], function (c) {
      return c.comparator.toLowerCase() === comparator.toLowerCase();
    });
  };

  var processSvs = function processSvs(structVars) {

    var svs = {
      clinical: [],
      nostic: [],
      biological: [],
      fusionOmicSupport: []
    };

    // Run over mutations and group
    _.forEach(structVars, function (row, k) {
      if (!(row.svVariant in svs)) svs[row.svVariant] = [];
      // Add to type
      svs[row.svVariant].push(row);
    });

    // Set Small Mutations
    $scope.StrucVars = svs;
  };

  processSvs(svs);
  pickCompatator();
  processMutationSummaryImages(mutationSummaryImages);
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.summary', ['_', '$q', '$state', '$scope', 'api.pog', 'api.summary.tumourAnalysis', 'api.summary.patientInformation', 'api.summary.mutationSummary', 'api.summary.genomicAterationsIdentified', '$mdDialog', '$mdToast', 'pog', 'report', 'gai', 'get', 'ms', 'pt', 'vc', 'mutationSignature', 'microbial', function (_, $q, $state, $scope, $pog, $tumourAnalysis, $patientInformation, $mutationSummary, $gai, $mdDialog, $mdToast, pog, report, gai, get, ms, pt, vc, mutationSignature, microbial) {

  // Determine which interpreted prevalence value will be displayed
  ms.snvPercentileCategory = report.tumourAnalysis.diseaseExpressionComparator === 'average' ? ms.snvPercentileTCGACategory : ms.snvPercentileDiseaseCategory;
  ms.indelPercentileCategory = report.tumourAnalysis.diseaseExpressionComparator === 'average' ? ms.indelPercentileTCGACategory : ms.indelPercentileDiseaseCategory;

  $scope.pog = pog;
  $scope.report = report;
  $scope.data = {
    get: get,
    ms: ms,
    vc: vc,
    pt: pt,
    ta: report.tumourAnalysis,
    pi: report.patientInformation,
    microbial: microbial !== null ? microbial : { species: "None", integrationSite: "None" }
  };
  $scope.mutationSignature = mutationSignature;
  $scope.mutationMask = null;
  $scope.variantCounts = {
    cnv: 0,
    smallMutation: 0,
    expressionOutlier: 0,
    structuralVariant: 0
  };

  $scope.toMutations = function () {
    $state.go('^.somaticMutations');
  };

  var variantCategory = function variantCategory(variant) {
    var cnvs = ['copy gain', 'copy loss', 'amplification', 'Homozygous Loss', 'Homozygous Gain'];

    // Small Mutations
    if (variant.geneVariant.match(/([A-z0-9]*)\s(\(\p\.[A-z]*[0-9]*[A-z_0-9]*\*?\))/g)) {
      variant.type = "smallMutation";
      return variant;
    }

    // Structural Variants
    if (variant.geneVariant.match(/([A-z0-9]*\:\:[A-z0-9]*\s\(\e([0-9]*|\?)\:\e([0-9]*|\?)\))/g)) {
      variant.type = "structuralVariant";
      return variant;
    }

    // Expression Outliers
    if (variant.geneVariant.toLowerCase().indexOf('expression') !== -1) {
      variant.type = "expressionOutlier";
      return variant;
    }

    // Return CNV mutation
    variant.type = "cnv";
    return variant;
  };

  // Process variants and create chunks
  var processVariants = function processVariants(variants) {

    var output = [];

    // Reset counts
    $scope.variantCounts = { cnv: 0, smallMutation: 0, expressionOutlier: 0, structuralVariant: 0 };

    variants.forEach(function (variant, k) {
      // Add processed Variant
      output.push(variantCategory(variant));

      // Update counts
      if (!$scope.variantCounts[gai[k].type]) $scope.variantCounts[gai[k].type] = 0;
      $scope.variantCounts[gai[k].type]++;
    });

    return output;
  };
  $scope.geneVariants = processVariants(gai);

  $scope.setMutationMask = function (mask) {
    if ($scope.mutationMask === mask) return $scope.mutationMask = null;
    $scope.mutationMask = mask;
  };

  $scope.mutationFilter = function (mutation) {
    return mutation.type === $scope.mutationMask || $scope.mutationMask === null;
  };

  // Update Tumour Analysis Details
  $scope.updateTa = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/tumourAnalysis.edit.html',
      clickOutToClose: false,
      controller: ['scope', function (scope) {

        scope.ta = $scope.data.ta;

        scope.cancel = function () {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = function (f) {
          // Check for valid inputs by touching each entry
          if (f.$invalid) {
            f.$setDirty();
            angular.forEach(f.$error, function (field) {
              angular.forEach(field, function (errorField) {
                errorField.$setTouched();
              });
            });
            return;
          }

          console.log($tumourAnalysis);

          // Send updated entry to API
          $tumourAnalysis.update(pog.POGID, report.ident, scope.ta).then(function (result) {
            $mdDialog.hide('Entry has been updated');
          }, function (error) {
            alert('Unable to update. See console');
            console.log(error);
          });
        }; // End update
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome));
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }; // End edit tumour analysis


  // Update Tumour Analysis Details
  $scope.updateMs = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/mutationSignature.edit.html',
      clickOutToClose: false,
      controller: ['scope', function (scope) {

        scope.ta = angular.copy($scope.data.ta); //
        scope.mutationSignature = $scope.mutationSignature; // Array of all computed signal correlations

        scope.cancel = function () {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = function () {

          // Send updated entry to API
          $tumourAnalysis.update($scope.pog.POGID, report.ident, scope.ta).then(function (result) {
            $mdDialog.hide({ message: 'Entry has been updated', data: scope.ta });
          }, function (error) {
            alert('Unable to update. See console');
            console.log(error);
          });
        }; // End update
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.data.ta = outcome.data;
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }; // End edit tumour analysis

  // Update Patient Information
  $scope.updatePatient = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/patientInformation.edit.html',
      clickOutToClose: false,
      controller: ['scope', function (scope) {

        scope.pi = angular.copy($scope.data.pi); //

        scope.cancel = function () {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = function () {

          // Send updated entry to API
          $patientInformation.update($scope.pog.POGID, scope.pi).then(function (result) {
            $mdDialog.hide({ message: 'Entry has been updated', data: scope.pi });
          }, function (error) {
            alert('Unable to update. See console');
            console.log(error);
          });
        }; // End update
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.data.pi = outcome.data;
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }; // End edit tumour analysis


  $scope.data.gai = _.sortBy(gai, 'type');

  /**
   * Add Alteration
   */
  $scope.addAlteration = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/alteration.add.html',
      clickOutToClose: false,
      controller: ['scope', function (scope) {
        scope.cancel = function () {
          $mdDialog.cancel({ message: 'No changes were saved.' });
        };

        // Perform Update/Change
        scope.add = function () {

          // Remove entry
          $gai.create(pog.POGID, report.ident, scope.alteration).then(function (resp) {
            // Add to array of alterations
            gai.push(resp);

            // Reprocess variants
            $scope.data.gai = processVariants(gai);
            $scope.data.gai = _.sortBy(gai, 'type');

            $mdDialog.hide({ status: true, message: 'Added the new alteration.' });
          }, function (err) {
            console.log('Unable to remove entries', err);
            $mdDialog.hide({ status: false, message: 'Unable to create the new entry' });
          });
        }; // End update
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent('No changes where made.'));
    });
  };

  /**
   * Remove alteration and propagate into other sections
   *
   * @param $event
   * @param alteration
   */
  $scope.removeAlteration = function ($event, alteration) {

    var tempAlteration = angular.copy(alteration);

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/alteration.remove.html',
      clickOutToClose: false,
      controller: ['scope', function (scope) {
        scope.alteration = alteration;

        scope.cancel = function () {
          $mdDialog.cancel({ message: 'No changes were saved.' });
        };

        // Perform Update/Change
        scope.update = function (cascade) {

          // Remove entry
          $gai.remove(pog.POGID, report.ident, alteration.ident, scope.comment, cascade).then(function (resp) {
            $scope.data.gai = _.reject($scope.data.gai, function (r) {
              return r.ident === alteration.ident;
            });
            gai = _.reject(gai, function (r) {
              return r.ident === alteration.ident;
            });

            // Remove from Get
            if (cascade) $scope.data.get = _.reject($scope.data.get, function (e) {
              return e.genomicEvent === alteration.geneVariant;
            });

            // Subtract count
            $scope.variantCounts[tempAlteration.type]--;

            $mdDialog.hide({ status: true, message: 'Successfully removed the ' + (cascade ? 'entries' : 'entry') + '.' });
          }, function (err) {
            console.log('Unable to remove entries', err);
            $mdDialog.hide({ status: true, message: 'Unable to remove the ' + (cascade ? 'entries' : 'entry') + '.' });
          });
        }; // End update
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent('No changes where made.'));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.therapeutic.edit', ['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.therapeuticOptions', 'api.knowledgebase', 'pog', 'report', 'entry', 'newEntry', function (_, $q, scope, $mdDialog, $mdToast, $complete, $therapeutic, $kb, pog, report, entry, newEntry) {

  scope.tab = 'listing';
  scope.entry = entry || { target: [], targetContext: null, biomarker: [], notes: null };
  scope.type = entry ? entry.type : newEntry;
  scope.create = !newEntry;
  scope.bioMarkerContexts = [{ entry: 'overexpressed', description: 'a high fold-change alone is of significance' }, { entry: 'underexpressed', description: 'a low fold-change alone is of significance' }, { entry: 'high percentile', description: 'high percentile alone is of significance' }, { entry: 'low percentile', description: 'low percentile alone is of significance' }, { entry: 'outlier high', description: 'high outlier by both percentile and fold change' }, { entry: 'outlier low', description: 'low outlier by both percentile and fold change' }, { entry: 'amplification', description: '(usually focal or extreme copy number)' }, { entry: 'hom-del', description: 'homozygous deletion (reviewed as real)' }, { entry: 'copy gain', description: 'any copy gain deemed significant' }, { entry: 'copy loss', description: 'any copy loss deemed significant' }, { entry: 'LoF mutation', description: 'loss-of-function mutation' }, { entry: 'GoF mutation', description: 'gain-of-function mutation' }, { entry: 'SoF mutation', description: 'switch-of-function mutation' }, { entry: 'DN mutation', description: 'dominant-negative mutation' }, { entry: 'mutation', description: 'significant mutation with no formal functional description' }, { entry: 'structural variant', description: 'any significant structural variant' }, { entry: 'gene-fusion', description: 'any significant gene fusion' }, { entry: 'mutation signature', description: 'any significant mutation signature (specify type in previous field)' }, { entry: 'mutation burden', description: 'any significant mutation burden' }, { entry: 'high expression outlier', description: 'N/A' }, { entry: 'low expression outlier', description: 'N/A' }, { entry: 'wildtype', description: 'N/A' }];

  scope.bioMarkerContexts = _.sortBy(scope.bioMarkerContexts, 'entry');

  scope.new = {
    biomarkerContextValue: null,
    biomarkerValue: null
  };

  scope.removeBiomarkerContext = function (marker, context) {
    delete scope.entry.biomarker[marker].context.splice(context, 1);
  };

  scope.removeBiomarker = function (marker) {
    delete scope.entry.biomarker.splice(marker, 1);
  };

  scope.newBiomarkerContext = function (marker) {

    // New Biomarker Entry
    if (marker === null) {
      scope.entry.biomarker.push({ entry: null, context: [scope.new.biomarkerContextValue] });
      scope.new.biomarkerContextValue = null; // Blank out!
      return;
    }

    if (scope.new.biomarkerContextValue === null) return;
    scope.entry.biomarker[marker].context.push(scope.new.biomarkerContextValue); // Add new entry
    scope.new.biomarkerContextValue = null; // Blank out!
  };

  scope.newBiomarker = function () {
    if (scope.new.biomarkerValue === null) return;
    scope.entry.biomarker.push({ entry: scope.new.biomarkerValue, context: [] });
    scope.new.biomarkerValue = null;
  };

  // Need to chipify the geneVar entries
  var targets = [];
  if (entry !== null) {
    _.forEach(entry.target, function (e) {
      if (e !== null) targets.push({ entry: e });
    });
  }

  var biomarkers = [];
  // Transform chip for auto complete
  scope.transformChip = function (geneVar) {
    // If it is an object, it's already a known chip
    if (angular.isObject(geneVar)) return geneVar;

    // Otherwise, create a new one
    return { geneVar: geneVar, type: 'new' };
  };

  scope.geneVar = {};

  // Auto-complete search filter
  scope.geneVar.filter = function (query) {
    var deferred = $q.defer();
    if (query.length < 3) deferred.resolve([]);

    if (query.length >= 3) {
      $kb.genevar(query).then(function (entries) {
        deferred.resolve(entries);
      }, function (err) {
        console.log('Unable to search for entries', err);
      });
    }
    return deferred.promise;
  };

  scope.geneTarget = {};

  scope.geneTarget.filter = function (query) {
    return $q(function (resolve, reject) {
      resolve([]);
    });
  };

  // Check, clean, and prepare save object
  scope.save = function () {

    var newTherapeutic = angular.copy(scope.entry);

    // De-objectify targets
    var targets = [];
    _.forEach(scope.entry.target, function (v) {
      targets.push(v.geneVar);
    });

    newTherapeutic.target = targets;

    // Is this a new entry?
    if (newEntry !== false) {

      newTherapeutic.type = newEntry; // Set Type passed by creator

      // Save new entry
      $therapeutic.create(pog.POGID, report.ident, newTherapeutic).then(function (result) {
        // New entry created!
        $mdDialog.hide({ status: 'create', data: result });
      }, function (err) {
        console.log('Unable to create new entry!');
      });
    } else {
      // Update existing entry
      $therapeutic.one(pog.POGID, report.ident).update(newTherapeutic.ident, newTherapeutic).then(function (result) {
        // New entry created!
        $mdDialog.hide({ status: 'update', data: result });
      }, function (err) {
        console.log('Unable to update entry!');
      });
    }
  };

  // Remove Entry from DB
  scope.remove = function () {
    var removed = angular.copy(entry);
    $mdDialog.hide({ status: 'deleted', data: { ident: removed.ident, type: removed.type } });

    $therapeutic.one(pog.POGID, report.ident).remove(entry.ident).then(function (result) {
      console.log('Entry removed! within modal');
      // Entry removed!
      $mdDialog.hide({ status: 'deleted', data: removedIdent });
    }, function (err) {
      console.log('Unable to update entry!');
    });
  };

  scope.cancel = function () {
    $mdDialog.cancel();
  };
}]); // End controller
'use strict';

app.controller('controller.dashboard.report.genomic.therapeutic', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'api.therapeuticOptions', 'therapeutic', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, $therapeutic, therapeutic) {

  $scope.therapeutic = {
    therapeutic: [],
    chemoresistance: []
  };

  $scope.rowOptions = [];

  // Sort into groups
  var groupTherapeutics = function groupTherapeutics() {
    _.forEach(therapeutic, function (v) {
      if (v.type === 'therapeutic') {
        var targets = [];
        _.forEach(v.target, function (e) {
          targets.push(angular.isObject(e) ? e : { geneVar: e });
        });
        v.target = targets;
        $scope.therapeutic.therapeutic.push(v);
      }
      if (v.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(v);
    });
  };

  groupTherapeutics();

  // Edit Therapeutic Targets
  $scope.edit = function ($event, entry) {
    $mdDialog.show({
      targetEvent: $event,
      clickOutsideToClose: false,
      locals: {
        newEntry: false,
        entry: entry,
        pog: pog,
        report: report
      },
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.edit.html',
      controller: 'controller.dashboard.report.genomic.therapeutic.edit'
    }).then(function (result) {
      // If an existing entry was updated
      if (result.status === 'updated') {
        var data = result.data;

        if (data.type === 'therapeutic') data.target = cleanTargets(data.target);

        // Loop over entries in type, find matching ident, and replace
        _.forEach($scope.therapeutic[data.type], function (e, i) {
          if (e.ident === data.ident) $scope.therapeutic[data.type][i] = e;
        });

        $mdToast.show($mdToast.simple({ textContent: 'Changes saved' }));
      }

      // Removing an entry
      if (result.status === 'deleted') {
        var _data = result.data;
        _.remove($scope.therapeutic[_data.type], function (e) {
          return e.ident === _data.ident;
        });
        $mdToast.show($mdToast.simple({ textContent: 'The entry has been removed' }));
      }
    }, function () {
      $mdToast.show($mdToast.simple({ textContent: 'No changes were made.' }));
    });
  };

  /**
   * Turn collection into array of targets
   *
   * @param targets
   * @returns {Array}
   */
  var cleanTargets = function cleanTargets(targets) {
    var newTargets = [];
    _.forEach(targets, function (e) {
      newTargets.push(angular.isObject(e) ? e : { geneVar: e });
    });
    return newTargets;
  };

  $scope.newEntry = function ($event, type) {

    // Create new entry by type
    $mdDialog.show({
      targetEvent: $event,
      clickOutsideToClose: false,
      locals: {
        newEntry: type,
        entry: false,
        pog: pog,
        report: report
      },
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.edit.html',
      controller: 'controller.dashboard.report.genomic.therapeutic.edit'
    }).then(function (result) {
      var data = result.data;

      // If therapeutic
      if (data.type === 'therapeutic') {
        data.target = cleanTargets(data.target);
        $scope.therapeutic.therapeutic.push(data);
      }
      if (data.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(data);

      $mdToast.show($mdToast.simple({ textContent: 'New entry saved' }));
    }, function (cancel) {
      $mdToast.show($mdToast.simple({ textContent: 'No changes were made' }));
    });
  };

  // Order updated
  $scope.updateSorting = function ($item, $partFrom, $partTo, $indexFrom, $indexTo) {

    console.log('Item', $item);
    console.log('partFrom', $partFrom);
    console.log('partTo', $partTo);
    console.log('indexFrom', $indexFrom);
    console.log('indexTo', $indexTo);

    // Loop over each and update their positions
    var updates = [];

    // Update Each Entry
    _.forEach($partTo, function (e, i) {
      e.rank = i;
      updates.push($therapeutic.one(pog.POGID, report.ident).update(e.ident, e));
    });

    $q.all(updates).then(function (result) {
      $mdToast.show($mdToast.simple().textContent('Changed order saved'));
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('Unable to save the updated order'));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.probe.appendices', ['_', '$q', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog', 'report', 'tcgaAcronyms', function (_, $q, $scope, $pog, $mdDialog, $mdToast, pog, report, tcga) {

  $scope.pog = pog;
  $scope.report = report;
  $scope.tcga = tcga;

  $scope.hashClean = function (i) {
    return String(i).replace('#', '');
  };
}]);
'use strict';

app.controller('controller.dashboard.report.probe.detailedGenomicAnalysis', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.probe.alterations', 'pog', 'report', 'alterations', 'approvedThisCancer', 'approvedOtherCancer', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $alterations, pog, report, alterations, approvedThisCancer, approvedOtherCancer) {

  $scope.approvedThisCancer = {};
  $scope.approvedOtherCancer = {};
  $scope.pog = pog;
  $scope.report = report;
  $scope.samples = [];
  $scope.alterations = { therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {} };

  // Create new entry...
  $scope.createNewKBEntry = function ($event) {

    var gene = {};

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
      clickOutToClose: false,
      locals: {
        pog: $scope.pog,
        gene: gene,
        samples: $scope.samples,
        rowEvent: 'new',
        report: report
      },
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
    });
  };

  // Resort Groupings
  $scope.trigger = function (val) {
    if (val === false) return;

    // Loop over defined alterations
    _.forEach($scope.alterations, function (v, k) {
      // Loop over alterion type
      _.forEach(v, function (row, rowID) {
        // Is there a mismatch?
        if (row && row.alterationType !== k) {

          // Move to new alteration
          $scope.alterations[row.alterationType].unshift(row);

          $scope.alterations[k].splice(rowID, 1);
        }
      });
    });
  };

  // Filter reference type
  $scope.refType = function (ref) {
    if (ref.match(/^[0-9]{8}\#/)) {
      return 'pmid';
    }
    if (ref.match(/^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
      return 'link';
    }
    return 'text';
  };

  // Prepend a link with http:// if necessary
  $scope.prependLink = function (link) {
    return link.indexOf('http://') == -1 ? 'http://' + link : link;
  };

  // Clean up PMIDs
  $scope.cleanPMID = function (pmid) {
    return pmid.match(/^[0-9]{8}/)[0];
  };

  // Group Alterations by type
  var groupAlterations = function groupAlterations(collection, alterations) {

    alterations.forEach(function (row) {

      // Modify type

      // Does grouping exist?
      if (!(row.gene + '-' + row.variant in collection)) {
        row.children = [];
        return collection[row.gene + '-' + row.variant] = row; // Add row to collection
      }

      if (row.gene + '-' + row.variant in collection) return collection[row.gene + '-' + row.variant].children.push(row);
    });

    return _.values(collection);
  };

  // Group Entries by Type
  var groupEntries = function groupEntries(alterations) {
    // Process the entries for grouping
    alterations.forEach(function (row) {

      // Add to samples if not present
      if ($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);

      // Grouping
      if (!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};

      // Check if it exists already?
      if (!(row.gene + '-' + row.variant in $scope.alterations[row.alterationType])) {
        row.children = [];
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant] = row;
      }

      // Categorical entry already exists
      if (row.gene + '-' + row.variant in $scope.alterations[row.alterationType]) {
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant].children[$scope.alterations[row.alterationType][row.gene + '-' + row.variant].children.length] = row;
      }
    });

    _.forEach($scope.alterations, function (values, k) {
      $scope.alterations[k] = _.values(values);
      //console.log('Iteree: ', k, values, _.values(values));
    });
  };

  // Group Entries
  groupEntries(alterations);

  // Group Approved
  $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
  $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
}]);
'use strict';

app.controller('controller.dashboard.report.probe.meta', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.pog_analysis_report', 'pog', 'report', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $report, pog, report) {

  $scope.pog = pog;
  $scope.report = report;
  $scope.reportSettingsChanged = false;

  var reportCache = angular.copy(report);

  $scope.checkChange = function () {

    if ($scope.report.type !== reportCache.type) $scope.reportSettingsChanged = true;
    if ($scope.report.state !== reportCache.state) $scope.reportSettingsChanged = true;
    if ($scope.report.reportVersion !== reportCache.reportVersion) $scope.reportSettingsChanged = true;
    if ($scope.report.kbVersion !== reportCache.kbVersion) $scope.reportSettingsChanged = true;

    if ($scope.reportSettingsChanged && JSON.stringify($scope.report) === JSON.stringify(reportCache)) {
      $scope.reportSettingsChanged = false;
    }
  };

  $scope.updateSettings = function () {

    $scope.reportSettingsChanged = false;

    // Send updated settings to API
    $report.update($scope.report).then(function (result) {
      // Report successfully updated
      $scope.report = result;
      reportCache = angular.copy(result);

      $mdToast.show($mdToast.simple().textContent('Report settings have been updated.'));
    }, function (err) {
      // Failed to update, restore from cache.
      $scope.report = angular.copy(reportCache);
      $mdToast.show($mdToast.simple().textContent('The report settings could not be updated.'));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.probe.summary', ['_', '$q', '$state', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog', 'report', 'testInformation', 'genomicEvents', 'api.probe.signature', 'api.summary.patientInformation', 'api.summary.genomicEventsTherapeutic', 'signature', function (_, $q, $state, $scope, $pog, $mdDialog, $mdToast, pog, report, testInformation, genomicEvents, $signature, $patientInformation, $get, signature) {

  $scope.pog = pog;
  $scope.pi = pog.patientInformation;
  $scope.report = report;
  $scope.testInformation = testInformation;
  $scope.genomicEvents = genomicEvents;
  $scope.signature = signature;

  // Update Patient Information
  $scope.updatePatient = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/patientInformation.edit.html',
      clickOutToClose: false,
      controller: ['scope', function (scope) {

        scope.pi = angular.copy($scope.report.patientInformation); //

        scope.cancel = function () {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = function () {

          // Send updated entry to API
          $patientInformation.update($scope.pog.POGID, report.ident, scope.pi).then(function (result) {
            $mdDialog.hide({ message: 'Entry has been updated', data: scope.pi });
          }, function (error) {
            alert('Unable to update. See console');
            console.log(error);
          });
        }; // End update
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.data.pi = outcome.data;
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }; // End edit tumour analysis


  // Sign The comments
  $scope.sign = function (role) {

    // Send signature to API
    $signature.sign(pog.POGID, report.ident, role).then(function (result) {
      $scope.signature = result;
    });
  };

  // Sign The comments
  $scope.revokeSign = function (role) {

    // Send signature to API
    $signature.revoke(pog.POGID, report.ident, role).then(function (result) {
      $scope.signature = result;
    });
  };

  // Update Patient Information
  $scope.modifyEvent = function ($event, event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/probe/summary/summary.events.html',
      clickOutToClose: false,
      controller: ['scope', function (scope) {

        scope.event = angular.copy(event);

        scope.cancel = function () {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = function () {

          // Send updated entry to API
          $get.update($scope.pog.POGID, report.ident, event.ident, scope.event).then(function (result) {
            $mdDialog.hide({ message: 'Entry has been updated', data: result });
          }, function (error) {
            alert('Unable to update. See console');
            console.log(error);
          });
        }; // End update
      }] // End controller

    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      _.forEach($scope.genomicEvents, function (e, i) {
        if (e.ident === outcome.data.ident) $scope.genomicEvents[i] = outcome.data;
      });
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent('No changes were saved.'));
    });
  }; // End edit tumour analysis
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.expressionAnalysisv1', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'ms', 'outliers', 'protein', 'drugTargets', 'densityGraphs', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, ms, outliers, protein, drugTargets, densityGraphs) {

  // Load Images into template
  $scope.pog = pog;
  $scope.report = report;
  $scope.expOutliers = {};
  $scope.expProtein = {};
  $scope.drugTargets = drugTargets;
  $scope.densityGraphs = _.chunk(_.values(densityGraphs), 2);

  $scope.titleMap = {
    clinical: 'RNA Expression Level Outliers of Potential Clinical Relevance',
    nostic: 'RNA Expression Level Outliers of Prognostic or Diagnostic Relevance',
    biological: 'RNA Expression Level Outliers of Biological Relevance'
  };

  $scope.proteinTitleMap = {
    clinical: 'Protein Expression Level Outliers of Potential Clinical Relevance',
    nostic: 'Protein Expression Level Outliers of Prognostic or Diagnostic Relevance',
    biological: 'Protein Expression Level Outliers of Biological Relevance'
  };

  // Convert full hex to 6chr
  $scope.colourHex = function (hex) {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  };

  $scope.searchDrugs = function (query) {

    return function (drug) {
      if (!query) return true;
      // Rever to false return
      var result = false;

      // Gene Name
      if (drug.gene.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

      // LOH region
      if (drug.lohRegion.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

      // Drug Name
      if (drug.drugOptions.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

      return result;
    };
  };

  // Sort outliers into categories
  var processExpression = function processExpression(input, type) {

    var expressions = {
      clinical: [],
      nostic: [],
      biological: []
    };

    var typekey = 'outlier';
    if (type === 'outlier') typekey = 'outlierType';
    if (type === 'protein') typekey = 'proteinType';

    // Run over mutations and group
    _.forEach(input, function (row, k) {
      if (!(row[typekey] in expressions)) expressions[row[typekey]] = [];
      // Add to type
      expressions[row[typekey]].push(row);
    });

    // Set Small Mutations

    if (type === 'outlier') $scope.expOutliers = expressions;
    if (type === 'protein') $scope.expProtein = expressions;
  };

  processExpression(outliers, 'outlier');
  processExpression(protein, 'protein');
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.expressionAnalysis', ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'ms', 'outliers', 'drugTargets', 'densityGraphs', function (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, ms, outliers, drugTargets, densityGraphs) {

  // Load Images into template
  $scope.pog = pog;
  $scope.report = report;

  $scope.expOutliers = {};
  $scope.drugTargets = drugTargets;
  $scope.densityGraphs = _.chunk(_.values(densityGraphs), 2);

  $scope.expSummaryMap = {
    clinical: 'Expression Level Outliers of Potential Clinical Relevance',
    nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
    biological: 'Expression Level Outliers of Biological Relevance'
  };

  $scope.mRNAOutliersMap = {
    upreg_onco: 'Up-Regulated Oncogenes',
    downreg_tsg: 'Down-Regulated Tumour Suppressor Genes'
  };
  // Convert full hex to 6chr
  $scope.colourHex = function (hex) {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  };

  $scope.getPtxComparator = function () {

    if (outliers.length === 0) return { comparator: 'N/A', sumSamples: 0 };

    var comparator = outliers[0].ptxPercCol ? outliers[0].ptxPercCol.substring(outliers[0].ptxPercCol.lastIndexOf("PTX_POG_") + 8, outliers[0].ptxPercCol.lastIndexOf("_percentile")) : "N/A";

    return comparator;
  };

  $scope.searchDrugs = function (query) {

    return function (drug) {
      if (!query) return true;
      // Rever to false return
      var result = false;

      // Gene Name
      if (drug.gene.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

      // LOH region
      if (drug.lohRegion.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

      // Drug Name
      if (drug.drugOptions.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

      return result;
    };
  };

  // Sort outliers into categories
  var processExpression = function processExpression(input, type) {

    var expressions = {
      clinical: [],
      nostic: [],
      biological: [],
      upreg_onco: [],
      downreg_tsg: []
    };

    var typekey = 'outlierType';
    if (type === 'outlier') typekey = 'outlierType';

    // Run over mutations and group
    _.forEach(input, function (row, k) {
      if (!(row[typekey] in expressions)) expressions[row[typekey]] = [];
      // Add to type
      expressions[row[typekey]].push(row);
    });

    $scope.expOutliers = expressions;
  };

  var processGraphs = function processGraphs() {

    var graphs = {};

    _.forEach(densityGraphs, function (graph) {
      var gene = graph.filename.split('.')[0];
      graphs[gene] = graph;
    });

    $scope.densityGraphs = graphs;
  };

  processGraphs();
  processExpression(outliers, 'outlier');
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.discussion', ['_', '$q', '$scope', 'pog', 'report', '$mdDialog', '$mdToast', 'api.presentation', 'discussions', 'user', function (_, $q, $scope, pog, report, $mdDialog, $mdToast, $presentation, discussions, user) {

  $scope.pog = pog;
  $scope.report = report;
  $scope.discussions = discussions;
  $scope.new = { body: null };
  $scope.user = user;

  $scope.add = function (f) {

    console.log($scope.new);

    var data = {
      body: $scope.new.body
    };

    $presentation.discussion.create(pog.POGID, report.ident, data).then(function (result) {
      $scope.discussions.push(result);
      $scope.new.body = null;
    }).catch(function (e) {
      $mdToast.showSimple('Unable to add new discussion entry');
    });
  };
}]);
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

app.controller('controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit', ['_', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.pubmed', 'api.kb.associations', 'api.knowledgebase', 'api.user', '$interval', '$timeout', 'gene', 'rowEvent', 'samples', 'api.detailedGenomicAnalysis.alterations', 'pog', 'report', function (_, scope, $mdDialog, $mdToast, $complete, $pubmed, $kbAssoc, $kb, $user, $interval, $timeout, gene, rowEvent, samples, $dgaAPC, pog, report) {
  var _scope$kb;

  scope.gene = angular.copy(gene);
  scope.samples = samples;
  scope.formAction = rowEvent == 'update' ? 'Update' : 'Create';
  scope.$alterations = $complete.get('alterations');
  scope.disableRefTitle = false;
  scope.reference = {};
  scope.pog = pog;

  scope.requiredNew = !(rowEvent === 'new'); // For tagging ng-required on values that are optional for newly created entries.

  scope.stages = [{ title: 'Report Details', description: 'Details that appear in the report', id: "report" }, { title: 'Reference Details', description: 'Specifics about the source', id: "reference" }, { title: 'Knowledgebase Entry', description: 'KB database column values', id: "kb" }];
  var activeStage = scope.activeStage = 0;

  scope.$knowledgebase = $complete.get('knowledgebase');
  scope.kb = (_scope$kb = {
    context: null,
    events_expression: rowEvent === 'create' ? null : gene.kb_event_key,
    type: null,
    relevance: null
  }, _defineProperty(_scope$kb, 'context', null), _defineProperty(_scope$kb, 'disease_list', null), _defineProperty(_scope$kb, 'evidence', null), _defineProperty(_scope$kb, 'id_type', null), _defineProperty(_scope$kb, 'id', null), _defineProperty(_scope$kb, 'id_title', null), _defineProperty(_scope$kb, 'status', 'new'), _defineProperty(_scope$kb, 'summary', null), _defineProperty(_scope$kb, 'update_comments', null), _defineProperty(_scope$kb, 'comments', null), _defineProperty(_scope$kb, 'user', $user._me.username), _scope$kb);

  scope.events = {
    valid: false,
    dirty: true,
    pristine: true
  };

  scope.lastStage = function () {
    scope.activeStage--;
  };
  scope.nextStage = function () {
    var form = void 0;
    // Try to trigger submit...
    switch (scope.activeStage) {
      case 0:
        form = scope.reportForm;
        break;
      case 1:
        form = scope.referenceForm;
        break;
      case 2:
        form = scope.kbForm;
        break;
    }

    form.$setSubmitted();
    if (form.$valid) {
      scope.activeStage++;
    }
    if (!form.$valid) $mdToast.show($mdToast.simple({ textContent: 'Please check all the fields for errors' }));
  };

  scope.submit = function () {
    scope.kbForm.$setSubmitted();

    if (!scope.kbForm.$valid) $mdToast.show($mdToast.simple({ textContent: 'Please check all the fields for errors' }));

    // All are valid
    if (scope.kbForm.$valid) {

      // Remove gene children element from controller element
      delete scope.gene.children;

      scope.gene.kb_data = scope.kb;
      scope.gene.kb_data.id = scope.reference.type;
      scope.gene.kb_data.id_type = scope.gene.reference;
      scope.gene.kb_data.id_title = scope.reference.title;
      scope.gene.kb_data.evidence = scope.gene.evidence;
      scope.gene.kb_data.update_comments = scope.gene.comment;
      scope.gene.kb_data.summary = scope.reference.summary;

      console.log('submitting gene entry', scope.gene);
      // Send updated entry to API
      if (rowEvent === 'new') {
        $dgaAPC.one(scope.pog.POGID, report.ident, gene.ident).create(scope.gene).then(function (result) {
          $mdDialog.hide('Entry has been updated');
        }, function (error) {
          alert('System Error - Unable to update. See console');
          console.log(error);
        });
      } else {
        $dgaAPC.one(scope.pog.POGID, report.ident, gene.ident).update(scope.gene).then(function (result) {
          $mdDialog.hide('Entry has been updated');
        }, function (error) {
          alert('System Error - Unable to update. See console');
          console.log(error);
        });
      }
    }
  };

  // Watch Values and Build KB Entries
  scope.$watchGroup(['gene.variant_type', 'gene.gene', 'gene.kbVariant', 'gene.alterationType', 'gene.therapeuticContext', 'gene.disease', 'gene.evidence', 'gene.association'], function (newVals, oldVals) {

    scope.kb.events_expression = newVals[0] + '_' + newVals[1] + ':' + newVals[2];

    scope.kb.type = newVals[3];
    scope.kb.context = newVals[4];
    scope.kb.disease_list = newVals[5];
    scope.kb.evidence = newVals[6];
    scope.kb.relevance = newVals[7];
  });

  // Close Dialog
  scope.cancel = function () {
    $mdDialog.cancel('No changes have been made.');
  };

  // Filter Auto-compelte for relevances
  scope.findRelevance = function (searchText) {
    return searchText ? scope.$alterations.association.filter(filterFunction(searchText)) : scope.$alterations.association;
  };

  // Filter Auto-compelte for relevances
  scope.findDisease = function (searchText) {
    return searchText ? scope.$alterations.disease.filter(filterFunction(searchText)) : scope.$alterations.disease;
  };

  // Autocomplete Filter
  var filterFunction = function filterFunction(query) {

    var lowerCaseQuery = angular.lowercase(query); // Prep input to lowercase

    // Return search function
    return function (entry) {
      return entry.indexOf(lowerCaseQuery) > -1;
    };
  };

  // Gene association
  scope.$watch('gene.association', function (newVal, oldVal) {

    var kbLookup = $kbAssoc.association(newVal);
    console.log('KBLookup result', kbLookup);
    if (kbLookup) {
      if (kbLookup == '*') {
        // Release Relevance Lock
        scope.relevanceLock = false;
        scope.gene.alterationType = null;
        return;
      }
      // Maintain Relevance Lock
      scope.relevanceLock = true;
      scope.gene.alterationType = kbLookup;
    }
    // No match found
    if (kbLookup === false) {
      scope.relevanceLock = false;
      scope.gene.alterationType = null;
      return;
    }
  });

  // Check for pubmed entry if set
  scope.checkPMID = function () {

    // Disable loading bar
    scope.refLoading = false;

    if (scope.gene.reference === '' || scope.gene.reference === undefined || scope.gene.reference.length === 0) {
      scope.disableRefTitle = false;
      scope.reference.title = "";
      scope.reference.type = 'other';
      return;
    }

    // Define PubMed ID
    var pmid = void 0;

    // Is this a PMID?
    if (!scope.gene.reference.match(/^[0-9]{5,8}(\#?)/)) {
      scope.disableRefTitle = false;
      scope.reference.title = "";
      scope.reference.type = 'other';
      return;
    }

    pmid = scope.gene.reference.match(/^[0-9]{5,8}/)[0];

    // Show reference loading bar
    scope.refLoading = true;

    // Get PMID and process
    $pubmed.article(pmid).then(function (article) {
      scope.disableRefTitle = true;
      scope.reference.title = article.title;
      scope.reference.type = 'pubmed';
      scope.refLoading = false;
    }, function (err) {
      console.log('Unable to retrieve PubMed Article: ', err);
    });
  };

  // When the modal opens, watch for the events-expression value to load and validate it.
  scope.$watch('kb.events_expression', function (newval, oldval) {

    // Are we transitioning from an empty form to a prefilled?
    if ((oldval === undefined || oldval === null) && newval !== undefined && newval !== null) {
      scope.validateKBEvents();
    } else {
      // If not, are we just looking at a normal typing change?
      if (scope.events.pristine) scope.validateKBEvents();
    }

    // If the previous value was null/undefined, mark as no longer pristine.
    if (newval !== null && newval !== undefined) scope.events.pristine = false;
  });

  // Validate KB Events string
  scope.validateKBEvents = function () {
    scope.events.dirty = true;
    scope.events.valid = false;

    // Try to validate
    $kb.validate.events(scope.kb.events_expression).then(function (result) {
      scope.events.dirty = false;
      scope.events.valid = true;
    }, function (err) {
      scope.events.dirty = false;
      scope.events.valid = false;
    });
  };

  // Trigger Pubmed Check
  scope.checkPMID();
}]); // End controller
'use strict';

app.controller('controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations', ['_', '$scope', '$mdDialog', '$mdToast', 'alterations', function (_, $scope, $mdDialog, $mdToast, $alterations) {

  console.log('Loaded Genomic/DGA/APC controller!');

  var pog = 'POG129';
  $scope.pog = pog;
  $scope.genes = {};

  $scope.alterationUpdate = function ($event, gene) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/reports/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
      locals: {
        pog: pog,
        gene: gene
      },
      clickOutToClose: false,
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit'
    }).then(function (outcome) {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome));
    }, function (error) {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  };

  alterations.forEach(function (row) {

    // Check if it exists already?
    if (!(row.gene + '-' + row.variant in $scope.genes)) {
      row.children = [];
      return $scope.genes[row.gene + '-' + row.variant] = row;
    }

    if (row.gene + '-' + row.variant in $scope.genes) {
      return $scope.genes[row.gene + '-' + row.variant].children[$scope.genes[row.gene + '-' + row.variant].children.length] = row;
    }
  });
}]);
'use strict';

app.controller('controller.dashboard.report.genomic.slide', ['_', '$q', '$scope', 'pog', 'report', '$mdDialog', '$mdToast', 'api.presentation', 'slides', 'FileUploader', 'api.session', function (_, $q, $scope, pog, report, $mdDialog, $mdToast, $presentation, slides, FileUploader, $session) {

  $scope.pog = pog;
  $scope.report = report;
  $scope.slides = slides;
  $scope.new = { name: "" };

  $scope.add_step = 'select';
  $scope.progress = 0;
  $scope.filename = "";

  // Remove a slide entry
  $scope.remove = function (slide) {

    var confirm = $mdDialog.confirm().title('Confirm Remove').textContent('Are you sure you want to remove this slide?').ok('Yes').cancel('Cancel');

    $mdDialog.show(confirm).then(function (result) {
      $presentation.slide.remove(pog.POGID, report.ident, slide.ident).then(function (result) {
        $scope.slides.splice(_.findKey($scope.slides, { ident: slide.ident }), 1);
      }).catch(function (e) {
        $mdToast.showSimple('Failed to remove the slide due to an internal server error');
      });
    }).catch(function (e) {
      $mdToast.showSimple('No changes made');
    });
  };

  var allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg'];

  // Cancel Dialog
  $scope.cancel = function () {
    $mdDialog.cancel('Canceled Edit - No changes made.');
  };

  var selectedItem = null;
  var uploader = {};

  var setupUploader = function setupUploader() {
    var u = $scope.uploader = new FileUploader({
      url: CONFIG.ENDPOINTS.API + '/POG/' + pog.POGID + '/report/' + report.ident + '/genomic/presentation/slide'
    });

    u.headers['Authorization'] = $session.getToken();
    u.method = 'POST';
    u.alias = "file"; // Name of the file in the POST

    selectedItem = null;

    $scope.progress = 0;

    return u;
  };

  uploader = setupUploader();

  // Sync filter
  uploader.filters.push({
    name: 'syncFilter',
    fn: function fn(item, options) {

      uploader.formData = [{ name: $scope.new.name }];
      if (allowedImageFormats.indexOf(item.type) === -1) {
        $mdToast.showSimple('Invalid file format provided. Must be an image of type: ' + _.join(allowedImageFormats, ', '));
        return false;
      }
      return true;
    }
  });

  uploader.onErrorItem = function (fileItem, response, status, headers) {
    console.info('onErrorItem', fileItem, response, status, headers);
    $mdToast.showSimple('Unable to upload the file: ' + response.message);
  };

  // Kick off upload
  uploader.onAfterAddingFile = function (fileItem) {
    $scope.filename = fileItem.file.name;
    selectedItem = fileItem;

    $scope.add_step = "upload"; // Now in the uploading action
  };

  uploader.onProgressItem = function (fileItem, progress) {
    $scope.progress = progress;
  };

  // Initiate Upload
  $scope.initiateUpload = function () {
    $scope.startedUpload = true;

    uploader.alias = "file"; // Name of the file in the POST
    uploader.formData = [{ name: $scope.new.name }];
    uploader.uploadItem(selectedItem);
  };

  // Only allow 1 upload. When Finished
  uploader.onCompleteItem = function (fileItem, response, status, headers) {
    // Add to tabs and notify user of great success
    $mdToast.showSimple('The slide was successfully uploaded');
    $scope.slides.push(response);
    $scope.new.name = "";
    $scope.add_step = 'select';

    // Cleanup
    uploader.clearQueue();
    selectedItem = null;
    $scope.progress = 0;
  };
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.analystComments', ['_', '$scope', '$sce', 'pog', 'report', 'comments', 'api.summary.analystComments', function (_, $scope, $sce, pog, report, comments, $comments) {

  // Data
  $scope.comments = comments;
  $scope.report = report;
  $scope.pog = pog;
  $scope.analystParagraphs = [];

  var rawParagraphs = comments ? comments.comments.replace("<p>", "").split("</p>") : ["<h1> Draft Report</h1>", "No comments yet."];

  _.forEach(rawParagraphs, function (p) {
    if (p.length > 0) $scope.analystParagraphs.push($sce.trustAsHtml(p));
  });
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.appendices', ['_', '$scope', 'pog', 'report', 'tcgaAcronyms', function (_, $scope, pog, report, tcgaAcronyms) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.tcgaAcronyms = tcgaAcronyms;

  $scope.config = report.config.split("\n");
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.copyNumberAnalysis', ['_', '$scope', '$sce', 'pog', 'report', 'images', 'cnvs', 'ms', function (_, $scope, $sce, pog, report, images, cnvs, ms) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.ms = ms;
  $scope.images = images;
  $scope.cnvGroups = {};

  var processCNV = function processCNV(cnvs) {

    var container = {
      clinical: [],
      nostic: [],
      biological: [],
      commonAmplified: [],
      homodTumourSupress: [],
      highlyExpOncoGain: [],
      lowlyExpTSloss: []
    };

    // Run over mutations and group
    _.forEach(cnvs, function (row, k) {
      if (!(row.cnvVariant in container)) container[row.cnvVariant] = [];
      // Add to type
      container[row.cnvVariant].push(row);
    });

    // Set Small Mutations
    $scope.cnvGroups = container;
  };

  processCNV(cnvs);

  $scope.titleMap = {
    clinical: 'CNVs of Potential Clinical Relevance',
    nostic: 'CNVs of Prognostic or Diagnostic Relevance',
    biological: 'CNVs of Biological Relevance',
    commonAmplified: 'Commonly Amplified Oncogenes with Copy Gains',
    homodTumourSupress: 'Homozygously Deleted Tumour Suppresors',
    highlyExpOncoGain: 'Highly Expressed Oncogenes with Copy Gains',
    lowlyExpTSloss: 'Lowly Expressed Tumour Suppressors with Copy Losses'
  };
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.copyNumberAnalysisCNVLOH', ['_', '$scope', '$sce', 'pog', 'report', 'images', function (_, $scope, $sce, pog, report, images) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.dga', ['_', '$scope', 'pog', 'report', 'alterations', 'approvedThisCancer', 'approvedOtherCancer', 'targetedGenes', 'unknownAlterations', function (_, $scope, pog, report, alterations, approvedThisCancer, approvedOtherCancer, targetedGenes, unknownAlterations) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.samples = [];
  $scope.alterations = { therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: {} };
  $scope.approvedThisCancer = {};
  $scope.approvedOtherCancer = {};
  $scope.targetedGenes = targetedGenes;

  alterations = alterations.concat(unknownAlterations);

  // Group Alterations by type
  var groupAlterations = function groupAlterations(collection, alterations) {

    alterations.forEach(function (row) {

      // Modify type

      // Does grouping exist?
      if (!(row.gene + '-' + row.variant in collection)) {
        row.children = [];
        return collection[row.gene + '-' + row.variant] = row; // Add row to collection
      }

      if (row.gene + '-' + row.variant in collection) return collection[row.gene + '-' + row.variant].children.push(row);
    });

    return _.values(collection);
  };

  // Group Entries by Type
  var groupEntries = function groupEntries(alterations) {
    // Process the entries for grouping
    alterations.forEach(function (row) {

      // Add to samples if not present
      if ($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);

      // Grouping
      if (!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};

      // Check if it exists already?
      if (!(row.gene + '-' + row.variant in $scope.alterations[row.alterationType])) {
        row.children = [];
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant] = row;
      }

      // Categorical entry already exists
      if (row.gene + '-' + row.variant in $scope.alterations[row.alterationType]) {
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant].children[$scope.alterations[row.alterationType][row.gene + '-' + row.variant].children.length] = row;
      }
    });

    _.forEach($scope.alterations, function (values, k) {
      $scope.alterations[k] = _.values(values);
      //console.log('Iteree: ', k, values, _.values(values));
    });
  };

  // Group Entries
  groupEntries(alterations);

  // Group Approved
  $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
  $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.diseaseSpecificAnalysis', ['_', '$scope', '$sce', 'pog', 'report', 'images', 'subtypePlotImages', function (_, $scope, $sce, pog, report, images, subtypePlotImages) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.subtypePlotImages = subtypePlotImages;
  $scope.hasSubtypePlot = !(Object.keys(subtypePlotImages).length === 0);
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.expressionAnalysis', ['_', '$scope', '$sce', 'pog', 'report', 'images', 'outliers', 'drugTargets', 'densityGraphs', function (_, $scope, $sce, pog, report, images, outliers, drugTargets, densityGraphs) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.drugTargets = drugTargets;
  $scope.densityGraphs = [];
  $scope.expOutliers = {};

  // Convert full hex to 6chr
  $scope.colourHex = function (hex) {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  };

  $scope.titleMap = {
    clinical: 'Expression Level Outliers of Potential Clinical Relevance',
    nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
    biological: 'Expression Level Outliers of Biological Relevance',
    upreg_onco: 'Up-Regulated Oncogenes',
    downreg_tsg: 'Down-Regulated Tumour Suppressor Genes'
  };

  // Sort outliers into categories
  var processExpression = function processExpression(input, type) {

    var expressions = {
      clinical: [],
      nostic: [],
      biological: [],
      upreg_onco: [],
      downreg_tsg: []
    };

    var typekey = 'outlierType';
    if (type === 'outlier') typekey = 'outlierType';

    // Run over mutations and group
    _.forEach(input, function (row, k) {
      if (!(row[typekey] in expressions)) expressions[row[typekey]] = [];
      // Add to type
      expressions[row[typekey]].push(row);
    });

    $scope.expOutliers = expressions;
  };

  processExpression(outliers, 'outlier');

  var i = 0;

  var arrayGraphs = [];
  _.forEach(densityGraphs, function (g) {
    arrayGraphs.push(g);
  });

  while (i < arrayGraphs.length) {

    $scope.densityGraphs.push([arrayGraphs[i], arrayGraphs[i + 1]]);
    i = i + 2;
  }
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.pathwayAnalysis', ['_', '$scope', '$timeout', 'pog', 'report', 'pathway', function (_, $scope, $timeout, pog, report, pathway) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.pathwayAnalysis = pathway;

  var processSVG = function processSVG(svg) {

    // Get container div
    var svgImage = document.getElementById('svgImage');

    if (svgImage.innerHTML.length > 0) {
      // Destroy so we can build it bigger, faster, better than before!
      svgImage.innerHTML = '';
    }

    // Create SVG DOM element from String
    $scope.pathway = new DOMParser().parseFromString(svg, 'application/xml');

    // Extract SVG element from within XML wrapper.
    var xmlSVG = $scope.pathway.getElementsByTagName('svg')[0];
    xmlSVG.id = "pathway"; // Set ID that we can grapple.
    xmlSVG.style = 'width: 100%; height: 800px;'; // Set width & height TODO: Make responsive

    // Create PanZoom object
    var panZoom = {};

    // Load in SVG after slight delay. (otherwise xmlSVG processing isn't ready.
    // TODO: Use promises to clean this up.
    setTimeout(function () {
      svgImage = document.getElementById('svgImage');

      svgImage.appendChild(svgImage.ownerDocument.importNode($scope.pathway.documentElement, true));
      var panZoom = svgPanZoom('#pathway', {
        preventMouseEventsDefault: true,
        enableControlIcons: false,
        controlIconsEnabled: false
      });
      panZoom.resize();
      panZoom.fit();
      panZoom.center();
      panZoom.disablePan();
      panZoom.disableMouseWheelZoom();
      panZoom.disableZoom();
      panZoom.disableDblClickZoom();
    }, 100);
  };

  $timeout(function () {
    if (pathway !== null) processSVG(pathway.pathway);
    if (pathway === null) processSVG('<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="0" y="0" fill="rgb(210,210,210)">Pathway not yet analyzed.</text></svg>');
  }, 500);
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.slide', ['_', '$scope', 'pog', 'report', 'slides', function (_, $scope, pog, report, slides) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.slides = slides;
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.somaticMutations', ['_', '$scope', '$sce', 'pog', 'report', 'images', 'ms', 'smallMutations', 'mutationSignature', 'mutationSummaryImages', function (_, $scope, $sce, pog, report, images, ms, smallMutations, mutationSignature, mutationSummaryImages) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.smallMutations = {};
  $scope.mutationSignature = [];
  $scope.nnlsNormal = false;
  $scope.ms = null;

  $scope.copyFilter = function (copyChange) {
    return copyChange.match(/(((\+|\-)?)[0-9]{1,2})/g)[0];
  };

  var processSignature = function processSignature(sigs) {
    $scope.mutationSignature = [];
    var nnlsMax = $scope.nnlsNormal ? 0 : 1;

    _.forEach(sigs, function (r, k) {
      if (r.nnls > nnlsMax) nnlsMax = r.nnls;
    });

    _.forEach(sigs, function (r, k) {

      // Round to 3 sigfigs
      r.pearson = r.pearson.toFixed(3);
      r.nnls = r.nnls.toFixed(3);

      // Produced rounded numbers
      r.pearsonColour = Math.round((r.pearson < 0 ? 0 : r.pearson) * 100 / 5) * 5;
      r.nnlsColour = Math.round(r.nnls / nnlsMax * 100 / 5) * 5;

      $scope.mutationSignature.push(r);
    });
  };

  var processMutations = function processMutations(muts) {

    var mutations = {
      clinical: [],
      nostic: [],
      biological: [],
      unknown: []
    };

    // Run over mutations and group
    _.forEach(muts, function (row, k) {
      if (!(row.mutationType in mutations)) mutations[row.mutationType] = [];
      // Add to type
      mutations[row.mutationType].push(row);
    });

    // Set Small Mutations
    $scope.smallMutations = mutations;
  };

  var pickCompatator = function pickCompatator() {
    var search = _.find(ms, { comparator: report.tumourAnalysis.diseaseExpressionComparator });

    if (!search) search = _.find(ms, { comparator: 'average' });

    $scope.ms = search;
  };

  var processMutationSummaryImages = function processMutationSummaryImages(images) {

    var ssorted = {
      barplot: {
        indel: [],
        snv: [],
        sv: []
      },
      densityPlot: {
        indel: [],
        snv: [],
        sv: []
      },
      legend: {
        indel_snv: [],
        sv: []
      }
    };

    var sorted = {
      comparators: [],
      indel: {
        barplot: [],
        densityPlot: []
      },
      snv: {
        barplot: [],
        densityPlot: []
      },
      sv: {
        barplot: [],
        densityPlot: []
      },
      legend: {
        snv_indel: [],
        sv: null
      }
    };

    _.forEach(images, function (img) {

      var pieces = img.key.split('.');
      img.comparator = pieces[2] || null;
      if (!img.comparator) img.comparator = report.tumourAnalysis.diseaseExpressionComparator; // If no comparator found in image, likely legacy and use report setting.

      if (img.comparator && !_.find(sorted.comparators, { name: img.comparator })) sorted.comparators.push({ name: img.comparator, visible: false });

      if (pieces[1].indexOf('barplot_indel') > -1) sorted.indel.barplot.push(img);
      if (pieces[1].indexOf('barplot_snv') > -1) sorted.snv.barplot.push(img);
      if (pieces[1].indexOf('barplot_sv') > -1) sorted.sv.barplot.push(img);

      if (pieces[1].indexOf('density_plot_indel') > -1) sorted.indel.densityPlot.push(img);
      if (pieces[1].indexOf('density_plot_snv') > -1) sorted.snv.densityPlot.push(img);
      if (pieces[1].indexOf('density_plot_sv') > -1) sorted.sv.densityPlot.push(img);

      if (pieces[1].indexOf('legend_snv_indel') > -1) sorted.legend.snv_indel.push(img);
      if (pieces[1].indexOf('legend_sv') > -1) sorted.legend.sv = img;
    });

    $scope.mutationSummaryImages = sorted;
  };

  /**
   * Retrieve specific mutation summary image
   *
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   *
   * @returns
   */
  $scope.getMutationSummaryImage = function (graph, type) {
    var comparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    return _.find($scope.mutationSummaryImages[type][graph], { comparator: comparator });
  };

  processMutationSummaryImages(mutationSummaryImages);
  processMutations(smallMutations);
  pickCompatator();

  processMutations(smallMutations);
  processSignature(angular.copy(mutationSignature));
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.structuralVariants', ['_', '$scope', '$sce', 'pog', 'report', 'images', 'ms', 'svs', 'mutationSummaryImages', function (_, $scope, $sce, pog, report, images, ms, svs, mutationSummaryImages) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.ms = ms;
  $scope.allVariants = [];

  $scope.titleMap = {
    clinical: 'Gene Fusions of Potential Clinical Relevance with Genome & Transcriptome Support',
    nostic: 'Gene Fusions of Prognostic and Diagnostic Relevance',
    biological: 'Gene Fusions with Biological Relevance',
    fusionOmicSupport: 'Gene Fusions with Genome and Transcriptome Support'
  };

  var processSvs = function processSvs(structVars) {

    var svs = {
      clinical: [],
      nostic: [],
      biological: [],
      fusionOmicSupport: []
    };

    // Run over mutations and group
    _.forEach(structVars, function (row, k) {
      if (!(row.svVariant in svs)) svs[row.svVariant] = [];
      row.breakpoint = _.join(row.breakpoint.split('|'), '| ');
      // Add to type
      svs[row.svVariant].push(row);

      row.svg = $sce.trustAsHtml(row.svg);
      $scope.allVariants.push(row);
    });

    // Set Small Mutations
    $scope.StrucVars = svs;
  };

  var pickCompatator = function pickCompatator() {
    var search = _.find(ms, { comparator: report.tumourAnalysis.diseaseExpressionComparator });

    if (!search) search = _.find(ms, { comparator: 'average' });

    $scope.ms = search;
  };

  var processMutationSummaryImages = function processMutationSummaryImages(images) {

    var ssorted = {
      barplot: {
        indel: [],
        snv: [],
        sv: []
      },
      densityPlot: {
        indel: [],
        snv: [],
        sv: []
      },
      legend: {
        indel_snv: [],
        sv: []
      }
    };

    var sorted = {
      comparators: [],
      indel: {
        barplot: [],
        densityPlot: []
      },
      snv: {
        barplot: [],
        densityPlot: []
      },
      sv: {
        barplot: [],
        densityPlot: []
      },
      legend: {
        snv_indel: [],
        sv: null
      }
    };

    _.forEach(images, function (img) {

      var pieces = img.key.split('.');
      img.comparator = pieces[2] || null;
      if (!img.comparator) img.comparator = report.tumourAnalysis.diseaseExpressionComparator; // If no comparator found in image, likely legacy and use report setting.

      if (img.comparator && !_.find(sorted.comparators, { name: img.comparator })) sorted.comparators.push({ name: img.comparator, visible: false });

      if (pieces[1].indexOf('barplot_indel') > -1) sorted.indel.barplot.push(img);
      if (pieces[1].indexOf('barplot_snv') > -1) sorted.snv.barplot.push(img);

      if (pieces[1].indexOf('barplot_sv') > -1) sorted.sv.barplot.push(img);

      if (pieces[1].indexOf('density_plot_indel') > -1) sorted.indel.densityPlot.push(img);
      if (pieces[1].indexOf('density_plot_snv') > -1) sorted.snv.densityPlot.push(img);

      if (pieces[1].indexOf('density_plot_sv') > -1) sorted.sv.densityPlot.push(img);

      if (pieces[1].indexOf('legend_snv_indel') > -1) sorted.legend.snv_indel.push(img);
      if (pieces[1].indexOf('legend_sv') > -1) sorted.legend.sv = img;
    });

    $scope.mutationSummaryImages = sorted;
  };

  /**
   * Retrieve specific mutation summary image
   *
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   *
   * @returns
   */
  $scope.getMutationSummaryImage = function (graph, type) {
    var comparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    return _.find($scope.mutationSummaryImages[type][graph], { comparator: comparator });
  };

  processSvs(svs);
  pickCompatator();
  processMutationSummaryImages(mutationSummaryImages);
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.summary', ['_', '$scope', 'pog', 'report', 'gai', 'get', 'ms', 'vc', 'pt', function (_, $scope, pog, report, gai, get, ms, vc, pt) {

  // Data
  $scope.data = { gai: gai, ms: ms, vc: vc, pt: pt, pi: report.patientInformation, ta: report.tumourAnalysis };

  $scope.data.get = [];
  $scope.data.get = get;
  $scope.report = report;
  $scope.pog = pog;

  var variantCategory = function variantCategory(variant) {
    var cnvs = ['copy gain', 'copy loss', 'amplification', 'Homozygous Loss', 'Homozygous Gain'];

    // Small Mutations
    if (variant.geneVariant.match(/([A-z0-9]*)\s(\(\p\.[A-z]*[0-9]*[A-z_0-9]*\*?\))/g)) {
      variant.type = "smallMutation";
      return variant;
    }

    // Structural Variants
    if (variant.geneVariant.match(/([A-z0-9]*\:\:[A-z0-9]*\s\(\e([0-9]*|\?)\:\e([0-9]*|\?)\))/g)) {
      variant.type = "structuralVariant";
      return variant;
    }

    // Expression Outliers
    if (variant.geneVariant.toLowerCase().indexOf('expression') !== -1) {
      variant.type = "expressionOutlier";
      return variant;
    }

    // Return CNV mutation
    variant.type = "cnv";
    return variant;
  };

  // Process variants and create chunks
  var processVariants = function processVariants(variants) {

    var output = [];

    // Reset counts
    $scope.variantCounts = { cnv: 0, smallMutation: 0, expressionOutlier: 0, structuralVariant: 0 };

    variants.forEach(function (variant, k) {
      // Add processed Variant
      output.push(variantCategory(variant));

      // Update counts
      if (!$scope.variantCounts[gai[k].type]) $scope.variantCounts[gai[k].type] = 0;
      $scope.variantCounts[gai[k].type]++;
    });

    return output;
  };
  $scope.geneVariants = processVariants(gai);

  $scope.mutationBurdenFilter = function (input) {
    return input == "nan [nan]" ? 'na' : input.replace(/\[[0-9]*\]/g, '');
  };
}]);
'use strict';

app.controller('controller.print.POG.report.genomic.therapeuticOptions', ['_', '$scope', '$sce', 'pog', 'report', 'therapeutic', function (_, $scope, $sce, pog, report, therapeutic) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.therapeutic = { therapeutic: [], chemoresistance: [] };

  // Sort into groups
  var groupTherapeutics = function groupTherapeutics() {
    _.forEach(therapeutic, function (v) {
      if (v.type === 'therapeutic') $scope.therapeutic.therapeutic.push(v);
      if (v.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(v);
    });
  };

  groupTherapeutics();
}]);
'use strict';

app.controller('controller.print.POG.report.probe.alterations', ['_', '$scope', 'pog', 'report', 'alterations', 'approvedThisCancer', 'approvedOtherCancer', function (_, $scope, pog, report, alterations, approvedThisCancer, approvedOtherCancer) {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.samples = [];
  $scope.alterations = { therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: {} };
  $scope.approvedThisCancer = {};
  $scope.approvedOtherCancer = {};

  // Group Alterations by type
  var groupAlterations = function groupAlterations(collection, alterations) {

    alterations.forEach(function (row) {

      // Modify type

      // Does grouping exist?
      if (!(row.gene + '-' + row.variant in collection)) {
        row.children = [];
        return collection[row.gene + '-' + row.variant] = row; // Add row to collection
      }

      if (row.gene + '-' + row.variant in collection) return collection[row.gene + '-' + row.variant].children.push(row);
    });

    return _.values(collection);
  };

  // Group Entries by Type
  var groupEntries = function groupEntries(alterations) {
    // Process the entries for grouping
    alterations.forEach(function (row) {

      // Add to samples if not present
      if ($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);

      // Grouping
      if (!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};

      // Check if it exists already?
      if (!(row.gene + '-' + row.variant in $scope.alterations[row.alterationType])) {
        row.children = [];
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant] = row;
      }

      // Categorical entry already exists
      if (row.gene + '-' + row.variant in $scope.alterations[row.alterationType]) {
        return $scope.alterations[row.alterationType][row.gene + '-' + row.variant].children[$scope.alterations[row.alterationType][row.gene + '-' + row.variant].children.length] = row;
      }
    });

    _.forEach($scope.alterations, function (values, k) {
      $scope.alterations[k] = _.values(values);
      //console.log('Iteree: ', k, values, _.values(values));
    });
  };

  // Group Entries
  groupEntries(alterations);

  // Group Approved
  $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
  $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
}]);
'use strict';

app.controller('controller.print.POG.report.probe.appendices', ['_', '$scope', 'pog', 'report', function (_, $scope, pog, report) {

  $scope.report = report;
  $scope.pog = pog;
  $scope.config = report.config.split("\n");
}]);
'use strict';

app.controller('controller.print.POG.report.probe.summary', ['_', '$scope', 'pog', 'report', 'testInformation', 'genomicEvents', 'metrics', 'signature', function (_, $scope, pog, report, testInformation, genomicEvents, kbmetrics, signature) {

  // Data
  $scope.data = { pi: report.patientInformation, ta: report.tumourAnalysis };

  $scope.report = report;
  $scope.pog = pog;
  $scope.testInformation = testInformation;
  $scope.genomicEvents = genomicEvents;
  $scope.kbmetrics = kbmetrics;
  $scope.signature = signature;

  console.log('KB Metrics', kbmetrics);
}]);
'use strict';

app.controller('controller.dashboard', ['_', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'isAdmin', '$acl', function (_, $scope, $state, $pog, $image, $userSettings, user, isAdmin, $acl) {

  $scope.check = {
    resource: $acl.resource,
    action: $acl.action
  };

  $scope.isAdmin = isAdmin;
  $scope.user = user;
  $scope.$state = $state;

  $scope.maximized = $userSettings.get('sideBarState');
  $scope.toggle = function () {
    $userSettings.save('sideBarState', !$scope.maximized);
    $scope.maximized = !$scope.maximized;
  };
}]);
'use strict';

app.controller('controller.dashboard.toolbar.feedback', ['$q', '_', 'scope', 'api.jira', 'api.user', 'api.session', '$mdDialog', function ($q, _, scope, $jira, $user, $session, $mdDialog) {

  // Close Modal
  scope.cancel = function () {
    $mdDialog.cancel();
  };

  scope.feedback = {};
  scope.state = "form";

  scope.user = {
    username: '',
    password: ''
  };

  scope.login = {
    badCredentials: false,
    submitting: false
  };

  // Send Feedback!
  scope.send = function (f) {

    scope.formSubmitted = true;

    scope.close = function () {
      $mdDialog.hide();
    };

    // Append type to title
    var title = scope.feedback.type + ': ' + scope.feedback.title;

    // Send feedback to jira
    $jira.ticket.create('DEVSU', 'Task', title, scope.feedback.description, { components: [{ name: 'IPR WebApp' }], labels: ['Feedback', scope.feedback.type] }).then(function (res) {
      // Response handled
      scope.state = 'issue';
      scope.ticket = res;
      console.log('JIRA subtask create response: ', res);
    }, function (err) {
      console.log('Unable to send feedback', err);
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.loadPOG', ['_', '$scope', '$mdDialog', 'api.pog', function (_, scope, $mdDialog, $pog) {

  scope.load = { pog: null

    // Close Dialog
  };scope.cancel = function () {
    $mdDialog.cancel('No changes have been made.');
  };

  // Update the specified entry
  scope.load = function (f) {

    // Check for valid inputs by touching each entry
    if (f.$invalid) {
      f.$setDirty();
      angular.forEach(f.$error, function (field) {
        angular.forEach(field, function (errorField) {
          errorField.$setTouched();
        });
      });
      return;
    }

    // Send updated entry to API
    $pog.load(scope.load.pog).then(function (result) {
      $mdDialog.hide('POG has been loaded.');
    }, function (error) {
      alert('Unable to update. See console');
      console.log(error);
    });
  }; // End update
}]); // End controller
'use strict';

app.controller('controller.dashboard.toolbar', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', '$timeout', 'api.session', 'isAdmin', "$userSettings", function (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $timeout, $session, isAdmin, $userSettings) {

  $scope.isAdmin = isAdmin;

  $scope.toggleMenu = function () {
    $mdSidenav('topLevelNavigation').toggle();
  };

  // Open Feedback
  $scope.openFeedback = function ($event) {

    $mdDialog.show({
      controller: 'controller.dashboard.toolbar.feedback',
      templateUrl: 'dashboard/feedback.html',
      targetEvent: $event,
      clickOutsideToClose: false
    }).then(function (res) {
      // Toast!
    }, function (cancel) {
      // Toast!
    });
  };

  $scope.loadNewPog = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/loadPOG.html',
      clickOutToClose: false,
      controller: 'controller.dashboard.loadPOG'
    });
  };

  /**
   * Log out a user session
   *
   */
  $scope.userLogout = function () {

    $session.logout().then(function (resp) {
      // Success from API
      $mdToast.showSimple('You have been logged out.');
      $state.go('public.login');
    }, function (err) {
      $mdToast.showSimple('We were not able to log you out.');
    });
  };
}]);
'use strict';

app.controller('controller.error', ['_', 'api.jira', '$scope', function (_, $jira, $scope) {}]);
'use strict';

app.controller('controller.print', ['_', '$scope', function (_, $scope) {

  $scope.print = true;
}]);
"use strict";
'use strict';

app.controller('controller.dashboard.biopsy', ['$q', '_', '$scope', function ($q, _, $scope) {}]);
'use strict';

app.controller('controller.dashboard.adminbar', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'isAdmin', function (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, isAdmin) {}]);
'use strict';

app.controller('controller.dashboard.home', ['_', '$scope', '$state', function (_, $scope, $state) {

  $state.go('dashboard.reports.dashboard');
}]);
'use strict';

app.controller('controller.dashboard.germline', ['$q', '_', '$scope', function ($q, _, $scope) {}]);
'use strict';

app.controller('controller.dashboard.pog', ['_', '$scope', function (_, $scope) {}]);
'use strict';

app.controller('knowledgebase', ['$q', '$scope', function ($q, $scope) {}]);
'use strict';

app.controller('controller.dashboard.pog.report', ['_', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'report', function (_, $scope, $state, $pog, $image, $userSettings, user, report) {

  $scope.user = user;
  $scope.$state = $state;
  $scope.report = report;

  console.log('Report', report);
}]);
'use strict';

app.controller('controller.dashboard.tracking', ['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', '$mdDialog', '$mdToast', function ($q, _, $scope, $definition, $state, $task, $mdDialog, $mdToast) {}]);
'use strict';

app.controller('controller.public.login', ['$q', '_', '$scope', 'api.session', 'api.user', '$state', '$acl', '$mdToast', function ($q, _, $scope, $session, $user, $state, $acl, $mdToast) {

  $scope.user = {
    username: null,
    password: null
  };

  // Login clicked
  $scope.login = function (f) {
    if (f.$invalid) {
      f.$setDirty();
      angular.forEach(f.$error, function (field) {
        angular.forEach(field, function (errorField) {
          errorField.$setTouched();
        });
      });
      return;
    }

    // Run session login
    $session.login($scope.user.username, $scope.user.password).then($user.me).then(function (result) {
      $acl.injectUser(result);

      if ($acl.inGroup('clinician')) {
        $state.go('dashboard.reports.clinician');
      } else {
        $state.go('dashboard.reports.dashboard');
      }
    }).catch(function (error) {
      if (error.status === 400) return $mdToast.showSimple('Unable to authenticate with the provided credentials');
      console.log('Error result', error);
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.user.groups.edit', ['$q', '_', '$scope', '$mdDialog', 'api.user', 'editGroup', 'newGroup', 'groupDelete', function ($q, _, scope, $mdDialog, $user, editGroup, newGroup, groupDelete) {

  // Load User into scope
  scope.group = editGroup;
  scope.newGroup = newGroup;
  scope.groupDelete = groupDelete;

  // Creating new user
  if (newGroup) {
    scope.group = {
      name: ''
    };
  }

  scope.searchUsers = function (searchText) {
    var deferred = $q.defer();

    if (searchText.length === 0) return [];

    $user.search(searchText).then(function (resp) {
      deferred.resolve(resp);
    }, function (err) {
      console.log(err);
      deferred.reject();
    });

    return deferred.promise;
  };

  scope.searchOwner = function (searchOwnerText) {
    var deferred = $q.defer();

    if (searchOwnerText.length === 0) return [];

    $user.search(searchOwnerText).then(function (resp) {
      deferred.resolve(resp);
    }, function (err) {
      console.log(err);
      deferred.reject();
    });

    return deferred.promise;
  };

  scope.cancel = function () {
    $mdDialog.cancel({ status: false, message: "Could not update this group." });
  };

  scope.addUser = function () {

    if (_.find(scope.group.users, { ident: scope.member.ident })) return alert('This user has already been added to the group');

    // Add user to group
    $user.group.member(scope.group.ident).add(scope.member.ident).then(function (resp) {
      scope.group.users.push(resp);

      scope.member = null;
      scope.searchQuery = '';
    }, function (err) {
      console.log('Unable to add user', err);
    });
  };

  // Remove user from group
  scope.removeUser = function ($event, user) {

    if (confirm('Are you sure you want to remove this ' + user.firstName + ' ' + user.lastName + 'from ' + scope.group.name + '?')) {
      $user.group.member(scope.group.ident).remove(user.ident).then(function (resp) {
        // Remove entry from group list
        scope.group.users = _.filter(scope.group.users, function (u) {
          return u.ident !== user.ident;
        });
      }, function (err) {
        console.log('Unable to remove user from group', err);
      });
    }
  };

  // Validate form and submit
  scope.update = function (f) {
    // Check for valid inputs by touching each entry
    if (f.$invalid) {
      f.$setDirty();
      angular.forEach(f.$error, function (field) {
        angular.forEach(field, function (errorField) {
          errorField.$setTouched();
        });
      });
      return;
    }

    scope.group.owner = scope.group.owner.ident;

    // Send updated user to api
    if (!newGroup) {
      $user.group.update(scope.group.ident, scope.group).then(function (group) {
        // Success
        $mdDialog.hide({ status: true, data: group, message: "The group has been updated!" });
      }, function (err) {
        $mdDialog.cancel({ status: false, message: "Could not update this group." });
      });
    }
    // Send updated user to api
    if (newGroup) {
      $user.group.create(scope.group).then(function (group) {
        // Success
        $mdDialog.hide({ status: true, data: group, message: "The group has been added!", newGroup: true });
      }, function (err) {
        $mdDialog.cancel({ status: false, message: "Could not update this group." });
      });
    }
  };
}]);
'use strict';

app.controller('controller.dashboard.admin.users.groups', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', 'groups', function (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin, groups) {

  $scope.groups = groups;

  var deleteGroup = function deleteGroup($event, group) {

    var confirm = $mdDialog.confirm().title('Are you sure you want to remove ' + group.name + '?').htmlContent('Are you sure you want to remove the group <strong>' + group.name + '</strong>?<br /><br />This will <em>not</em> affect access to any other BC GSC services.').ariaLabel('Remove Group?').targetEvent($event).ok('Remove Group').cancel('Cancel');

    $mdDialog.show(confirm).then(function () {
      var tempGroup = angular.copy(group);
      // Remove User
      $user.group.remove(group).then(function (res) {
        $scope.groups = _.filter($scope.groups, function (g) {
          return g.ident !== tempGroup.ident;
        });
        $mdToast.show($mdToast.simple('The group has been removed'));
      }, function (err) {
        $mdToast.show($mdToast.simple('A technical issue prevented the group from being removed.'));
      });
    });
  };

  // Function to pass into
  var passDelete = function passDelete() {

    $mdDialog.hide(); // Hide any displayed dialog;
    return deleteGroup;
  };

  $scope.groupDiag = function ($event, editGroup) {
    var newGroup = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/group.edit.html',
      clickOutToClose: false,
      locals: {
        editGroup: angular.copy(editGroup),
        newGroup: newGroup,
        groupDelete: passDelete()
      },
      controller: 'controller.dashboard.user.groups.edit'
    }).then(function (resp) {
      $mdToast.show($mdToast.simple().textContent(resp.message));
      _.forEach($scope.groups, function (g, i) {
        if (g.ident === resp.data.ident) $scope.groups[i] = resp.data;
      });

      if (newGroup) {
        $scope.groups.push(resp.data);
        $scope.groups = groups = _.sortBy($scope.groups, 'name');
      }
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('The group has not been updated.'));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.user.edit', ['$q', '_', '$scope', '$mdDialog', 'api.user', 'editUser', 'newUser', 'userDelete', function ($q, _, scope, $mdDialog, $user, editUser, newUser, userDelete) {

  // Load User into scope
  scope.user = editUser;
  scope.newUser = newUser;
  scope.userDelete = userDelete;

  // Creating new user
  if (newUser) {
    scope.user = {
      username: '',
      type: 'bcgsc',
      firstName: '',
      lastName: ''
    };
  }

  // Setup default user fields
  scope.local = {
    newPass: '',
    newPassConfirm: ''
  };

  scope.cancel = function () {
    $mdDialog.cancel({ status: false, message: "Could not update this user." });
  };

  // Validate form and submit
  scope.update = function (f) {
    // Check for valid inputs by touching each entry
    if (f.$invalid) {
      f.$setDirty();
      angular.forEach(f.$error, function (field) {
        angular.forEach(field, function (errorField) {
          errorField.$setTouched();
        });
      });
      return;
    }

    // If type === local create password entry
    if (scope.user.type === 'local' && scope.local.newPass.length > 0) {

      // Check password length
      if (scope.local.newPass !== scope.local.newPassConfirm) {
        f.NewPassConfirm.$error.nomatch = true;
        f.$valid = false;
        f.$invalid = true;
        f.NewPassConfirm.$invalid = true;
        f.NewPassConfirm.$valid = false;
        return;
      }

      scope.user.password = scope.local.newPass;
    } else {
      scope.user.password = '';
    }

    // Send updated user to api
    if (!newUser) {
      $user.update(scope.user).then(function (user) {
        // Success
        $mdDialog.hide({ status: true, data: user, message: "User has been updated!" });
      }, function (err) {
        $mdDialog.cancel({ status: false, message: "Could not update this user." });
      });
    }
    // Send updated user to api
    if (newUser) {
      $user.create(scope.user).then(function (user) {
        // Success
        $mdDialog.hide({ status: true, data: user, message: "User has been added!", useUser: true });
      }, function (err) {
        $mdDialog.cancel({ status: false, message: "Could not update this user." });
      });
    }
  };
}]);
'use strict';

app.controller('controller.dashboard.admin.users.userList', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', 'users', function (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin, users) {

  $scope.users = users;

  var deleteUser = function deleteUser($event, user) {

    var confirm = $mdDialog.confirm().title('Are you sure you want to remove ' + user.firstName + ' ' + user.lastName + '?').htmlContent('Are you sure you want to remove <strong>' + user.firstName + ' ' + user.lastName + '\'s</strong> access to this system? <br /><br />This will <em>not</em> affect access to any other BC GSC services.').ariaLabel('Remove User?').targetEvent($event).ok('Remove User').cancel('Cancel');

    $mdDialog.show(confirm).then(function () {
      var tempUser = angular.copy(user);
      // Remove User
      $user.delete(user).then(function (res) {
        $scope.users = _.filter($scope.users, function (u) {
          return u.ident !== tempUser.ident;
        });
        $mdToast.show($mdToast.simple('The user has been removed'));
      }, function (err) {
        $mdToast.show($mdToast.simple('A technical issue prevented the user from being removed.'));
      });
    });
  };

  // Function to pass into
  var passDelete = function passDelete() {

    $mdDialog.hide(); // Hide any displayed dialog;
    return deleteUser;
  };

  $scope.userDiag = function ($event, editUser) {
    var newUser = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/user.edit.html',
      clickOutToClose: false,
      locals: {
        editUser: angular.copy(editUser),
        newUser: newUser,
        userDelete: passDelete()
      },
      controller: 'controller.dashboard.user.edit'
    }).then(function (resp) {
      $mdToast.show($mdToast.simple().textContent(resp.message));
      _.forEach($scope.users, function (u, i) {
        if (u.ident == resp.data.ident) $scope.users[i] = resp.data;
      });

      if (newUser) {
        $scope.users.push(resp.data);
        $scope.users = _.sortBy($scope.users, 'username');
      }
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('The user has not been updated.'));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.admin.users', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', 'groups', 'users', function (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin, groups, users) {

  var passDelete = function passDelete() {
    return function () {};
  };

  $scope.groups = groups;

  $scope.userDiag = function ($event, editUser) {
    var newUser = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/user.edit.html',
      clickOutToClose: false,
      locals: {
        editUser: angular.copy(editUser),
        newUser: newUser,
        userDelete: passDelete()
      },
      controller: 'controller.dashboard.user.edit'
    }).then(function (resp) {
      $mdToast.show($mdToast.simple().textContent(resp.message));
      _.forEach($scope.users, function (u, i) {
        if (u.ident == resp.data.ident) $scope.users[i] = resp.data;
      });

      if (newUser) {
        users.push(resp.data);
      }
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('The user has not been updated.'));
    });
  };

  $scope.groupDiag = function ($event, editGroup) {
    var newGroup = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/group.edit.html',
      clickOutToClose: false,
      locals: {
        editGroup: angular.copy(editGroup),
        newGroup: newGroup,
        groupDelete: passDelete()
      },
      controller: 'controller.dashboard.user.groups.edit'
    }).then(function (resp) {
      $mdToast.show($mdToast.simple().textContent('The group has been added'));

      if (newGroup) {
        $scope.groups.push(resp.data);
        $scope.groups = _.sortBy($scope.groups, 'name');
      }
    }, function (err) {
      $mdToast.show($mdToast.simple().textContent('The group has not been updated.'));
    });
  };
}]);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

app.controller('controller.dashboard.biopsy.board.add', ['$scope', '_', '$q', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', '$mdDialog', '$mdToast', function ($scope, _, $q, $lims, $bioapps, $analysis, $pog, $mdDialog, $mdToast) {

  $scope.stages = [{ title: 'Patient', description: 'Meta data about the patient', id: "patient", ordinal: 0 }, { title: 'Details', description: 'Detailed information (optional)', id: "details", ordinal: 1 }];
  var activeStage = $scope.activeStage = 0;

  $scope.patient = { POGID: null, clinical_biopsy: 'clinspec_', tracking: true, comparators: false, libraries: {} };
  $scope.detail = {};
  $scope.source_loading = false;
  $scope.show_sources = false;
  $scope.searchPogcache = null;

  $scope.find_libraries = false;
  $scope.found_libraries = [];
  $scope.libraries_loading = false;
  $scope.physicians = [0];

  $scope.addPhysician = function () {
    $scope.physicians.push($scope.physicians.length);console.log('Array: ', $scope.physicians);
  };
  $scope.removePhysician = function (i) {
    $scope.physicians.splice(i, 1);
  };

  $scope.events = {
    valid: false,
    dirty: true,
    pristine: true
  };

  var threeLetterCodes = [{ "code": "BRC", "description": "Breast" }, { "code": "CNS", "description": "Central nervous system" }, { "code": "GIC", "description": "Gastrointestinal" }, { "code": "GUC", "description": "Genitourinary" }, { "code": "GYN", "description": "Gynecological" }, { "code": "H&N", "description": "Head and neck" }, { "code": "HEM", "description": "Hematological" }, { "code": "NEU", "description": "Neurological" }, { "code": "PAN", "description": "Pancreatic" }, { "code": "PRO", "description": "Prostate" }, { "code": "PUO", "description": "Primary unknown" }, { "code": "SAR", "description": "Sarcoma" }, { "code": "SKN", "description": "Skin" }, { "code": "THR", "description": "Thoracic" }];

  $scope.$watch('patient.tracking', function (newVal, oldVal) {

    if (newVal === false && oldVal === true) {
      $scope.patient.analysis_biopsy = 'biop';
    } else {
      $scope.patient.analysis_biopsy = null;
    }
  });

  // Close Dialog
  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  // Make Input All Uppercase
  $scope.toUpperCase = function () {
    $scope.searchQuery = $scope.searchQuery.toUpperCase();
  };

  // Search Users with auto complete
  $scope.searchPOGs = function (searchText) {

    return $q(function (resolve, reject) {
      if (searchText.length === 0) return [];

      $pog.all({ query: searchText, all: true }).then(function (resp) {
        resolve(resp);
      }, function (err) {
        console.log(err);reject();
      });
    });
  };

  // Search Disease Endpoint
  $scope.searchDisease = function (searchText) {
    return $q(function (resolve, reject) {
      if (searchText.length === 0) return [];

      $lims.diseaseOntology(searchText).then(function (resp) {
        resolve(resp.results);
      }, function (err) {
        console.log(err);reject();
      });
    });
  };

  // Search Three Letter Code with auto complete
  $scope.searchGroups = function (searchText) {
    return _.filter(threeLetterCodes, function (e) {
      if (e.code.indexOf(searchText.toUpperCase()) > -1) return e;
    });
  };

  // Find LIMS Sources
  $scope.limsSources = function () {

    // Check to see if this is the same value
    if ($scope.searchPogcache === $scope.searchQuery || $scope.searchQuery.length === 0) return; // Same value, btfo!

    console.log('Searching', $scope.searchQuery);

    $scope.source_loading = true;
    $scope.show_sources = true;
    $scope.pog_sources = [];

    // Find LIMS sources for this POGID
    $lims.source($scope.searchQuery).then(function (result) {
      var sources = {};

      _.forEach(result.results, function (s) {
        sources[s.original_source_name] = s;
      });

      $scope.source_loading = false;
      $scope.pog_sources = _.values(sources);
      $scope.searchPogcache = $scope.searchQuery;
    }).catch(function (err) {
      console.log('Failed to lookup POG sources');
    });
  };

  // Move back a stage
  $scope.lastStage = function () {
    $scope.activeStage--;
  };

  // Move forward a stage
  $scope.nextStage = function () {
    var form = void 0;
    // Try to trigger submit...
    switch ($scope.activeStage) {
      case 1:
        form = $scope.referenceForm;
        break;
      case 0:
        form = $scope.matching;
        break;
    }

    form.$setSubmitted();
    if (form.$valid) {
      $scope.activeStage++;
    }
  };

  // Attempt to guess library names
  $scope.libraryGuess = function () {

    $scope.find_libraries = true;
    $scope.libraries_loading = true;

    var diseaseLibraries = [];
    var pogs = {};

    var pogid = $scope.patient.POGID ? $scope.patient.POGID.POGID : $scope.searchQuery;

    $lims.sample([pogid]).then(function (result) {
      return $q(function (resolve, reject) {
        _.forEach(result.results, function (sample) {

          var pogid = sample.participant_study_id;
          var datestamp = sample.sample_collection_time.substring(0, 10);

          var library = {
            name: sample.library,
            type: sample.disease_status === 'Normal' ? 'normal' : null,
            source: sample.original_source_name,
            disease: sample.disease,
            sample_collection_time: sample.sample_collection_time
          };

          if (sample.disease_status === 'Diseased' && diseaseLibraries.indexOf(sample.library) === -1) {
            diseaseLibraries.push(sample.library);
          }

          // Check if pog has been seen yet in this cycle
          if (!pogs[pogid]) pogs[pogid] = {};

          // Check if this biopsy event date
          if (!pogs[pogid][datestamp]) pogs[pogid][datestamp] = [];

          // Has this library name been listed yet?
          if (!_.find(pogs[pogid][datestamp], { name: library.name })) {
            pogs[pogid][datestamp].push(library);
          }
        });
        resolve(diseaseLibraries);
      });
    }).then($lims.library).then(function (result) {
      return $q(function (resolve, reject) {

        // Loop over found libraries
        _.forEach(result.results, function (library) {

          // Grab associated POG biopsies
          var pog = pogs[library.full_name.split('-')[0]];

          // Loop over biopsies
          _.forEach(pog, function (libraries, biopsy_date) {

            // The index key of the library we're looking for
            var i = _.findKey(libraries, { name: library.name });

            // If the index is valid, store the updated data
            if (i) {
              // Types of library strategy mappings
              if (library.library_strategy === 'WGS') pogs[library.full_name.split('-')[0]][biopsy_date][i].type = 'tumour';
              if (library.library_strategy.indexOf('RNA') > -1) pogs[library.full_name.split('-')[0]][biopsy_date][i].type = 'transcriptome';
            }
          });
        });

        resolve();
      });
    }).then(function () {

      // Did we find anything?
      if (!pogs[pogid]) return;
      var pog_libs = pogs[pogid];

      // Organize into object
      _.forEach(pog_libs, function (libs, date) {

        var normal = _.find(libs, { type: 'normal' });
        var tumour = _.find(libs, { type: 'tumour' });
        var transcriptome = _.find(libs, { type: 'transcriptome' });

        $scope.found_libraries.push({ collection_date: date, normal: normal, tumour: tumour, transcriptome: transcriptome });
      });

      $scope.libraries_loading = false;
    }).catch(function (err) {
      console.log('failed to find/guess libraries', err);

      $scope.libraries_loading = false;
    });
  };

  /**
   * Select collection and auto-populate
   *
   * @param collection
   */
  $scope.selectCollection = function (collection) {

    console.log('Collection', collection);

    $scope.patient.libraries.normal = collection.normal.name;
    $scope.patient.libraries.tumour = collection.tumour.name;
    $scope.patient.libraries.transcriptome = collection.transcriptome.name;
  };

  // Submit Biopsy Entry
  $scope.submit = function (f) {

    $scope.sending = true;

    // Setup submission object
    var analysis = {
      POGID: $scope.patient.POGID ? $scope.patient.POGID.POGID : $scope.searchQuery,
      project: 'POG',
      clinical_biopsy: $scope.patient.clinical_biopsy,
      disease: _typeof($scope.patient.disease) === 'object' ? $scope.patient.disease.text : $scope.patient.disease,
      threeLetterCode: _typeof($scope.patient.threeLetterCode) === 'object' ? $scope.patient.threeLetterCode.code : $scope.patient.threeLetterCode,
      biopsy_notes: $scope.patient.biopsy_notes,
      biopsy_date: $scope.patient.biopsy_date,
      tracking: $scope.patient.tracking,
      notes: $scope.patient.notes,
      pediatric_id: $scope.patient.pediatric_id,
      physician: [],
      libraries: null
    };

    _.forEach($scope.patient.physician, function (p) {
      analysis.physician.push(p);
    });

    // Add libraries and biop if not tracking
    if (!$scope.patient.tracking) {
      analysis.libraries = $scope.patient.libraries;
      analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
    }

    $analysis.add(analysis).then(function (result) {
      /*
      $scope.analyses.push(result);
      
      $scope.analyses = _.sortBy($scope.analyses, ['createdAt']);
      $scope.analyses = $scope.analyses.reverse();
      */

      $mdDialog.hide({ result: result });
    }).catch(function (err) {
      $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
    });
  };
}]);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

app.controller('controller.dashboard.biopsy.board.edit', ['$scope', '_', '$q', '$mdDialog', '$mdToast', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', 'analysis', function ($scope, _, $q, $mdDialog, $mdToast, $lims, $bioapps, $analysis, $pog, analysis) {

  $scope.patient = analysis;

  console.log('Analysis', analysis);

  $scope.events = {
    valid: false,
    dirty: true,
    pristine: true
  };

  var threeLetterCodes = [{ "code": "BRC", "description": "Breast" }, { "code": "CNS", "description": "Central nervous system" }, { "code": "GIC", "description": "Gastrointestinal" }, { "code": "GUC", "description": "Genitourinary" }, { "code": "GYN", "description": "Gynecological" }, { "code": "H&N", "description": "Head and neck" }, { "code": "HEM", "description": "Hematological" }, { "code": "NEU", "description": "Neurological" }, { "code": "PAN", "description": "Pancreatic" }, { "code": "PRO", "description": "Prostate" }, { "code": "PUO", "description": "Primary unknown" }, { "code": "SAR", "description": "Sarcoma" }, { "code": "SKN", "description": "Skin" }, { "code": "THR", "description": "Thoracic" }];

  // Close Dialog
  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  // Search Disease Endpoint
  $scope.searchDisease = function (searchText) {
    return $q(function (resolve, reject) {
      if (searchText.length === 0) return [];

      $lims.diseaseOntology(searchText).then(function (resp) {
        resolve(resp.results);
      }, function (err) {
        console.log(err);reject();
      });
    });
  };

  // Search Three Letter Code with auto complete
  $scope.searchGroups = function (searchText) {
    return _.filter(threeLetterCodes, function (e) {
      if (e.code.indexOf(searchText.toUpperCase()) > -1) return e;
    });
  };

  /**
   * Select collection and auto-populate
   *
   * @param collection
   */
  $scope.selectCollection = function (collection) {

    console.log('Collection', collection);

    $scope.patient.libraries.normal = collection.normal.name;
    $scope.patient.libraries.tumour = collection.tumour.name;
    $scope.patient.libraries.transcriptome = collection.transcriptome.name;
  };

  // Submit Biopsy Entry
  $scope.save = function (f) {

    // Setup submission object
    analysis.priority = $scope.patient.priority;
    analysis.clinical_biopsy = $scope.patient.clinical_biopsy;
    analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
    analysis.disease = _typeof($scope.patient.disease) === 'object' ? $scope.patient.disease.text : $scope.patient.disease;
    analysis.biopsy_notes = $scope.patient.biopsy_notes;
    analysis.biopsy_date = $scope.patient.biopsy_date;
    analysis.notes = $scope.patient.notes;
    analysis.libraries.normal = $scope.patient.libraries.normal;
    analysis.libraries.tumour = $scope.patient.libraries.tumour;
    analysis.libraries.transcriptome = $scope.patient.libraries.transcriptome;
    analysis.threeLetterCode = _typeof($scope.patient.threeLetterCode) === 'object' ? $scope.patient.threeLetterCode.code : $scope.patient.threeLetterCode;
    analysis.date_presentation = $scope.patient.date_presentation;
    analysis.onco_panel_submitted = $scope.patient.onco_panel_submitted;
    analysis.date_analysis = $scope.patient.date_analysis;

    // Add libraries and biop if not tracking
    if (!$scope.patient.tracking) {
      analysis.libraries = $scope.patient.libraries;
      analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
    }

    $analysis.update(analysis).then(function (result) {
      $mdDialog.hide({ analysis: result });
    }).catch(function (err) {
      $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
    });
  };
}]);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

app.controller('controller.dashboard.biopsy.board.edit_comparator', ['$scope', '_', '$q', '$mdDialog', '$mdToast', 'api.analysis', 'api.pog', 'analysis', 'comparators', function ($scope, _, $q, $mdDialog, $mdToast, $analysis, $pog, analysis, comparators) {

  $scope.patient = analysis;
  $scope.comparators = comparators;

  $scope.disease_comparators = _typeof(analysis.comparator_disease.all) === 'object' ? analysis.comparator_disease.all : [];

  $scope.comparator_search = {
    normal_primary: $scope.patient.comparator_normal.normal_primary ? $scope.patient.comparator_normal.normal_primary[0] : null,
    normal_biopsy: $scope.patient.comparator_normal.normal_biopsy ? $scope.patient.comparator_normal.normal_biopsy[0] : null,
    gtex_primary: $scope.patient.comparator_normal.gtex_primary ? $scope.patient.comparator_normal.gtex_primary[0] : null,
    gtex_biopsy: $scope.patient.comparator_normal.gtex_biopsy ? $scope.patient.comparator_normal.gtex_biopsy[0] : null
  };

  // Close Dialog
  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  // Search Disease Endpoint
  $scope.searchComparators = function (searchText) {
    return $q(function (resolve, reject) {
      if (searchText.length === 0) return [];

      resolve(_.filter(comparators.v9.disease.tcga, function (c) {
        if (c.code.indexOf(searchText) > -1) return c;
      }));
    });
  };

  // Search Disease Endpoint
  $scope.searchNormalComparators = function (searchText) {
    return $q(function (resolve, reject) {
      if (searchText.length === 0) return [];

      resolve(_.filter(comparators.v9.normal.illumina, function (c) {
        if (c.indexOf(searchText) > -1) return c;
      }));
    });
  };

  // Search Disease Endpoint
  $scope.searchGtexComparators = function (searchText) {
    return $q(function (resolve, reject) {
      if (searchText.length === 0) return [];

      resolve(_.filter(comparators.v9.normal.gtex, function (c) {
        if (c.code.indexOf(searchText) > -1) return c;
      }));
    });
  };

  // Mark comparator as for analysis
  $scope.select_for_analysis = function (c) {
    $scope.patient.comparator_disease.analysis = c;
  };

  // Add found comparator to array
  $scope.add_comparator = function () {
    // Is it already in the array?
    if ($scope.disease_comparators.indexOf($scope.comparator_search.entry.code) > -1) return $scope.comparator_search.entry = null;

    // If it's the first one, its also the default for analysis!
    if ($scope.disease_comparators.length === 0) $scope.patient.comparator_disease.analysis = $scope.comparator_search.entry.code;

    // Add to array
    $scope.disease_comparators.push($scope.comparator_search.entry.code);
    $scope.comparator_search.entry = null;
  };

  // Remove Disease Comparator
  $scope.remove_comp = function (c) {
    $scope.disease_comparators.splice($scope.disease_comparators.indexOf(c), 1);
  };

  // Submit Biopsy Entry
  $scope.save = function (f) {

    var patient = angular.copy($scope.patient);

    console.log('Sending object', $scope.patient, $scope.comparator_search);

    // Setup submission object
    analysis.comparator_disease = {
      analysis: patient.comparator_disease.analysis,
      all: $scope.disease_comparators,
      tumour_type_report: patient.comparator_disease.tumour_type_report,
      tumour_type_kb: patient.comparator_disease.tumour_type_kb
    };
    analysis.comparator_normal = {
      normal_primary: [$scope.comparator_search.normal_primary],
      normal_biopsy: [$scope.comparator_search.normal_biopsy],
      gtex_primary: [_typeof($scope.comparator_search.gtex_primary) === 'object' ? $scope.comparator_search.gtex_primary.code : $scope.comparator_search.gtex_primary],
      gtex_biopsy: [_typeof($scope.comparator_search.gtex_biopsy) === 'object' ? $scope.comparator_search.gtex_biopsy.code : $scope.comparator_search.gtex_biopsy]
    };

    $analysis.update(analysis).then(function (result) {
      $mdDialog.hide({ analysis: result });
    }).catch(function (err) {
      $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.biopsy.board', ['$q', '_', '$scope', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', '$mdDialog', '$mdToast', 'analyses', 'comparators', function ($q, _, $scope, $lims, $bioapps, $analysis, $pog, $mdDialog, $mdToast, analyses, comparators) {

  $scope.pogs = {};
  $scope.searching = false;
  $scope.analyses = analyses.analysis;
  $scope.loading = false;
  $scope.showSearch = false;
  $scope.focusSearch = false;
  $scope.active_sheet = 'biopsy';

  var analysis_query = {
    search: undefined,
    paginated: true,
    project: 'POG'
  };

  $scope.paginate = {
    offset: 0,
    limit: 25,
    total: analyses.total
  };

  $scope.refreshAnalyses = function () {

    $scope.loading = true;

    analysis_query.limit = $scope.paginate.limit;
    analysis_query.offset = $scope.paginate.offset;

    $analysis.all(analysis_query).then(function (results) {
      $scope.loading = false;
      $scope.analyses = results.analysis;
      $scope.paginate.total = results.total;
    }).catch(function (err) {
      $scope.loading = false;
      $mdToast.show($mdToast.simple().textContent('Unable to retrieve the requested data.'));
    });
  };

  $scope.clearSearch = function () {
    $scope.showSearch = false;
    $scope.focusSearch = false;

    var filterCache = $scope.filter.search;

    $scope.filter.search = null;
    analysis_query.search = undefined;
    if (filterCache !== undefined) $scope.refreshAnalyses();
  };

  $scope.displaySearch = function () {
    $scope.showSearch = true;
    $scope.focusSearch = true;
  };

  /**
   * Update search criteria and trigger reload
   */
  $scope.search = function () {
    analysis_query.search = $scope.filter.search;
    $scope.paginate.offset = 0; // start from first page of paginator if performing search
    $scope.refreshAnalyses();
  };

  /**
   * Get number of keys in objcet
   * @param {object} obj - Object to return [keys] length
   * @returns {Number}
   */
  $scope.numKeys = function (obj) {
    return Object.keys(obj).length;
  };

  /**
   * Search LIMS for sources
   */
  $scope.sampleSearch = function () {

    $scope.searching = true;
    $scope.pogs = {};

    $lims.sample([$scope.biopsy.search]).then(function (result) {
      // Empty map
      $scope.pogs = {};

      _.forEach(result.results, function (r) {

        if (!$scope.pogs[r.original_source_name]) {

          $scope.pogs[r.original_source_name] = {
            pogid: r.participant_study_id,
            sample_name: r.original_source_name,
            date: r.sample_collection_time,
            anatomic_site: r.anatomic_site,
            disease: r.disease,
            libraries: [r.library]
          };
        }

        if ($scope.pogs[r.original_source_name] && $scope.pogs[r.original_source_name].libraries.indexOf(r.library) === -1) {
          $scope.pogs[r.original_source_name].libraries.push(r.library);
        }
      });

      $scope.searching = false;

      console.log('POGs', $scope.pogs);
    }, function (err) {
      console.log("Error", err);
    });
  };

  $scope.openLibrary = function (lib) {

    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.library.html',
      controller: ['$scope', function (scope) {

        scope.loading = { library: true, illumina: true };
        scope.library = { name: lib };
        scope.illumina = [];

        scope.cancel = function () {
          $mdDialog.cancel();
        };

        scope.getPoolName = function () {
          var pool = null;

          _.forEach(scope.illumina, function (r) {
            if (r.library.indexOf('IX') > -1) pool = r.library;
          });

          if (!pool) return "N/A";

          return pool;
        };

        $lims.library(lib).then(function (result) {

          if (result.hits === 0) {
            $mdToast.show($mdToast.simple().textContent('Unable to lookup the requested library data in LIMS'));
          }

          scope.loading.library = false;
          scope.library = result.results[0];
        }).catch(function (err) {
          console.log('Err querying library', err);
        });

        $lims.illumina_run([lib]).then(function (result) {
          if (result.hits === 0) {
            $mdToast.show($mdToast.simple().textContent('Illumina run data not available yet'));
          }
          scope.loading.illumina = false;
          scope.illumina = result.results;
        }).catch(function (err) {
          console.log('Err querying library', err);
        });
      }]
    });
  };

  // Open Source Information
  $scope.openAnalysis = function (analysis) {

    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.detail.html',
      controller: ['$scope', function (scope) {

        scope.loading = true;
        scope.analysis = analysis;
        scope.sources = [];

        scope.cancel = function () {
          $mdDialog.cancel();
        };

        $lims.source(analysis.pog.POGID).then(function (result) {

          var sources = {};

          if (result.hits === 0) {
            $mdToast.show($mdToast.simple().textContent('Unable to lookup the requested library'));
            $mdDialog.cancel();
          }

          _.forEach(result.results, function (s) {
            sources[s.original_source_name] = s;
          });

          scope.sources = _.values(sources);

          scope.loading = false;
        }).catch(function (err) {
          console.log('Err querying library', err);
        });
      }]
    });
  };

  // Open Source Information
  $scope.editAnalysis = function (analysis) {

    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.edit.html',
      controller: 'controller.dashboard.biopsy.board.edit',
      locals: {
        analysis: analysis
      }
    }).then(function (result) {
      // Find result, and update row
      var i = _.findIndex(analyses, { ident: result.ident });
      if (i) analyses[i] = result;
    });
  };

  // Open Source Information
  $scope.editComparators = function (analysis) {

    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.edit_comparator.html',
      controller: 'controller.dashboard.biopsy.board.edit_comparator',
      locals: {
        analysis: analysis,
        comparators: comparators
      }
    }).then(function (result) {
      // Find result, and update row
      var i = _.findIndex(analyses, { ident: result.ident });
      if (i) analyses[i] = result;
    });
  };

  // Open Source Information
  $scope.addBiopsy = function () {

    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.add.html',
      controller: 'controller.dashboard.biopsy.board.add'
    }).then(function (result) {
      if (result.result) $scope.analyses.unshift(result.result);
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.germline.board', ['$q', '_', '$scope', '$window', '$timeout', 'api.germline.report', '$mdDialog', '$mdToast', 'reports', function ($q, _, $scope, $window, $timeout, $report, $mdDialog, $mdToast, reports) {

  $scope.reports = reports.reports;

  $scope.loading = false;
  $scope.showSearch = true;
  $scope.focusSearch = false;
  $scope.filter = {
    search: null,
    project: 'POG'
  };

  $scope.paginate = {
    total: reports.total,
    offset: 0,
    limit: 25
  };

  $scope.clearSearch = function () {
    //$scope.showSearch = false;
    $scope.focusSearch = false;

    var filterCache = $scope.filter.search;

    $scope.filter.search = null;
    if (filterCache !== undefined) $scope.refreshReports();
  };

  $scope.displaySearch = function () {
    $scope.showSearch = true;
    $scope.focusSearch = true;
  };

  $scope.hasReview = function (report, type) {
    return _.find(report.reviews, { type: type }) !== undefined ? true : false;
  };

  $scope.unsetExported = function (report) {
    if (report.exported === false) return;

    report.exported = false;

    var report_cache = angular.copy(report);
    report_cache.biofx_assigned = report.biofx_assigned.ident;

    $report.update(report_cache.analysis.pog.POGID, report_cache.analysis.analysis_biopsy, report_cache.ident, report_cache).then(function (result) {
      var i = _.findKey($scope.reports, { ident: report_cache.ident });

      $scope.reports[i] = result;
    }).catch(function (e) {
      report.exported = true;
      $mdToast.showSimple('Failed to update report exported status.');
      console.log(e);
    });
  };

  /**
   * Update search criteria and trigger reload
   */
  $scope.search = function () {
    $scope.refreshReports();
  };

  /**
   * Reload tracking data from API
   *
   */
  $scope.refreshReports = function () {

    // start from first page of paginator if performing search
    if ($scope.filter.search) $scope.paginate.offset = 0;

    var opts = {
      //offset: $scope.paginate.offset, // sequelize applies limit and offset to subquery, returning incorrect results
      //limit: $scope.paginate.limit,
      project: 'POG',
      search: $scope.filter.search
    };

    $report.all(opts).then(function (reports) {
      $scope.paginate.total = reports.total;
      // have to manually extract reports based on limit/offset due to sequelize bug
      var start = $scope.paginate.offset,
          finish = $scope.paginate.offset + $scope.paginate.limit;
      $scope.reports = reports.reports.slice(start, finish);
    }, function (err) {
      console.log('Failed to get updated definitions', err);
    });
  };

  // Trigger download pipe
  $scope.getExport = function () {
    $report.flash_token().then(function (token) {
      // Open a window for the user with the special url
      $window.open(CONFIG.ENDPOINTS.API + '/export/germline_small_mutation/batch/download?reviews=biofx,projects&flash_token=' + token.token, '_blank');

      $timeout(function () {
        $scope.refreshReports();
      }, 500);
    }).catch(function (e) {
      $mdToast.showSimple('Failed to retrieve the downloadable export');
      console.log(e);
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.germline.report', ['$q', '_', '$scope', '$state', 'api.germline.report', 'api.germline.review', 'api.germline.variant', '$mdDialog', '$mdToast', 'report', 'user', function ($q, _, $scope, $state, $report, $review, $variant, $mdDialog, $mdToast, report, user) {

  $scope.report = report;
  $scope.user = user;
  $scope.addReview = false;

  $scope.hasReview = function (report, type) {
    return _.find(report.reviews, { type: type }) !== undefined ? true : false;
  };

  $scope.show_extended = false;

  $scope.columns = {
    flagged: {
      name: 'Flagged',
      width: 100,
      show_always: true,
      split: ','
    },
    clinvar: {
      name: 'ClinVar',
      width: 100
    },
    cgl_category: {
      name: 'CGL Category',
      width: 100,
      show_always: false
    },
    gmaf: {
      name: 'GMAF',
      width: 100,
      show_always: true
    },
    transcript: {
      name: 'Trancript',
      width: 100,
      show_always: true
    },
    gene: {
      name: 'Gene',
      width: 100,
      show_always: true
    },
    variant: {
      name: 'Variant',
      width: 100,
      show_always: true
    },
    impact: {
      name: 'Impact',
      width: 100,
      show_always: true
    },
    chromosome: {
      name: 'Chr',
      width: 40,
      show_always: true
    },
    position: {
      name: 'Pos',
      width: 100,
      show_always: true
    },
    dbSNP: {
      name: 'dbSNP',
      width: 100,
      show_always: true
    },
    reference: {
      name: 'Ref',
      width: 40,
      show_always: true
    },
    alteration: {
      name: 'Alt',
      width: 40,
      show_always: true
    },
    score: {
      name: 'Score',
      width: 50,
      show_always: true
    },
    zygosity_germline: {
      name: 'Zygosity in germline',
      width: 100,
      show_always: true
    },
    preferred_transcript: {
      name: 'Preferred Transcript',
      width: 150,
      show_always: true
    },
    hgvs_cdna: {
      name: 'HGVS-cDNA',
      width: 100,
      show_always: true
    },
    hgvs_protein: {
      name: 'HGVS-protein',
      width: 100,
      show_always: true
    },
    zygosity_tumour: {
      name: 'Zygosity in tumour',
      width: 100,
      show_always: true
    },
    genomic_variant_reads: {
      name: 'Genomic variant reads ',
      tooltip: '(alt/total)',
      width: 120,
      show_always: false
    },
    rna_variant_reads: {
      name: 'RNA variant reads',
      tooltip: '(alt/total)',
      width: 120,
      show_always: false
    },
    gene_somatic_abberation: {
      name: 'Gene somatic aberration?',
      width: 100,
      show_always: false
    },
    notes: {
      name: 'Notes',
      width: 100,
      show_always: true
    },
    type: {
      name: 'Type',
      width: 100,
      show_always: true
    },
    patient_history: {
      name: 'Patient History',
      width: 100,
      show_always: true
    },
    family_history: {
      name: 'Family History',
      width: 100,
      show_always: true
    },
    tcga_comp_norm_percentile: {
      name: 'tcga_comp_norm_percentile',
      width: 100,
      show_always: false
    },
    tcga_comp_percentile: {
      name: 'tcga_comp_percentile',
      width: 200,
      show_always: false
    },
    gtex_comp_percentile: {
      name: 'gtex_comp_average_percentile',
      width: 200,
      show_always: false
    },
    fc_bodymap: {
      name: 'fc_bodymap',
      width: 100,
      show_always: false
    },
    gene_expression_rpkm: {
      name: 'Gene Expression RPKM',
      width: 100,
      show_always: true
    },
    additional_info: {
      name: 'Additional Info',
      width: 100,
      show_always: false
    }
  };

  $scope.getHistory = function ($ev, mode, v) {

    var input = {
      value: v,
      mode: mode
    };

    if (mode === 'patient') input.name = input.placeholder = 'Patient History';
    if (mode === 'family') input.name = input.placeholder = 'Family History';

    $mdDialog.show({
      templateUrl: 'dashboard/germline/report/report.input.dialog.html',
      targetEvent: $ev,
      clickOutsideToClose: true,
      controller: ['scope', function (scope) {

        scope.input = input;

        scope.cancel = function () {
          $mdDialog.cancel();
        };

        scope.submit = function () {
          $mdDialog.hide(input);
        };
      }]
    }).then(function (res) {

      if (mode === 'patient') {
        _.forEach($scope.report.variants, function (v, i) {
          $scope.report.variants[i].patient_history = res.value;
        });
      }
      if (mode === 'family') {
        _.forEach($scope.report.variants, function (v, i) {
          $scope.report.variants[i].family_history = res.value;
        });
      }

      $q.all(_.map($scope.report.variants, function (v) {
        return $variant.update($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, v.ident, v);
      })).then(function (result) {
        console.log('Finished updating rows', result);
        $mdToast.showSimple('Report has been updated.');
      });
    }).catch(function (err) {});
  };

  $scope.review = function () {

    var data = {
      type: $scope.new.type,
      comment: $scope.new.comment
    };

    $review.add($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, data).then(function (review) {
      $scope.report.reviews.push(review[0]);
      $mdToast.showSimple('The review has been added.');
      $scope.addReview = false;
    }).catch(function (err) {
      $mdToast.showSimple('Failed to add the submitted reviewed.');
    });
  };

  $scope.toggleVariantHidden = function (variant) {

    variant.hidden = !variant.hidden;

    $variant.update($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, variant.ident, variant).then(function (result) {
      // Update report in memory with fresh result from API.
      var i = _.find($scope.report.variants, { ident: result.ident });
      $scope.report.variants[i] = result;
    }).catch(function (e) {
      console.log('Hide error', e);
      $mdToast.showSimple('Failed to update variant with visibility change');
    });
  };

  $scope.removeReview = function (review) {

    $review.remove($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, review.ident).then(function (res) {
      $scope.report.reviews.splice(_.findKey($scope.report.reviews, { ident: review.ident }, 1));
    }).catch(function (e) {
      console.log('Response: ', e);
      $mdToast.showSimple('Failed to remove the requested review');
    });
  };

  $scope.removeReport = function () {

    var confirm = $mdDialog.confirm({
      title: 'Confirm remove',
      textContent: 'Are you sure you want to remove this germline report?',
      ok: 'Remove',
      cancel: 'Cancel'
    });

    $mdDialog.show(confirm).then(function (response) {
      console.log('Response:', response);
      $report.delete($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident).then(function () {
        $state.go('dashboard.germline.board');
      }).catch(function (e) {
        $mdToast.showSimple('Something went wrong and the report has not been removed.');
      });
    }).catch(function (e) {
      console.log('Error', e);
      $mdToast.showSimple('No changes were made.');
    });
  };
}]);
"use strict";
"use strict";
'use strict';

app.controller('knowledgebase.dashboard', ['$q', '$scope', '$timeout', '$state', 'metrics', function ($q, $scope, $timeout, $state, metrics) {

  $scope.metrics = metrics;

  $scope.search = {
    target: 'references',
    query: null,
    go: null
  };

  $scope.totals = {
    ref: parseInt(metrics.refTotal).toLocaleString(),
    ev: parseInt(metrics.evTotal).toLocaleString()
  };

  $scope.doughnut = {};
  $scope.doughnut.events = {
    data: [0, 0, 0, 0],
    labels: ['Approved', 'New', 'Flagged-Incorrect', 'Requires-Review'],
    colors: ['#2ECC71', '#19B5FE', '#F22613', '#F9BF3B'],
    options: {
      legend: {
        display: true,
        position: 'left'
      }
    }
  };

  $scope.doughnut.references = {
    data: [0, 0, 0, 0],
    labels: ['Reviewed', 'New', 'Flagged-Incorrect', 'Requires-Review', 'Interim'],
    colors: ['#2ECC71', '#19B5FE', '#F22613', '#F9BF3B', '#c104f9'],
    options: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  $timeout(function () {
    $scope.doughnut.events.data = [metrics.evApproved, metrics.evNew, metrics.evFlaggedIncorrect, metrics.evRequiresReview];
  }, 500);

  $timeout(function () {
    $scope.doughnut.references.data = [metrics.refReviewed, metrics.refNew, metrics.refFlaggedIncorrect, metrics.refRequiresReview, metrics.refInterim];
  }, 300);

  $scope.search.go = function () {

    // Send to correct page with search criteria
    if ($scope.search.target === 'references') $state.go('dashboard.knowledgebase.references', { filters: { search: $scope.search.query } });
    if ($scope.search.target === 'events') $state.go('dashboard.knowledgebase.events', { filters: { search: $scope.search.query } });
  };
}]);
'use strict';

app.controller('knowledgebase.events.edit', ['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.pubmed', 'api.kb.associations', 'api.knowledgebase', 'api.user', 'action', 'event', function (_, $q, scope, $mdDialog, $mdToast, $complete, $pubmed, $kbAssoc, $kb, $user, action, event) {

  scope.$alterations = $complete.get('alterations');
  scope.disableRefTitle = false;
  scope.event = angular.copy(event);
  scope.formAction = action === 'new' ? 'Create' : 'Modify';
  scope.user = $user._me;
  scope.action = action;

  scope.events = {
    valid: false,
    dirty: true,
    pristine: true
  };

  scope.submit = function () {
    scope.matching.$setSubmitted();

    if (!scope.matching.$valid) $mdToast.show($mdToast.simple({ textContent: 'Please check all the fields for errors' }));

    // All are valid
    if (scope.matching.$valid) {

      scope.reference.disease_list = _.join(scope.disease.all, ';');

      // Send updated entry to API
      if (action === 'new') {
        // Submit new entry
        $kb.references.create(scope.reference).then(function (newEntry) {
          $mdDialog.hide({ status: 'new', data: newEntry });
        }, function (err) {
          console.log('Unable to create entry', err);
          $mdToast.show($mdToast.simple({ textContent: 'Unable to add new entry. Please try again. If this continues to fail, please leave feedback.' }));
        });
      } else {
        // Update Existing Entry
        $kb.references.update(scope.reference).then(function (updateEntry) {
          console.log('Entry saved', updateEntry);
          $mdDialog.hide({ status: 'update', data: updateEntry });
        }, function (err) {
          console.log('Unable to update entry', err);
          $mdToast.show($mdToast.simple({ textContent: 'Unable to update the entry. Please try again. If this continues to fail, please leave feedback.' }));
        });
      }
    }
  };

  // Close Dialog
  scope.cancel = function () {
    $mdDialog.cancel('No changes have been made.');
  };

  // When the modal opens, watch for the events-expression value to load and validate it.
  scope.$watch('matching.key', function (newval, oldval) {

    // Are we transitioning from an empty form to a prefilled?
    if ((oldval === undefined || oldval === null) && newval !== undefined && newval !== null) {
      scope.validateKBEvents();
    } else {
      // If not, are we just looking at a normal typing change?
      if (scope.events.pristine) scope.validateKBEvents();
    }

    // If the previous value was null/undefined, mark as no longer pristine.
    if (newval !== null && newval !== undefined) scope.events.pristine = false;
  });

  // Validate KB Events string
  scope.validateKBEvents = function () {
    scope.events.dirty = true;
    scope.events.valid = false;

    if (scope.event.key === '' || scope.event.key === undefined || scope.event.key === null) {
      scope.events.dirty = false;
      scope.events.valid = false;
      return;
    }

    // Try to validate
    $kb.validate.events(scope.event.key).then(function (result) {
      scope.events.dirty = false;
      scope.events.valid = true;

      // FIll out other fields
      scope.event.type = scope.event.key.split('_')[0];
      scope.event.name = scope.event.key.split('_')[1];
      scope.event.display_coord = scope.event.key.split('_')[2];
    }, function (err) {
      scope.events.dirty = false;
      scope.events.valid = false;
    });
  };
}]); // End controller
'use strict';

app.controller('knowledgebase.events.filter', ['$q', '_', '$scope', '$mdDialog', 'api.knowledgebase', 'filters', function ($q, _, scope, $mdDialog, $kb, filters) {

  scope.cancel = function () {
    $mdDialog.hide();
  };

  // Setup starting place filters
  scope.filter = filters;
  if (!scope.filter.key) scope.filter.key = [];
  if (!scope.filter.name) scope.filter.name = [];
  if (!scope.filter.display_coord) scope.filter.display_coord = [];
  if (!scope.filter.notation) scope.filter.notation = [];
  if (!scope.filter.related_events) scope.filter.related_events = [];

  // Set Vocab
  scope.new = {
    values: {
      key: null,
      name: null,
      display_coord: null,
      notation: null,
      related_events: null
    }
  };

  // Transform chip for auto complete
  scope.transformChip = function (disease) {
    // If it is an object, it's already a known chip
    if (angular.isObject(disease)) return disease;

    // Otherwise, create a new one
    return { disease: disease, type: 'new' };
  };

  // Auto-complete search filter
  scope.disease = { search: [] };
  scope.disease.filter = function (query) {
    var deferred = $q.defer();
    if (query.length < 3) deferred.resolve([]);

    if (query.length >= 3) {
      $kb.diseaseOntology(query).then(function (entries) {
        deferred.resolve(entries);
      }, function (err) {
        console.log('Unable to search for disease-ontology entries', err);
      });
    }
    return deferred.promise;
  };

  // New Freeform Entry
  scope.new.action = function (type) {
    if (scope.new.values[type] === null || scope.new.values[type] === undefined) return null;

    // Create new Disease entry filter
    scope.filter[type].push(scope.new.values[type]);
    scope.disease.search[scope.disease.search.length] = scope.new.values[type];
    scope.new.values[type] = null;
  };

  // Remove filter entry
  scope.removeFilterEntry = function (type, index) {
    scope.filter[type].splice(index, 1);
  };

  scope.save = function () {
    $mdDialog.hide(scope.filter);
  };
}]);
'use strict';

app.controller('knowledgebase.events', ['$rootScope', '$q', '_', '$scope', '$sanitize', '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'events', 'events_count', function ($rootScope, $q, _, $scope, $sanitize, $mdDialog, $mdToast, $kbUtils, $kb, events, events_count) {

  $scope.events = events;

  // Open Filters Modal
  $scope.openFilters = function ($event) {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/events/events.filter.html',
      locals: {
        filters: $paginate.filters
      },
      clickOutToClose: false,
      controller: 'knowledgebase.events.filter'
    }).then(
    // Save Filters
    function (filters) {
      $paginate.setFilters(filters); // Updated Filters
      $paginate.updateFilters(); // Refresh Pagination
    },
    // Cancel
    function () {});
  };

  var $paginate = {
    current: 1, // current page
    limit: 100, // # of records per page
    offset: 0, // Current offset
    pages: 0, // Total Pages
    records: events_count.events, // Total References,
    filters: {}, // Filters

    /**
     * Setup the page count
     */
    calcPages: function calcPages() {
      $paginate.pages = _.ceil(parseInt($paginate.records) / $paginate.limit);
    },

    /**
     * Pages to display
     *
     * @returns {object} - Returns object with min, max properties.
     */
    displayPages: function displayPages() {
      var min = $paginate.current - 3 < 1 ? 1 : $paginate.current - 3;
      var upperPad = min < 3 ? 4 - min : 0;
      var max = $paginate.current + (4 + upperPad) > $paginate.pages ? $paginate.pages : $paginate.current + (4 + upperPad);
      var pages = [];

      for (var i = min; i < max; i++) {
        pages.push(i);
      }

      return pages;
    },

    /**
     * Update Count
     */
    updateCount: function updateCount() {
      $kb.events.count($paginate.filters).then(function (count) {
        $paginate.records = count.events;
        $paginate.calcPages(); // Recount Pages
      }, function (err) {});
    },

    /**
     * Set Filters
     *
     * @param {object} filters - Hashmap of filter query values
     */
    setFilters: function setFilters(filters) {
      var newFilters = {};
      _.forEach(filters, function (value, filter) {
        if (value.length > 0) newFilters[filter] = value;
      });

      // Did the user clear the filters?
      if (_.size(newFilters) === 0) return $paginate.filters = {};

      $paginate.filters = newFilters;
    },

    /**
     * Updated filters
     */
    updateFilters: function updateFilters() {
      $paginate.updateCount();
      $paginate.changePage(1);
    },

    /**
     * Refresh current page
     */
    refresh: function refresh() {
      $paginate.changePage($paginate.current); // Trigger change page with current value
    },

    /**
     * Remove a filter
     *
     * @param {string} filter - The filter type to be spliced
     * @param {int} i - The array ID to be spliced
     */
    removeFilter: function removeFilter(filter, i) {
      $paginate.filters[filter].splice(i, 1);
      // If it's now empty, remove it
      if ($paginate.filters[filter].length === 0) delete $paginate.filters[filter];
      $paginate.updateFilters(); // Refresh Pagination
    },

    /**
     * Change Page
     */
    changePage: function changePage(target) {

      $rootScope.showLoader = true;

      // Attempt to load the next page
      var startRecord = $paginate.limit * (target - 1); // -1 as we're 0 based.

      $kb.events.all($paginate.limit, startRecord, $paginate.filters).then(function (results) {

        var rowsWindow = document.getElementById('kbViewerWindow');
        rowsWindow.scrollTop = 0;

        // Process Events
        $scope.events = results;

        $paginate.current = target;
        $rootScope.showLoader = false;
      }, function (err) {});
    }
  };

  /**
   * Open modal for new dialog
   *
   * @param $event
   */
  $scope.newReference = function ($event) {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/events/events.edit.html',
      locals: {
        action: 'new',
        event: {}
      },
      multiple: true,
      clickOutToClose: false,
      controller: 'knowledgebase.events.edit'
    }).then(
    // Save Filters
    function (result) {

      if (result.status === 'new') {
        // New Entry Added, refresh!
        $paginate.refresh();
        $mdToast.show($mdToast.simple({ textContent: 'New entry successfully added' }));
      }
    },
    // Cancel
    function () {});
  };

  $paginate.calcPages();
  $scope.paginate = $paginate;
}]);
'use strict';

app.controller('knowledgebase.references.edit', ['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.pubmed', 'api.kb.associations', 'api.knowledgebase', 'api.user', 'action', 'reference', 'vocabulary', function (_, $q, scope, $mdDialog, $mdToast, $complete, $pubmed, $kbAssoc, $kb, $user, action, reference, vocabulary) {

  scope.$alterations = $complete.get('alterations');
  scope.disableRefTitle = false;
  scope.reference = angular.copy(reference);
  scope.reference.context = _.join(scope.reference.context, ';');
  scope.reference.disease_list = _.join(scope.reference.disease_list, ';');
  scope.formAction = action === 'new' ? 'Create' : 'Modify';
  scope.vocabulary = vocabulary;
  scope.user = $user._me;
  scope.action = action;

  scope.disease = {};
  scope.disease.all = [];
  scope.disease.new = '';
  scope.disease.all = reference.disease_list;

  scope.context = {};
  scope.context.all = [];
  scope.context.new = '';
  scope.context.all = reference.context;

  console.log(scope.context, reference);

  console.log(scope.reference);
  console.log('User', $user);

  scope.stages = [{ title: 'Event Statement', description: 'Characterization details', id: "matching", ordinal: 0 }, { title: 'Reference Details', description: 'Specifics about the source', id: "reference", ordinal: 1 }];
  var activeStage = scope.activeStage = 0;

  scope.$knowledgebase = $complete.get('knowledgebase');

  scope.events = {
    valid: false,
    dirty: true,
    pristine: true
  };

  scope.lastStage = function () {
    scope.activeStage--;
  };
  scope.nextStage = function () {
    var form = void 0;
    // Try to trigger submit...
    switch (scope.activeStage) {
      case 1:
        form = scope.referenceForm;
        break;
      case 0:
        form = scope.matching;
        break;
    }

    form.$setSubmitted();
    if (form.$valid) {
      scope.activeStage++;
    }

    console.log('Stage validity:', form.$valid, form);

    if (!form.$valid) $mdToast.show($mdToast.simple({ textContent: 'Please check all the fields for errors' }));
  };

  scope.submit = function () {
    scope.matching.$setSubmitted();

    if (!scope.matching.$valid) $mdToast.show($mdToast.simple({ textContent: 'Please check all the fields for errors' }));

    // All are valid
    if (scope.matching.$valid) {

      scope.reference.disease_list = _.join(scope.disease.all, ';');
      scope.reference.context = _.join(scope.context.all, ';');

      // Send updated entry to API
      if (action === 'new') {
        // Submit new entry
        $kb.references.create(scope.reference).then(function (newEntry) {
          $mdDialog.hide({ status: 'new', data: newEntry });
        }, function (err) {
          console.log('Unable to create entry', err);
          $mdToast.show($mdToast.simple({ textContent: 'Unable to add new entry. Please try again. If this continues to fail, please leave feedback.' }));
        });
      } else {
        // Update Existing Entry
        $kb.references.update(scope.reference).then(function (updateEntry) {
          console.log('Entry saved', updateEntry);
          $mdDialog.hide({ status: 'update', data: updateEntry });
        }, function (err) {
          console.log('Unable to update entry', err);
          $mdToast.show($mdToast.simple({ textContent: 'Unable to update the entry. Please try again. If this continues to fail, please leave feedback.' }));
        });
      }
    }
  };

  // Close Dialog
  scope.cancel = function () {
    $mdDialog.cancel('No changes have been made.');
  };

  // Filter Auto-compelte for relevances
  scope.findRelevance = function (searchText) {
    return searchText ? scope.$alterations.association.filter(filterFunction(searchText)) : scope.$alterations.association;
  };

  // Filter Auto-compelte for relevances
  scope.findDisease = function (searchText) {
    return searchText ? scope.$alterations.disease.filter(filterFunction(searchText)) : scope.$alterations.disease;
  };

  // Autocomplete Filter
  var filterFunction = function filterFunction(query) {

    var lowerCaseQuery = angular.lowercase(query); // Prep input to lowercase

    // Return search function
    return function (entry) {
      return entry.indexOf(lowerCaseQuery) > -1;
    };
  };

  // Check for pubmed entry if set
  scope.checkPMID = function () {

    // Disable loading bar
    scope.refLoading = false;

    if (scope.reference.id_type !== 'pubmed') return;
    if (scope.reference.ref_id === null || scope.reference.ref_id === '') return;

    // Define PubMed ID
    var pmid = void 0;

    pmid = scope.reference.ref_id.match(/^[0-9]{2,9}/)[0];

    // Show reference loading bar
    scope.refLoading = true;

    // Get PMID and process
    $pubmed.article(pmid).then(function (article) {
      scope.disableRefTitle = true;
      scope.reference.id_title = article.title;
      scope.reference.id_type = 'pubmed';
      scope.refLoading = false;
    }, function (err) {
      console.log('Unable to retrieve PubMed Article: ', err);
    });
  };

  // When the modal opens, watch for the events-expression value to load and validate it.
  scope.$watch('matching.events_expression', function (newval, oldval) {

    // Are we transitioning from an empty form to a prefilled?
    if ((oldval === undefined || oldval === null) && newval !== undefined && newval !== null) {
      scope.validateKBEvents();
    } else {
      // If not, are we just looking at a normal typing change?
      if (scope.events.pristine) scope.validateKBEvents();
    }

    // If the previous value was null/undefined, mark as no longer pristine.
    if (newval !== null && newval !== undefined) scope.events.pristine = false;
  });

  // Auto-complete filter
  scope.disease.add = function (entry) {
    if (scope.disease.all === undefined) scope.disease.all = [];
    if (entry === null || entry === "") return;
    scope.disease.all.push(entry);
    scope.disease.new = null;
  };
  scope.disease.remove = function (i) {
    scope.disease.all.splice(i, 1);
  };

  // Auto-complete filter
  scope.context.add = function (entry) {
    if (scope.context.all === undefined) scope.context.all = [];
    if (entry === null || entry === "") return;
    scope.context.all.push(entry);
    scope.context.new = null;
  };
  scope.context.remove = function (i) {
    scope.context.all.splice(i, 1);
  };

  scope.disease.filter = function (query) {
    var deferred = $q.defer();
    if (query.length < 3) deferred.resolve([]);

    if (query.length >= 3) {
      $kb.diseaseOntology(query).then(function (entries) {
        deferred.resolve(entries);
      }, function (err) {
        console.log('Unable to search for disease-ontology entries', err);
      });
    }
    return deferred.promise;
  };

  // Validate KB Events string
  scope.validateKBEvents = function () {
    scope.events.dirty = true;
    scope.events.valid = false;

    if (scope.reference.events_expression === '' || scope.reference.events_expression === undefined || scope.reference.events_expression === null) {
      scope.events.dirty = false;
      scope.events.valid = false;
      return;
    }

    // Try to validate
    $kb.validate.events(scope.reference.events_expression).then(function (result) {
      scope.events.dirty = false;
      scope.events.valid = true;
    }, function (err) {
      scope.events.dirty = false;
      scope.events.valid = false;
    });
  };
}]); // End controller
'use strict';

app.controller('knowledgebase.references.filter', ['$q', '_', '$scope', '$mdDialog', 'api.knowledgebase', 'vocabulary', 'filters', function ($q, _, scope, $mdDialog, $kb, vocabulary, filters) {

  scope.cancel = function () {
    $mdDialog.hide();
  };

  // Setup starting place filters
  scope.filter = filters;
  if (!scope.filter.disease_list) scope.filter.disease_list = [];
  if (!scope.filter.context) scope.filter.context = [];
  if (!scope.filter.evidence) scope.filter.evidence = [];
  if (!scope.filter.events_expression) scope.filter.events_expression = [];

  // Set Vocab
  scope.vocabulary = vocabulary;
  scope.new = {
    values: {
      disease_list: null,
      context: null,
      evidence: null,
      events_expression: null
    }
  };

  // Transform chip for auto complete
  scope.transformChip = function (disease) {
    // If it is an object, it's already a known chip
    if (angular.isObject(disease)) return disease;

    // Otherwise, create a new one
    return { disease: disease, type: 'new' };
  };

  // Auto-complete search filter
  scope.disease = { search: [] };
  scope.disease.filter = function (query) {
    var deferred = $q.defer();
    if (query.length < 3) deferred.resolve([]);

    if (query.length >= 3) {
      $kb.diseaseOntology(query).then(function (entries) {
        deferred.resolve(entries);
      }, function (err) {
        console.log('Unable to search for disease-ontology entries', err);
      });
    }
    return deferred.promise;
  };

  // New Freeform Entry
  scope.new.action = function (type) {
    if (scope.new.values[type] === null || scope.new.values[type] === undefined) return null;

    // Create new Disease entry filter
    scope.filter[type].push(scope.new.values[type]);
    scope.disease.search[scope.disease.search.length] = scope.new.values[type];
    scope.new.values[type] = null;
  };

  // Remove filter entry
  scope.removeFilterEntry = function (type, index) {
    scope.filter[type].splice(index, 1);
  };

  scope.save = function () {
    $mdDialog.hide(scope.filter);
  };
}]);
'use strict';

app.controller('knowledgebase.references', ['$rootScope', '$q', '_', '$scope', '$sanitize', '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'references', 'ref_count', 'vocabulary', function ($rootScope, $q, _, $scope, $sanitize, $mdDialog, $mdToast, $kbUtils, $kb, references, ref_count, vocabulary) {

  $scope.references = [];

  // Toggle Events Expression Dropper
  $scope.showEvExDropper = function (ref) {
    if (ref.events_expression_expanded.ors.length > 1 || ref.events_expression_expanded.ands.length > 1) ref.showEEs = !ref.showEEs;
  };

  // Toggle Dropper
  $scope.showDropper = function (arr, toggle, sw) {
    if (arr.length > 1) toggle[sw] = !toggle[sw];
  };

  // Determine if this reference has children
  $scope.hasChildren = function (ref) {
    return ref.events_expression_expanded.ors.length > 1 || ref.events_expression_expanded.ands.length > 1;
  };

  $scope.threeLetter = function (str) {
    return str.substring(0, 3);
  };

  // Open Filters Modal
  $scope.openFilters = function ($event) {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.filter.html',
      locals: {
        filters: $paginate.filters,
        vocabulary: vocabulary
      },
      clickOutToClose: false,
      controller: 'knowledgebase.references.filter'
    }).then(
    // Save Filters
    function (filters) {
      $paginate.setFilters(filters); // Updated Filters
      $paginate.updateFilters(); // Refresh Pagination
    },
    // Cancel
    function () {});
  };

  $scope.search = {};
  $scope.search.go = function () {
    $paginate.filters.search = $scope.search.query;
    $paginate.refresh();
  };

  // Open Filters Modal
  $scope.openView = function ($event, reference) {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.view.html',
      locals: {
        reference: reference,
        vocabulary: vocabulary
      },
      resolve: {
        history: ['$q', 'api.knowledgebase', function ($q, $kb) {
          return $kb.history('reference', reference.ident);
        }]
      },
      clickOutToClose: false,
      controller: 'knowledgebase.references.view'
    }).then(
    // Save Filters
    function () {},
    // Cancel
    function () {});
  };

  var $paginate = {
    current: 1, // current page
    limit: 100, // # of records per page
    offset: 0, // Current offset
    pages: 0, // Total Pages
    records: ref_count.references, // Total References,
    filters: {}, // Filters

    /**
     * Setup the page count
     */
    calcPages: function calcPages() {
      $paginate.pages = _.ceil(parseInt($paginate.records) / $paginate.limit);
    },

    /**
     * Pages to display
     *
     * @returns {object} - Returns object with min, max properties.
     */
    displayPages: function displayPages() {
      var min = $paginate.current - 3 < 1 ? 1 : $paginate.current - 3;
      var upperPad = min < 3 ? 4 - min : 0;
      var max = $paginate.current + (4 + upperPad) > $paginate.pages ? $paginate.pages : $paginate.current + (4 + upperPad);
      var pages = [];

      for (var i = min; i < max; i++) {
        pages.push(i);
      }

      return pages;
    },

    /**
     * Update Count
     */
    updateCount: function updateCount() {
      $kb.references.count($paginate.filters).then(function (count) {
        $paginate.records = count.references;
        $paginate.calcPages(); // Recount Pages
      }, function (err) {});
    },

    /**
     * Set Filters
     *
     * @param {object} filters - Hashmap of filter query values
     */
    setFilters: function setFilters(filters) {
      var newFilters = {};
      _.forEach(filters, function (value, filter) {
        if (value.length > 0) newFilters[filter] = value;
      });

      // Did the user clear the filters?
      if (_.size(newFilters) === 0) return $paginate.filters = {};

      $paginate.filters = newFilters;
    },

    /**
     * Updated filters
     */
    updateFilters: function updateFilters() {
      $paginate.updateCount();
      $paginate.changePage(1);
    },

    /**
     * Refresh current page
     */
    refresh: function refresh() {
      $paginate.changePage($paginate.current); // Trigger change page with current value
    },

    /**
     * Remove a filter
     *
     * @param {string} filter - The filter type to be spliced
     * @param {int} i - The array ID to be spliced
     */
    removeFilter: function removeFilter(filter, i) {
      $paginate.filters[filter].splice(i, 1);
      // If it's now empty, remove it
      if ($paginate.filters[filter].length === 0) delete $paginate.filters[filter];
      $paginate.updateFilters(); // Refresh Pagination
    },

    /**
     * Change Page
     */
    changePage: function changePage(target) {

      $rootScope.showLoader = true;

      // Attempt to load the next page
      var startRecord = $paginate.limit * (target - 1); // -1 as we're 0 based.

      $kb.references.all($paginate.limit, startRecord, $paginate.filters).then(function (results) {

        var rowsWindow = document.getElementById('kbViewerWindow');
        rowsWindow.scrollTop = 0;

        // Process References
        $scope.references = $kbUtils.processReferences(results);

        $paginate.current = target;
        $rootScope.showLoader = false;
      }, function (err) {});
    }
  };

  /**
   * Open modal for new dialog
   *
   * @param $event
   */
  $scope.newReference = function ($event) {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.edit.html',
      locals: {
        action: 'new',
        vocabulary: vocabulary,
        reference: {}
      },
      multiple: true,
      clickOutToClose: false,
      controller: 'knowledgebase.references.edit'
    }).then(
    // Save Filters
    function (result) {

      if (result.status === 'new') {
        // New Entry Added, refresh!
        $paginate.refresh();
        $mdToast.show($mdToast.simple({ textContent: 'New entry successfully added' }));
      }
    },
    // Cancel
    function () {});
  };

  // Loop over references and process groups
  $scope.references = $kbUtils.processReferences(references);

  $paginate.calcPages();
  $scope.paginate = $paginate;
}]);
'use strict';

app.controller('knowledgebase.references.view', ['$q', '_', '$scope', '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'reference', 'history', 'vocabulary', function ($q, _, scope, $mdDialog, $mdToast, $kbUtils, $kb, reference, history, vocabulary) {

  scope.reference = reference;
  scope.history = history;
  scope.vocabulary = vocabulary;

  scope.cancel = function () {
    $mdDialog.hide();
  };

  scope.editingStatus = false;
  scope.toggleEdit = function () {
    console.log('Triggering');
    scope.editingStatus = !scope.editingStatus;
  };

  scope.edit = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.edit.html',
      locals: {
        reference: reference,
        action: 'edit',
        vocabulary: vocabulary
      },
      multiple: true,
      clickOutToClose: false,
      controller: 'knowledgebase.references.edit'
    }).then(
    // Save Filters
    function (result) {
      if (result.status === 'update') {

        console.log('Updated reference', result);

        scope.reference = $kbUtils.processReferences(result.data);
        scope.reference = result.data;
        reference = scope.reference;

        $kb.history('reference', scope.reference.ident).then(function (history) {
          scope.history = history;
        }, function (err) {
          console.log('Unable to retrieve updated history.');
        });

        $mdToast.show($mdToast.simple({ textContent: 'The entry has been updated' }));
      }
    },
    // Cancel
    function () {
      $mdToast.show($mdToast.simple({ textContent: 'No changes were saved' }));
    });
  };

  // Update Reference Status
  scope.updateStatus = function () {

    // Send status update
    $kb.references.status(scope.reference, scope.reference.status, scope.update.comments).then(function (result) {
      // Update Result
      scope.reference = $kbUtils.processReferences(result)[0];

      // Update History
      $kb.history('reference', scope.reference.ident).then(function (history) {
        scope.history = history;
      }, function (err) {
        console.log('Unable to retrieve updated history.');
      });

      scope.editingStatus = false;
      $mdToast.show($mdToast.simple({ textContent: 'The entry has been updated' }));
    }, function (err) {
      console.log('Unable to update reference status');
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.report.genomic', ['_', '$q', '$scope', '$state', '$timeout', '$window', 'api.pog', 'pog', 'report', '$mdDialog', '$mdToast', function (_, $q, $scope, $state, $timeout, $window, $pog, pog, report, $mdDialog, $mdToast) {

  $scope.pog = pog;
  $scope.report = report;

  $scope.openPrint = function () {
    // State go!
    $window.open($state.href('print.POG.report.genomic', { POG: pog.POGID, analysis_report: report.ident }), '_blank');
  };

  $scope.sections = [{
    name: 'Analyst Comments',
    state: 'analystComments',
    meta: false,
    showChildren: false,
    clinician: true,
    children: []
  }, {
    name: 'Pathway Analysis',
    state: 'pathwayAnalysis',
    meta: false,
    showChildren: false,
    clinician: true,
    children: []
  }, {
    name: 'Potential Therapeutic Targets',
    state: 'therapeutic',
    meta: false,
    showChildren: false,
    clinician: true,
    children: []
  }, {
    name: 'Presentation',
    state: 'presentation',
    meta: false,
    showChildren: false,
    clinician: true,
    children: [{ name: 'Additional Information', state: 'slide' }, { name: 'Discussion Notes', state: 'discussion' }]
  }, {
    name: 'Detailed Genomic Analysis',
    state: null,
    meta: false,
    showChildren: false,
    clinician: true,
    category: true,
    children: [{ name: 'Knowledgebase Matches', state: 'knowledgebase' }, { name: 'DNA Repair', state: null, disabled: true }, { name: 'Microbial', state: 'microbial' }, { name: 'Spearman', state: 'spearman' }, { name: 'HRD', state: 'hrd', disabled: true }, { name: 'Disease Specific', state: 'diseaseSpecificAnalysis' }]
  }, {
    name: 'Somatic',
    state: null,
    meta: false,
    showChildren: false,
    clinician: true,
    category: true,
    children: [{ name: 'Small Mutations', state: 'smallMutations' }, { name: 'Copy Number Variants', state: 'copyNumberAnalyses' }, { name: 'Structural Variants', state: 'structuralVariation' }]
  }, {
    name: 'Expression',
    state: 'expressionAnalysis',
    meta: false,
    showChildren: false,
    clinician: true,
    children: []
  }, {
    name: 'Appendices',
    state: 'appendices',
    meta: false,
    showChildren: false,
    clinician: true,
    children: []
  }, {
    name: 'History',
    state: 'history',
    meta: true,
    showChildren: false,
    clinician: false,
    children: []
  }, {
    name: 'Report Settings',
    state: 'meta',
    meta: true,
    showChildren: false,
    clinician: false,
    children: []
  }];

  /**
   * Check if the provided state is the current one
   *
   * @param state
   * @returns {boolean}
   */
  $scope.activeSection = function (state) {
    if ($state.current.name.indexOf(state) > -1) {
      return true;
    }
    return false;
  };

  $scope.goToReportSection = function (goto) {

    $state.go('dashboard.reports.pog.report.genomic.' + goto);
  };

  /**
   * Open export modal
   *
   */
  $scope.openExport = function ($event) {
    $mdDialog.show({
      controller: 'controller.dashboard.report.genomic.history.export',
      templateUrl: 'dashboard/report/genomic/history/history.export.html',
      targetEvent: $event,
      locals: { pog: pog },
      clickOutsideToClose: false
    }).then(function (result) {
      // Result of hidden
    }, function () {
      // Closed
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.pog.report.listing', ['_', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'reports', 'pog', function (_, $scope, $state, $pog, $image, $userSettings, user, reports, pog) {

  $scope.user = user;
  $scope.$state = $state;
  $scope.reports = _.sortBy(reports, ['createdAt']).reverse();
  $scope.pog = pog;
}]);
'use strict';

app.controller('controller.dashboard.report.probe', ['_', '$q', '$scope', '$state', '$timeout', '$window', 'api.pog', 'pog', 'report', function (_, $q, $scope, $state, $timeout, $window, $pog, pog, report) {

  $scope.pog = pog;

  $scope.openPrint = function () {
    // State go!
    $window.open($state.href('print.POG.report.probe', { POG: pog.POGID, analysis_report: report.ident }), '_blank');
  };

  /**
   * Check if the provided state is the current one
   *
   * @param state
   * @returns {boolean}
   */
  $scope.activeSection = function (section) {
    if ($state.current.name.indexOf(section.state) > -1) {
      return true;
    }
    return false;
  };

  $scope.goToReportSection = function (goto) {

    $state.go('^.' + goto);
  };
}]);
'use strict';

app.controller('controller.dashboard.reports.clinician', ['_', '$q', '$rootScope', '$scope', '$state', 'reports', function (_, $q, $rootScope, $scope, $state, reports) {

  $scope.reports = _.orderBy(reports.reports, ['pog.POGID', 'createdAt'], ['desc', 'desc']);

  $scope.pagination = {
    offset: 0,
    limit: 25,
    total: reports.total
  };
}]);
'use strict';

app.controller('controller.dashboard.reports.dashboard', ['_', '$q', '$rootScope', '$scope', '$state', 'reports', function (_, $q, $rootScope, $scope, $state, reports) {

  reports = _.orderBy(reports, ['state', 'patientInformation.caseType', 'analysis.pog.POGID'], ['asc', 'desc', 'asc']);

  $scope.currentCases = reports;
  $scope.upstreamCases = [];

  $rootScope.$watch('_clinicianMode', function (newVal, oldVal) {
    if (newVal) $state.go('dashboard.reports.genomic');
  });
}]);
'use strict';

app.controller('controller.dashboard.reports.genomic', ['_', '$q', '$rootScope', '$scope', 'api.pog_analysis_report', 'reports', '$mdDialog', 'user', '$userSettings', 'projects', function (_, $q, $rootScope, $scope, $report, reports, $mdDialog, user, $userSettings, projects) {

  $scope.reports = reports = _.orderBy(reports, ['analysis.pog.POGID', 'createdAt'], ['asc', 'desc']);
  $scope.archived = false;
  $scope.nonproduction = false;
  $scope.loading = false;
  $scope.selectedProject = $userSettings.get('selectedProject') === undefined ? null : $userSettings.get('selectedProject');

  $scope.roles = ['bioinformatician', 'analyst', 'reviewer', 'admin', 'clinician'];

  $scope.projects = projects;

  $scope.states = {
    ready: true,
    active: true,
    presented: true,
    archived: false,
    nonproduction: false
  };

  // Clinician Mode Override
  if ($rootScope._clinicianMode) {
    $scope.selectedProject = 'POG';
    if ($userSettings.get('selectedProject') === undefined) $userSettings.save('selectedProject', 'POG');
    $scope.states = {
      ready: false,
      active: false,
      presented: true,
      archived: true,
      nonproduction: false
    };
  }

  $scope.filter = {
    currentUser: $userSettings.get('genomicReportListCurrentUser') === undefined ? true : $userSettings.get('genomicReportListCurrentUser'),
    query: null
  };

  if ($userSettings.get('genomicReportListCurrentUser') === undefined) $userSettings.save('genomicReportListCurrentUser', true);

  $scope.numReports = function (state) {
    return _.filter(reports, { state: state }).length;
  };

  $scope.$watch('filter.currentUser', function (newVal, oldVal) {
    // Ignore onload message
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('genomicReportListCurrentUser', newVal);
  });

  $scope.$watch('selectedProject', function (newVal, oldVal) {
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('selectedProject', newVal);
  });

  $scope.refreshList = function () {
    var states = [];
    _.each($scope.states, function (v, k) {
      if (v) states.push(k);
    });
    $scope.loading = true;
    $report.all({ all: !$scope.filter.currentUser, query: $scope.filter.query, role: $scope.filter.role, states: _.join(states, ','), type: 'genomic', project: $scope.selectedProject }).then(function (result) {
      $scope.loading = false;
      $scope.reports = reports = result;
      $scope.reports = reports = _.orderBy(result, ['analysis.pog.POGID', 'createdAt'], ['asc', 'desc']);
      associateUsers();
    }, function (err) {
      console.log('Unable to get reports', err);
    });
  };

  var associateUsers = function associateUsers() {
    // Filter Users For a POG
    _.forEach($scope.reports, function (r, i) {
      // Loop over pogusers
      $scope.reports[i].myRoles = _.filter(r.users, { user: { ident: user.ident } });
    });
  };

  associateUsers();

  $scope.searchPogs = function (state, query) {

    return function (report) {

      if (!query) query = "";

      // Define Return result
      var result = false;

      // Run over each split by space
      _.forEach(query.split(' '), function (q) {

        if (report.state !== state) return false;

        if (q.length === 0) return result = true;

        // Pog ID?
        if (report.analysis.pog.POGID.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Tumour Type
        if (report.patientInformation !== null && report.patientInformation.tumourType && report.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Tumour Type & Ploidy Model
        //if(pog.patientInformation.tumourType && pog.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;
        if (!report.tumourAnalysis) return;

        if (report.tumourAnalysis && report.tumourAnalysis.ploidy && report.tumourAnalysis.ploidy.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Comparators
        if (report.tumourAnalysis && report.tumourAnalysis.diseaseExpressionComparator && report.tumourAnalysis.diseaseExpressionComparator.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true; // Disease
        if (report.tumourAnalysis && report.tumourAnalysis.normalExpressionComparator && report.tumourAnalysis.normalExpressionComparator.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true; // Normal

        // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
        if (q.toLowerCase().indexOf('tc>') !== -1) report.tumourAnalysis.tumourContent > parseInt(_.last(q.split('>'))) ? result = true : null;
        if (q.toLowerCase().indexOf('tc<') !== -1) report.tumourAnalysis.tumourContent < parseInt(_.last(q.split('<'))) ? result = true : null;
        if (q.toLowerCase().indexOf('tc=') !== -1) report.tumourAnalysis.tumourContent === parseInt(_.last(q.split('='))) ? result = true : null;

        // Search Users
        _.forEach(report.users, function (p) {
          if (p.user.firstName.indexOf(q) > -1) result = true;
          if (p.user.lastName.indexOf(q) > -1) result = true;
          if (p.user.username.indexOf(q) > -1) result = true;
        });
      });

      return result;
    };
  };

  $scope.filterFn = function (pogInput) {
    console.log(pogInput);
    return true;
  };

  // Show Dialog with searching tips
  $scope.showFilterTips = function ($event) {

    var alert = $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('POG Searching Tips').htmlContent("The search bar can filter the listing of POGs using a number of special terms. <ul><li>Filter by tumour content: <code>tc>50 tc<40 tc=35</code></li><li>Filter by POG: <code>pog544</code></li><li>By ploidy: <code>diploid</code></li><li>By user involved: <code>bpierce</code>, <code>Brandon</code></li> <li>By disease: <code>melanoma</code></li> <li>By comparators: <code>BRCA</code>, <code>breast</code></li></ul>").ok('Got it!').targetEvent($event));
  };
}]);
'use strict';

app.controller('controller.dashboard.reports.probe', ['_', '$q', '$scope', 'api.pog_analysis_report', 'reports', '$mdDialog', 'user', '$userSettings', function (_, $q, $scope, $report, reports, $mdDialog, user, $userSettings) {

  $scope.reports = reports;
  $scope.archived = false;
  $scope.nonproduction = false;
  $scope.loading = false;

  $scope.roles = ['bioinformatician', 'analyst', 'reviewer', 'admin', 'clinician'];

  $scope.states = {
    uploaded: true,
    signedoff: true,
    reviewed: false,
    nonproduction: false
  };

  $scope.filter = {
    currentUser: $userSettings.get('probeReportListCurrentUser') === undefined ? true : $userSettings.get('probeReportListCurrentUser'),
    query: null
  };

  if ($userSettings.get('probeReportListCurrentUser') === undefined) $userSettings.save('probeReportListCurrentUser', true);

  $scope.numReports = function (state) {
    return _.filter(reports, { state: state }).length;
  };

  $scope.$watch('filter.currentUser', function (newVal, oldVal) {
    // Ignore onload message
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('probeReportListCurrentUser', newVal);
  });

  $scope.refreshList = function () {

    var states = [];
    _.each($scope.states, function (v, k) {
      if (v) states.push(k);
    });

    $scope.loading = true;
    $report.all({ all: !$scope.filter.currentUser, query: $scope.filter.query, role: $scope.filter.role, states: _.join(states, ','), type: 'probe' }).then(function (result) {
      $scope.loading = false;
      $scope.reports = reports = result;
      associateUsers();
    }, function (err) {
      console.log('Unable to get pogs', err);
    });
  };

  var associateUsers = function associateUsers() {
    // Filter Users For a POG
    _.forEach($scope.reports, function (r, i) {
      // Loop over pogusers
      $scope.reports[i].myRoles = _.filter(r.users, { user: { ident: user.ident } });
    });
  };

  associateUsers();

  $scope.searchPogs = function (state, query) {

    return function (report) {
      if (!query) query = "";

      // Define Return result
      var result = false;

      // Run over each split by space
      _.forEach(query.split(' '), function (q) {

        if (report.state !== state) return false;

        if (q.length === 0) return result = true;

        // Pog ID?
        if (report.analysis.pog.POGID.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        if (report.patientInformation !== null && report.patientInformation.tumourType && report.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Tumour Type & Ploidy Model
        //if(pog.patientInformation.tumourType && pog.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;
        if (!report.tumourAnalysis) return;
        if (report.tumourAnalysis && report.tumourAnalysis.ploidy && report.tumourAnalysis.ploidy.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
        if (q.toLowerCase().indexOf('tc>') !== -1) report.tumourAnalysis.tumourContent > parseInt(_.last(q.split('>'))) ? result = true : null;
        if (q.toLowerCase().indexOf('tc<') !== -1) report.tumourAnalysis.tumourContent < parseInt(_.last(q.split('<'))) ? result = true : null;
        if (q.toLowerCase().indexOf('tc=') !== -1) report.tumourAnalysis.tumourContent === parseInt(_.last(q.split('='))) ? result = true : null;

        // Search Users
        _.forEach(report.users, function (p) {
          if (p.user.firstName.indexOf(q) > -1) result = true;
          if (p.user.lastName.indexOf(q) > -1) result = true;
          if (p.user.username.indexOf(q) > -1) result = true;
        });
      });

      return result;
    };
  };

  $scope.filterFn = function (pogInput) {
    console.log(pogInput);
    return true;
  };

  // Show Dialog with searching tips
  $scope.showFilterTips = function ($event) {

    var alert = $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('POG Searching Tips').htmlContent("The search bar can filter the listing of POGs using a number of special terms. <ul><li>Filter by tumour content: <code>tc>50 tc<40 tc=35</code></li><li>Filter by POG: <code>pog544</code></li><li>By tumour type: <code>brca</code></li><li>By ploidy: <code>diploid</code></li><li>By user involved: <code>bpierce</code>, <code>Brandon</code></li> <li>By disease: <code>melanoma</code></li> </ul>").ok('Got it!').targetEvent($event));
  };
}]);
'use strict';

app.controller('controller.print.POG.report.probe', ['_', '$scope', 'pog', 'report', function (_, $scope, pog, report) {

  $scope.report = report;
  $scope.pog = pog;
}]);
'use strict';

app.controller('controller.print.POG.report.genomic', ['_', '$scope', '$timeout', '$sce', 'pog', 'report', function (_, $scope, $timeout, $sce, pog, report) {

  //$scope.pathwayAnalysis = pathway;
  $scope.samples = [];
  $scope.report = report;
  $scope.pog = pog;
}]);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

app.controller('controller.dashboard.tracking.board', ['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', '$interval', '$mdDialog', '$mdToast', '$userSettings', 'states', 'definitions', 'myDefinitions', 'api.socket', function ($q, _, $scope, $definition, $state, $task, $interval, $mdDialog, $mdToast, $userSettings, states, definitions, myDefinitions, socket) {

  $scope.allDefinitions = definitions; // All definitions for picking from
  $scope.definitions = myDefinitions; // Definitions set by user
  $scope.sortedStates = {};
  $scope.filter = {
    hidden: false,
    state: $userSettings.get('tracking.state') ? $userSettings.get('tracking.state') : { status: ['active', 'pending', 'hold', 'failed'] },
    definition: $userSettings.get('tracking.definition') ? $userSettings.get('tracking.definition') : { slug: ['projects', 'sequencing', 'bioapps'], hidden: false }
  };
  $scope.refreshing = false;
  $scope.tracking_loading = false;

  socket.on('taskStatusChange', function (task) {

    var s = _.findKey($scope.sortedStates[task.state.slug], function (s) {
      return s.ident === task.state.ident;
    });

    var t = _.findKey($scope.sortedStates[task.state.slug][s].tasks, function (t) {
      return t.ident === task.ident;
    });

    $scope.sortedStates[task.state.slug][s].tasks[t] = task;
  });

  // Sort States
  var sortStates = function sortStates(statesInput) {

    $scope.sortedStates = {};

    _.forEach(statesInput, function (s) {
      if (!$scope.sortedStates[s.slug]) $scope.sortedStates[s.slug] = [];
      $scope.sortedStates[s.slug].push(s);
    });
  };

  $scope.toggleDefFilter = function (def) {
    if ($scope.filter.definition.slug.indexOf(def.slug) > -1) {
      $scope.filter.definition.slug.splice($scope.filter.definition.slug.indexOf(def.slug), 1);
    } else {
      $scope.filter.definition.slug.push(def.slug);
    }
  };

  $scope.searchPogs = function (definition, query) {

    return function (state) {
      if (!query) query = "";

      // Define Return result
      var result = false;

      // Run over each split by space
      _.forEach(query.split(' '), function (q) {

        if (q.length === 0) return result = true;

        // Pog ID?
        if (state.analysis.pog.POGID.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;
      });

      return result;
    };
  };

  // When the options panel closes, refresh the cases
  $scope.$watch('showOptions', function (newVal, oldVal) {
    if (oldVal === true && newVal === false) $scope.refreshList();
  });

  /**
   * Reload tracking data from API
   *
   * @param {boolean} ninja - If true, do the update transparently
   */
  $scope.refreshList = function () {
    var ninja = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var opts = {
      hidden: $scope.filter.hidden,
      slug: _.join($scope.filter.definition.slug, ',')
    };

    if (!ninja) $scope.refreshing = true;
    $scope.tracking_loading = true;

    $definition.all(opts).then(function (result) {
      $scope.definitions = result;

      if (!ninja) $userSettings.save('tracking.definition', $scope.filter.definition);

      $state.all({ status: _.join($scope.filter.state.status, ','), slug: _.join($scope.filter.definition.slug, ',') }).then(function (result) {
        sortStates(result);
        $scope.refreshing = false;
        $scope.tracking_loading = false;

        if (!ninja) $userSettings.save('tracking.state', $scope.filter.state);
      }).catch(function (err) {
        console.log('Failed to get updated tracking data: ', err);
        $mdToast.showSimple('Unable to get latest tracking data');
      });
    }, function (err) {
      console.log('Failed to get updated definitions', err);
    });
  };

  // Open modal for new tracking
  $scope.trackNewPOG = function ($event) {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/tracking/board/board.new.html',
      controller: ['$q', 'scope', 'api.lims', 'api.pog', 'api.tracking', function ($q, scope, $lims, $pog, $tracking) {

        scope.cancel = function () {
          $mdDialog.cancel();
        };

        scope.submit = function (f) {
          // Check Validation
          console.log('Check validation of form', f);

          if (scope.track.POGID === undefined || scope.track.POGID === null) scope.track.POGID = scope.searchQuery;
          if (_typeof(scope.track.POGID) === 'object') scope.track.POGID = scope.track.POGID.POGID;

          if (_typeof(scope.track.disease) === 'object') scope.track.disease = scope.track.disease.text;

          // Submit data to API
          $tracking.init(scope.track).then(function (result) {

            // Add new states to array
            $mdDialog.hide({ states: result });
          }, function (err) {
            console.log('Failed to init tracking', err);
          });
        };

        // Search Users with auto complete
        scope.searchDisease = function (searchText) {

          return $q(function (resolve, reject) {
            if (searchText.length === 0) return [];

            $lims.diseaseOntology(searchText).then(function (resp) {

              resolve(resp.results);
            }, function (err) {
              console.log(err);
              reject();
            });
          });
        };

        // Search Users with auto complete
        scope.searchPOGs = function (searchText) {

          return $q(function (resolve, reject) {
            if (searchText.length === 0) return [];

            $pog.all({ query: searchText, all: true }).then(function (resp) {

              resolve(resp);
            }, function (err) {
              console.log(err);
              reject();
            });
          });
        };
      }]
    })
    // Modal closed
    .then(
    // Successfully
    function (result) {

      // Take result, merge with existing and sort
      states = states.concat(result.states);
      sortStates(states);

      $mdToast.show($mdToast.simple().textContent('Tracking successfully initialized.'));
    },
    // Canceled
    function () {
      $mdToast.show($mdToast.simple().textContent('No tracking initialized.'));
    });
  };

  sortStates(_.orderBy(states, ['status', 'analysis.pog.POGID'], ['asc', 'desc']));

  // Start polling states for updates
  /*$interval(() => {
    $scope.refreshList(true);
  }, 30000); */
}]);
'use strict';

app.controller('controller.dashboard.tracking.lane.checkin', ['_', '$scope', '$q', '$mdDialog', '$mdToast', 'moment', 'api.tracking.state', 'api.tracking.task', 'api.user', 'api.jira', 'state', 'task', function (_, $scope, $q, $mdDialog, $mdToast, $moment, $state, $task, $user, $jira, state, task) {

  $scope.state = state;
  $scope.task = task;
  $scope.checkin = { outcome: null };
  $scope.states = ['pending', 'active', 'complete', 'hold', 'failed', 'cancelled'];

  $scope.date = moment().toISOString();

  /**
   * Update status for task
   * @param {string} status
   */
  $scope.updateStatus = function (status) {

    // Update the task's state
    var updateTask = angular.copy($scope.task);

    updateTask.status = status;

    $task.update(updateTask).then(function (result) {
      $scope.task = task = result;

      // Update state
      updateStateTask(task);
    }, function (err) {
      console.log('Failed to update task', err);
    });
  };

  $scope.cancel = function () {
    $mdDialog.cancel({ state: $scope.state });
  };

  $scope.close = function () {
    $mdDialog.hide({ state: $scope.state });
  };

  /**
   * Update the task definition in state.tasks[]
   * @param task
   */
  var updateStateTask = function updateStateTask(task) {
    // Find and update task row in state
    var i = _.findIndex(state.tasks, { ident: task.ident });
    $scope.state.tasks[i] = state.tasks[i] = $scope.task;
  };

  /**
   * Revoke a check-in
   *
   * @param {object} checkin
   */
  $scope.revokeCheckin = function (checkin) {
    $task.revokeCheckin(task.ident, checkin.ident).then(function (result) {
      var i = _.findIndex($scope.task.checkins, { ident: checkin.ident });

      task.checkins.splice(i, 1);
      $scope.task = task;

      // Update in state
      updateStateTask(task);

      $mdToast.showSimple('Task check-in has been revoked.');
    }).catch(function (err) {
      $mdToast.showSimple('Unable to remove the task check-in.');
    });
  };

  /**
   * Add new Checkin
   *
   */
  $scope.checkin = function () {

    // If date, reformat
    if (task.outcomeType === 'date') {
      $scope.checkin.outcome = moment($scope.checkin.outcome).toISOString();
    }

    // Building check-in body
    $task.checkInTaskIdent(task.ident, $scope.checkin.outcome).then(function (result) {
      $scope.task = task = result;

      // Update in state
      updateStateTask(task);
    }, function (err) {

      var message = "";
      message += "Failed to perform checkin.";

      if (err.data.error && err.data.error.cause && err.data.error.cause.error && err.data.error.cause.error.message) {
        message += " Reason: " + err.data.error.cause.error.message;
      }

      $mdToast.showSimple(message);
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.tracking.lane', ['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', 'api.socket', '$mdDialog', '$mdToast', 'lane', 'states', function ($q, _, $scope, $definition, $state, $task, $socket, $mdDialog, $mdToast, lane, states) {

  $scope.lane = lane;
  $scope.states = _.orderBy(states, ['status', 'analysis.pog.POGID'], ['asc', 'desc']);
  $scope.cols = [];
  $scope.showFilter = false;
  $scope.focusFilter = false;

  $scope.displayFilter = function () {
    $scope.showFilter = true;
    $scope.focusFilter = true;
  };

  // Create Task Columns
  _.forEach(states, function (s) {
    _.forEach(s.tasks, function (t) {
      if (!_.find($scope.cols, { slug: t.slug })) {
        $scope.cols.push(t);
      }
    });
  });

  $scope.cols = _.orderBy($scope.cols, 'ordinal');
  $scope.getStateTask = function (state, col) {

    var search = _.find(state.tasks, { slug: col.slug });

    if (!search) return null;

    return search;
  };

  /**
   * Open Task check-in editor
   *
   * @param {object} state - State object
   * @param {object} task - Task object
   */
  $scope.editValue = function (state, task) {

    $mdDialog.show({
      controller: 'controller.dashboard.tracking.lane.checkin',
      templateUrl: 'dashboard/tracking/board/board.lane.checkin.html',
      locals: {
        task: task,
        state: state
      }
    }).then(function (result) {
      if (result.state) {
        var i = _.findIndex(states, { ident: result.state.ident });
        if (i) $scope.states[i] = states[i] = result.state;
      }
    }).catch(function (err) {
      $mdToast.showSimple('No changes where saved.');
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.tracking.assignment', ['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', 'api.analysis', 'api.jira', '$interpolate', '$mdDialog', '$mdToast', 'definition', 'states', 'group', 'userLoad', 'ticket_templates', function ($q, _, $scope, $definition, $state, $task, $analysis, $jira, $interpolate, $mdDialog, $mdToast, definition, states, group, userLoad, ticket_templates) {

  $scope.definition = definition;
  $scope.assign = {};
  $scope.group = group;
  $scope.states = _.orderBy(states, ['status', 'analysis.pog.POGID'], ['asc', 'desc']);
  $scope.userLoad = userLoad;
  $scope.ticket_templates = ticket_templates;
  $scope.ticket = {
    create: true,
    template: ticket_templates.length > 0 ? ticket_templates[0].ident : null
  };

  // Click state becomes active
  $scope.selectState = function (state) {
    $scope.assign = state;
    if (state.jira) $scope.ticket.create = false;
  };

  // Cancel editing the selected state
  $scope.cancelAnalysis = function () {
    $scope.assign = {};
    $mdToast.show($mdToast.simple().textContent('No changes have been saved.'));
  };

  // The select all checkbox state has changed
  $scope.selectAllChanged = function () {
    _.forEach($scope.assign.taskSelection, function (v, i) {
      $scope.assign.taskSelection[i] = $scope.selectAll;
    });
  };

  // Toggle row selection for task
  $scope.clickToggle = function (value) {
    return value = !value;
  };

  // Simple get percentage with floor
  $scope.getFloor = function (value) {
    return Math.floor(value);
  };

  // Submit new assignments for all checked tasks
  $scope.assignUsers = function (task) {

    // Lock assign button
    $scope.assign.submitting = true;

    var promises = [];

    var selectedUser = _.find(group.users, { ident: $scope.assign.user }).username;

    _.forEach($scope.assign.taskSelection, function (set, task) {
      if (set) promises.push($task.assignUser(task, $scope.assign.user));
    });

    $q.all(promises).then(function (result) {

      // Load users, apply and get updated values
      $definition.userLoad(definition.ident).then(function (ul) {
        $scope.userLoad = userLoad = ul;

        // Create Ticket
        if ($scope.ticket.create) {
          generateTicket($scope.assign.analysis, $scope.assign.tasks).then(function (result) {

            result.options.assignee = selectedUser;

            $jira.ticket.create(result.project, result.type, result.summary, result.description, result.options).then(function (result) {
              $scope.ticket.created = result;
              $scope.assign.submitting = false;
              $scope.assign.jira = { ticket: result.key };

              $state.update($scope.assign.ident, $scope.assign).then(function (result) {
                console.log('Updated state!', result);
              }).catch(function (err) {
                console.log('Unable to save ticket to state', err);
              });
            }).catch(function (err) {
              $mdToast.showSimple('Failed to create JIRA ticket!');
              console.log('Failed to create JIRA ticket');
              console.log(err);
            });
          });
        }

        // Not creating a ticket
        if (!$scope.ticket.create) {
          $scope.assign.submitting = false;
        }

        $mdToast.show($mdToast.simple().textContent('The selected user has been bound'));
        $scope.UserAssignment.$setPristine();

        _.forEach(result, function (t) {

          _.forEach($scope.assign.tasks, function (at, i) {

            if (t.ident === at.ident) $scope.assign.tasks[i] = t;
          });
        });

        // Reset list of tasks checkboxes
        _.forEach($scope.assign.taskSelection, function (uc, k) {
          $scope.assign.taskSelection[k] = false;
        });
        // Reset all Checkbox
        $scope.selectAll = false;
      }, function (err) {
        console.log('Unable to load userLoad details');
      });

      // Create JIRA ticket
      if ($scope.assign.jira === null) {}
    }, function (err) {
      console.log('Failed to update tasks:', err);
    });
  };

  var generateTicket = function generateTicket(analysis, tasks) {
    return $q(function (resolve, reject) {

      var response = { description: null, summary: null };
      var template = _.find(ticket_templates, { ident: $scope.ticket.template });

      response.project = template.project;
      response.type = template.issueType;
      response.options = {
        labels: template.tags,
        components: _.map(template.components, function (c) {
          return { name: c };
        })
      };

      if (template.security) response.security = true;

      // Call API to get extended
      $analysis.extended(analysis.ident).then(function (result) {

        response.summary = $interpolate(template.summary)(result);
        //let body = $interpolate(template.body)(result);

        response.description = "";
        response.description += "^This ticket has been automatically regenerated by IPR. Any manual edits made to it will not be preserved^\n";
        response.description += "h2. Case Details\n";
        response.description += "|| {{patient}} || {{threeLetterCode}} ||\n";
        response.description += "| Priority | " + parsePriority(analysis.priority) + " |\n";
        response.description += "| Disease | {{disease}} |\n";
        response.description += "| Biopsy Details | {{biopsy_notes}} |\n";
        response.description += "| Age | {{age}} |\n";
        response.description += "| Sex | {{sex}} |\n";
        response.description += "| Biopsy | {{biop}} |\n";
        response.description += "| Normal Library | {{lib_normal}} |\n";
        response.description += "| Tumour Library | {{lib_tumour}} ({{pool_tumour}}) |\n";
        response.description += "| RNA Library | {{lib_rna}} ({{pool_rna}}) |\n";

        response.description += "\\\\ \n";

        response.description += "{panel:title=" + definition.name + " |borderStyle=solid|borderColor=#ccc|titleBGColor=#f5f5f5|bgColor=#FFFFFF}\n";
        response.description += template.body + "\n";
        response.description += "{panel}\n\n";

        response.description += "h2. Progress\n";
        response.description += "|| Task || Status || Result ||\n";

        _.forEach(tasks, function (t) {
          response.description += "| " + t.name + "| " + parseStatus(t.status).string + " |" + (t.checkins.length > 0 ? t.checkins[0].outcome : '-') + "|\n";
        });

        response.description += "\n\n";

        response.description += '| ' + parseStatus('pending').string + ' Pending | ' + parseStatus('active').string + ' Active | ' + parseStatus('complete').string + ' Complete | ' + parseStatus('failed').string + ' Failed | ' + parseStatus('hold').string + ' Hold |\n\n';

        response.description += "{panel:title=Case Notes|borderStyle=solid|borderColor=#ccc|titleBGColor=#f5f5f5|bgColor=#FFFFFF}\n";
        response.description += "None.\n";
        response.description += "{panel}\n\n\n";

        response.description = $interpolate(response.description)(result);

        resolve(response);
      }).catch(function (err) {
        $mdToast.showSimple('Error: Failed to get necessary details to create ticket ' + err.data.message);
        console.log('Failed to generate ticket body & template');
        console.log(err);
      });
    });
  };

  $scope.preview_ticket = function (analysis, tasks) {

    $mdDialog.show({
      templateUrl: 'dashboard/tracking/assignment/assignment.ticket_preview.html',
      controller: ['$scope', function (scope) {

        var template = _.find(ticket_templates, { ident: $scope.ticket.template });

        scope.analysis = analysis;
        scope.definition = definition;
        scope.loading = true;
        scope.extended = null;
        scope.tasks = tasks;
        scope.summary = null;
        scope.body = null;

        // Call API to get extended
        $analysis.extended(analysis.ident).then(function (result) {

          //let parsed_template_summary = $compile('<span>' + template.summary + '</span>')(result);
          scope.summary = $interpolate(template.summary)(result);
          scope.body = $interpolate(template.body)(result);

          scope.loading = false;
          scope.extended = result;
        }).catch(function (err) {
          $mdToast.showSimple('Error: Failed to get necessary details to create ticket ' + err.data.message);
          $mdDialog.cancel();
          console.log('Failed to get extended analysis results', err);
        });

        // Close Dialog
        scope.close = function () {
          $mdDialog.hide();
        };

        // Map Parse Status function from parent
        scope.parseStatus = parseStatus;

        // Map Parse Priority function from parent
        scope.parsePriority = parsePriority;
      }]
    });
  };

  var parseStatus = function parseStatus(status) {

    var response = void 0;

    switch (status) {
      case 'pending':
        response = { string: '(off)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/lightbulb.png' };
        break;
      case 'active':
        response = { string: '(on)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/lightbulb_on.png' };
        break;
      case 'complete':
        response = { string: '(/)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/check.png' };
        break;
      case 'hold':
        response = { string: '(!)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/warning.png' };
        break;
      case 'failed':
      case 'cancelled':
        response = { string: '(x)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/error.png' };
        break;
    }

    return response;
  };

  var parsePriority = function parsePriority(priority) {
    if (priority === 1) return 'low';
    if (priority === 2) return 'Normal';
    if (priority === 3) return 'High';
  };
}]);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

app.controller('controller.dashboard.tracking.ticket_template', ['$rootScope', '$scope', '$q', '_', '$mdToast', 'api.tracking.ticket_template', 'api.jira', 'definition', 'templates', function ($rootScope, $scope, $q, _, $mdToast, $template, $jira, definition, templates) {

  $scope.definition = definition;
  $scope.templates = templates;
  $scope.editing = {};

  $scope.variables = [{ name: 'Patient ID', tag: 'patient' }, { name: 'Patient Sex', tag: 'sex' }, { name: 'Patient Age', tag: 'age' }, { name: 'Normal Library', tag: 'lib_normal' }, { name: 'Tumour Library', tag: 'lib_tumour' }, { name: 'Tumour Pool', tag: 'pool_tumour' }, { name: 'RNA Library', tag: 'lib_rna' }, { name: 'RNA Pool', tag: 'pool_rna' }, { name: 'Disease', tag: 'disease' }, { name: 'Biopsy Notes', tag: 'biopsy_notes' }, { name: 'BioApps Biop#', tag: 'biop' }, { name: 'Num RNA lanes Seq\'d', tag: 'num_lanes_rna' }, { name: 'Num Tumour lanes Seq\'d', tag: 'num_lanes_tumour' }, { name: 'RNA Sequencer', tag: 'sequencer_rna' }, { name: 'Tumour Sequencer', tag: 'sequencer_tumour' }, { name: 'Priority', tag: 'priority' }, { name: 'Presenter', tag: 'presenter' }, { name: 'BioFXician', tag: 'biofxician' }, { name: 'Analysis Due', tag: 'analysis_due' }];

  $scope.insertVar = function (v) {
    $rootScope.$broadcast('insertText', '{{' + v + '}}');
  };

  /**
   * Select an existing template to modify
   *
   * @param {object} template - Load template into form for editing
   */
  $scope.selectTemplate = function (template) {
    $scope.editing = template;
    $scope.editing.new = false;

    if (template.security === 10010) $scope.editing.pog_restricted = true;

    $scope.getProject(template.project);
  };

  /**
   * Setup form to create new template
   *
   */
  $scope.newTemplate = function () {
    $scope.editing = { name: null, new: true, body: "", tags: [] };
  };

  /**
   * Cancel editing
   *
   */
  $scope.cancelEditing = function () {
    $scope.editing = {};
    $mdToast.show($mdToast.simple().textContent('No changes have been saved.'));
  };

  /**
   * Search JIRA project namespaces
   *
   * @param searchText
   * @returns {Promise}
   */
  $scope.searchProjects = function (searchText) {
    return $q(function (resolve, reject) {
      if (searchText.length === 0) return [];

      $jira.projects.all(searchText).then(function (resp) {
        resolve(_.filter(resp, function (r) {
          if (r.key.toLowerCase().indexOf(searchText.toLowerCase()) > -1 || r.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1) return r;
        }));
      }).catch(function (err) {
        console.log(err);
        reject();
      });
    });
  };

  /**
   * Get Components
   *
   */
  $scope.getProject = function () {

    if ($scope.editing.project === undefined || $scope.editing.project === null) {
      return [];
    }

    if (!$scope.editing.components) $scope.editing.components = [];

    var projectKey = null;

    if (_typeof($scope.editing.project) === 'object') projectKey = $scope.editing.project.key;
    if (typeof $scope.editing.project === 'string') projectKey = $scope.editing.project;

    $jira.projects.get(projectKey).then(function (project) {
      $scope.components = project.components;
      $scope.issueTypes = project.issueTypes;
    }).catch(function (err) {
      console.log('Failed to retrieve components', err);
    });

    $jira.priority().then(function (priorities) {
      $scope.priorities = priorities;
    }).catch(function (err) {
      console.log('Failed to retrieve ticket priorities', err);
    });

    /*
      !! This endpoint does not support CORS retrieval.
    $jira.projects.getSecurityLevels($scope.editing.project.id)
      .then((levels) => {
        // Check for POG-Restricted security level
        let found = _.find(levels, {name: 'POG Restricted'});
        
        $scope.pogRestricted = (found);
        console.log('The project has a secured setting?', $scope.pogRestricted);
        
      })
      .catch((err) => {
      
      });
    */
  };

  $scope.removeTemplate = function () {

    // If it's never been persisted, clear the form.
    if ($scope.editing.new) {
      $scope.editing = {};
      return;
    }

    $template.remove(definition.ident, $scope.editing.ident).then(function (res) {

      // Find and remove entry
      var i = _.findIndex($scope.templates, { ident: $scope.editing.ident });
      delete $scope.templates[i];
      templates = $scope.templates;

      // Reset Form
      $scope.editing = {};
    }).catch(function (err) {});
  };

  $scope.save = function (f) {
    console.log('Submitted form', f, $scope.editing);

    // Remap Project Key
    if (_typeof($scope.editing.project) === 'object' && $scope.editing.project.key) $scope.editing.project = $scope.editing.project.key;
    if (typeof $scope.editing.project !== 'string') return $mdToast.showSimple('There was a problem with the project name.');

    if ($scope.editing.pog_restricted) $scope.editing.security = 10010;

    if ($scope.editing.new) {

      $template.create(definition.ident, $scope.editing).then(function (template) {
        $scope.templates.push(template);
        $scope.editing = {};
        $mdToast.showSimple('The ticket template has been saved.');
      }).catch(function (err) {
        $mdToast.showSimple('Failed to save the ticket template.');
      });
    }

    if (!$scope.editing.new) {

      $template.update(definition.ident, $scope.editing).then(function (template) {
        // Find existing and replace
        var i = _.findIndex($scope.templates, { ident: template.ident });

        $scope.templates[i] = template;
        templates = $scope.templates;

        $mdToast.showSimple('The ticket template has been saved.');
      }).catch(function (err) {
        $mdToast.showSimple('Failed to save the ticket template.');
      });
    }
  };
}]);
'use strict';

app.controller('controller.dashboard.tracking.definition.hook', ['$scope', '_', '$interpolate', '$mdDialog', '$mdToast', 'api.tracking.hook', 'tasks', 'hook', 'definition', function ($scope, _, $interpolate, $mdDialog, $mdToast, $hook, tasks, hook, definition) {

  $scope.hook = hook;
  $scope.tasks = tasks;
  $scope.showConfirmDelete = false; // By default do not show the remove confirmation button
  $scope.new = !hook.ident;

  $scope.hook.target_string = _.join(hook.target, ', ');

  $scope.cancel = function () {
    $mdDialog.cancel({ event: 'cancel' });
  };

  $scope.remove = function () {

    if (!$scope.hook.ident) $mdDialog.cancel();

    $hook.remove($scope.hook.ident).then(function () {
      $mdDialog.cancel({ event: 'remove', hook: $scope.hook, ident: $scope.hook.ident });
    }).catch(function (e) {
      $mdToast.showSimple('Failed to remove hook.');
    });
  };

  $scope.submit = function (f) {

    // Recreate target list
    $scope.hook.target = $scope.hook.target_string.split(',').map(function (i) {
      console.log(i.trim());return i.trim();
    });

    // Create or Save
    if (hook.ident && hook.ident.length > 0) {
      // Save

      $hook.update(hook.ident, hook).then(function (resp) {
        $mdDialog.hide(resp);
      }).catch(function (e) {
        $mdToast.showSimple('Failed to update the hook: ' + e.data.message);
      });
    } else {

      $scope.hook.state_name = definition.slug;
      // Create
      $hook.create(hook).then(function (resp) {
        $mdDialog.hide(resp);
      }).catch(function (e) {
        $mdToast.showSimple('Failed to create the hook: ' + e.data.message);
      });
    }
  };
}]);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

app.controller('controller.dashboard.tracking.definition', ['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', '$mdDialog', '$mdToast', 'definitions', 'groups', 'hooks', function ($q, _, $scope, $definition, $state, $task, $mdDialog, $mdToast, definitions, groups, hooks) {

  $scope.definitions = _.sortBy(definitions, 'ordinal');

  $scope.editing = {};
  $scope.groups = groups;
  $scope.hooks = hooks;

  $scope.selectDefinition = function (definition) {
    $scope.editing = definition;
    $scope.editing.new = false;
  };

  $scope.newDefinition = function () {
    $scope.editing = { name: null, new: true, tasks: [] };
  };

  $scope.cancelEditing = function () {
    $scope.editing = {};
    $mdToast.show($mdToast.simple().textContent('No changes have been saved.'));
  };

  $scope.getHooksByState = function (state) {
    return _.filter($scope.hooks, { state_name: state });
  };

  $scope.openHook = function (hook) {

    $mdDialog.show({
      templateUrl: 'dashboard/tracking/definition/definition.hook.html',
      controller: 'controller.dashboard.tracking.definition.hook',
      locals: {
        hook: hook,
        tasks: $scope.editing.tasks,
        definition: $scope.editing
      }
    }).then(function (h) {
      if (!_.find($scope.hooks, { ident: h.ident })) $scope.hooks.push(h);
    }).catch(function (e) {
      if (!e) e = { event: 'cancel' };

      switch (e.event) {
        case 'remove':
          var i = _.findKey($scope.hooks, { ident: e.ident });
          $scope.hooks.splice(i, 1);
          break;
      }
    });
  };

  // Save Definitions editor form
  $scope.save = function () {

    // Validate Form

    // Get Group Ident
    $scope.entry = angular.copy($scope.editing);
    $scope.entry.group = $scope.editing.group;

    // Updating or Editing
    if ($scope.editing.new) {

      $scope.editing.ordinal = $scope.definitions.length + 1;

      $definition.create($scope.entry).then(function (result) {
        $scope.definitions.push(result);
        $scope.editing = {};
      }, function (err) {
        console.log('Failed to create definition');
        $mdToast.show($mdToast.simple('Failed to create new definition'));
      });
    } else {

      // Submit to DB
      $definition.update($scope.editing.ident, $scope.entry).then(function (result) {

        // Find existing and replace
        var i = _.findIndex($scope.definitions, { ident: result.ident });

        $scope.definitions[i] = result;
        definitions = $scope.definitions;

        $mdToast.show($mdToast.simple().textContent('The definition has been saved'));
      }, function (err) {});
    }
  };

  // Open Task Editor
  $scope.taskEditor = function ($event) {
    var task = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/tracking/definition/definition.task.html',
      controller: ['$q', 'scope', function ($q, scope) {

        var taskCopy = angular.copy(task);

        scope.new = (typeof task === 'undefined' ? 'undefined' : _typeof(task)) !== "object";
        scope.task = (typeof task === 'undefined' ? 'undefined' : _typeof(task)) !== "object" ? { status: 'pending', checkInsTarget: 1 } : task;
        scope.taskIndex = i;

        scope.cancel = function () {
          $mdDialog.cancel();
          task = taskCopy;
        };

        scope.submit = function (f) {
          // Check Validation

          if (scope.new) $scope.editing.tasks.push(scope.task);

          $mdDialog.hide();
        };

        // Remove the current entry
        scope.remove = function () {

          $scope.editing.tasks.splice(i, 1);
          $mdDialog.hide();
        };
      }]
    });
  };

  // Update ordinal of definitions
  $scope.updateOrdinal = function () {

    // Array of promises to be watched
    var promises = [];

    // Loop over entries and set ordinal, then update entry
    _.forEach($scope.definitions, function (def, i) {

      $scope.definitions[i].ordinal = i + 1;

      // Update definitions
      promises.push($definition.update(def.ident, def));
    });

    $q.all(promises).then(function (result) {
      $mdToast.show($mdToast.simple().textContent('Updated order has been saved'));
    }, function (err) {
      console.log('Unable to update definition ordinals', err);
    });
  };
}]);
'use strict';

app.controller('controller.dashboard.tracking.definition.ticket', ['$scope', '_', '$interpolate', '$mdDialog', '$mdToast', 'api.jira', 'definition', function ($scope, _, $interpolate, $mdDialog, $mdToast, $jira, definition) {}]);
//# sourceMappingURL=app.js.map
