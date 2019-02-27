class AlterationService {
  /* @ngInject */
  constructor() {
    this.dicts = {
  
      // Alterations
      alterations: {
        // Types
        type: {
          'biological': 'Biological',
          'diagnostic': 'Diagnostic',
          'prognostic': 'Prognostic',
          'therapeutic': 'Therapeutic',
          'unknown': 'Uncharacterized',
        },
        variant: [
          'CNV',
          'ELV-RNA',
          'ELV-PROT',
          'FANN',
          'MUT',
          'SV',
        ],
        evidence: {
          'case report': 'Case Report',
          'case series': 'Case Series',
          'clinical': 'Clinical',
          'clinical trials': 'Clinical Trials',
          'clinical-test': 'Clinical-Test',
          'FDA-approved': 'FDA-Approved',
          'inferred': 'Inferred',
          'literature-review': 'Literature-Review',
          'NCCN guidelines': 'NCCN Guidelines',
          'not specified': 'Not Specified',
          'pre-clinical': 'Pre-Clinical',
          'reported': 'Reported',
          'retrospective-clinical': 'Retrospective-Clinical',
          'curated': 'Curated',
        },
        disease: [
          'acute lymphocytic leukemia',
          'acute myeloid leukemia',
          'acute promyelocytic leukemia',
          'acute undifferentiated leukemia',
          'adenocarcinoma',
          'adrenocortical carcinoma',
          'adult sporadic papillary thyroid carcinoma',
          'aggressive systemic mastocytosis',
          'alveolar rhabdomyosarcoma',
          'anaplastic large cell lymphoma',
          'anaplastic oligodendroglioma',
          'anaplastic thyroid carcinoma',
          'aneurysmal bone cyst',
          'angiomatoid fibrous histiocytoma',
          'angiosarcoma',
          'B- and T-cell mixed leukemia',
          'B-cell acute lymphoblastic leukemia',
          'B-cell lymphoma',
          'basal cell carcinoma',
          'benign epithelial tumour',
          'benign melanocytic nevus',
          'biliary tract cancer',
          'bladder transitional cell carcinoma',
          'blue cell tumour',
          'bone Ewing\'s sarcoma',
          'brain cancer',
          'brain glioma',
          'breast cancer',
          'breast ductal carcinoma',
          'breast secretory carcinoma',
          'bronchiolo-alveolar adenocarcinoma',
          'Burkitt lymphoma',
          'carcinoma',
          'cellular schwannoma',
          'cervical cancer',
          'cholangiocarcinoma',
          'cholesteryl ester storage disease',
          'chondroid lipoma',
          'chondrosarcoma',
          'chronic eosinophilic leukemia',
          'chronic leukemia',
          'chronic lymphocytic leukemia',
          'chronic myeloid leukemia',
          'chronic myelomonocytic leukemia',
          'chronic myeloproliferative disease',
          'clear cell sarcoma',
          'collecting duct carcinoma',
          'colon cancer',
          'colorectal cancer',
          'congenital fibrosarcoma',
          'congenital mesoblastic nephroma',
          'cutaneous mastocytosis',
          'dermatofibrosarcoma protuberans',
          'desmoplastic small round cell tumour',
          'diffuse large B-cell lymphoma',
          'endometrial adenocarcinoma',
          'endometrial cancer',
          'endometrial stromal sarcoma',
          'epithelioid sarcoma-like hemangioendothelioma',
          'esophageal cancer',
          'esophagus squamous cell carcinoma',
          'estrogen-receptor positive breast cancer',
          'extraosseous Ewing\'s sarcoma',
          'extraskeletal myxoid chondrosarcoma',
          'familial adenomatous polyposis',
          'familial melanoma',
          'fibrosarcoma',
          'follicular lymphoma',
          'gallbladder adenocarcinoma',
          'gastric adenocarcinoma',
          'gastrointestinal stromal tumor',
          'germ cell cancer',
          'giant cell fibroblastoma',
          'glioblastoma multiforme',
          'haemangioma of the bone',
          'hairy cell leukemia',
          'head and neck cancer',
          'head and neck carcinoma',
          'head and neck squamous cell carcinoma',
          'hemangiopericytoma',
          'hemorrhagic thrombocythemia',
          'hepatocellular carcinoma',
          'hepatocellular fibrolamellar carcinoma',
          'Her2-receptor positive breast cancer',
          'high-grade ovarian serous carcinoma',
          'Hodgkin\'s lymphoma',
          'hypercalcemic type ovarian small cell carcinoma',
          'hypereosinophilic syndrome',
          'immunoblastic lymphoma',
          'indolent systemic mastocytosis',
          'inflammatory myofibroblastic tumor',
          'intrahepatic cholangiocarcinoma',
          'laryngeal carcinoma',
          'LEOPARD syndrome',
          'Li-Fraumeni syndrome',
          'lipoblastoma',
          'lipoma',
          'liposarcoma',
          'liposarcoma (with wildtype rb1 expression)',
          'low-grade fibromyxoid sarcoma',
          'low-grade glioma',
          'low-grade ovarian serous carcinoma',
          'lung adenocarcinoma',
          'lung adenoid cystic carcinoma',
          'lung cancer',
          'lung carcinoma',
          'lung large cell carcinoma',
          'lung small cell carcinoma',
          'lung squamous cell carcinoma',
          'lymphoma',
          'malignant pleural mesothelioma',
          'malignant spindle cell melanoma',
          'mammary analogue secretory carcinoma',
          'mantle cell lymphoma',
          'mast-cell leukemia',
          'mastocytosis',
          'medulloblastoma',
          'megakaryocytic leukemia',
          'melanoma',
          'mesenchymal chondrosarcoma',
          'mucinous adenocarcinoma',
          'mucoepidermoid carcinoma',
          'mucosal melanoma',
          'multiple myeloma',
          'myelodysplastic myeloproliferative cancer',
          'myelofibrosis',
          'myeloma',
          'myoepithelial tumour of soft tissue and bone',
          'myxoid chondrosarcoma',
          'nasopharyngeal angiofibroma',
          'nasopharynx carcinoma',
          'neuroblastoma',
          'neuroendocrine tumor',
          'nodular fasciitis',
          'non-small cell lung carcinoma',
          'Noonan syndrome',
          'not specified',
          'NUT midline carcinoma',
          'osteosarcoma',
          'ovarian cancer',
          'ovarian carcinoma',
          'ovarian clear cell carcinoma',
          'ovarian serous carcinoma',
          'ovary adenocarcinoma',
          'ovary epithelial cancer',
          'ovary serous adenocarcinoma',
          'pancreas adenocarcinoma',
          'pancreatic cancer',
          'pancreatic ductal adenocarcinoma',
          'pancreatic neuroendocrine tumor',
          'papillary renal cell carcinoma',
          'papillary thyroid carcinoma',
          'papillary transitional carcinoma',
          'pediatric acute myeloid leukemia',
          'pediatric fibrosarcoma',
          'pediatric primitive round cell sarcoma',
          'peripheral T-cell lymphoma',
          'peritoneal mesothelioma',
          'pilocytic astrocytoma',
          'pleomorphic salivary gland adenocarcinoma',
          'plexiform neurofibroma',
          'primary unknown',
          'progesterone-receptor positive breast cancer',
          'prostate cancer',
          'pulmonary myxoid sarcoma',
          'pulmonary sarcomatoid carcinoma',
          'rectosigmoid cancer',
          'renal cell carcinoma',
          'renal clear cell carcinoma',
          'retinoblastoma',
          'rhabdoid cancer',
          'rhabdomyosarcoma',
          'salivary gland adenoma',
          'salivary gland cancer',
          'salivary gland carcinoma',
          'salivary gland pleomorphic adenoma',
          'sarcoma',
          'sideroblastic anemia with ringed sideroblasts',
          'signet ring cell adenocarcinoma',
          'skin squamous cell carcinoma',
          'small round cell sarcoma',
          'spindle cell rhabdomyosarcoma',
          'squamous cell carcinoma',
          'stomach cancer',
          'synovial sarcoma',
          'systemic type anaplastic large cell lymphoma',
          'T-cell adult acute lymphocytic leukemia',
          'T-cell leukemia',
          'therapy-related myeloid neoplasia',
          'thymic carcinoma',
          'thyroid adenoma',
          'thyroid cancer',
          'transitional cell carcinoma',
          'urinary bladder cancer',
          'uterine corpus endometrial carcinoma',
          'uterine leiomyoma',
          'uveal melanoma',
          'vulva adenocarcinoma',
          'waldenstrom macroglobulinemia',
        ],
        association: [
          'acquired resistance',
          'activates-pathway',
          'associated-pathway',
          'associated-with',
          'cancer associated gene',
          'characteristic-of',
          'conditional loss-of-function',
          'cooperative-events',
          'diagnostic',
          'disruptive fusion',
          'dominant gain-of-function',
          'dominant negative',
          'eligibility',
          'equally-as-effective-as',
          'favourable',
          'gain-of-function',
          'haploinsufficient',
          'increased-function',
          'inferred FDA-approved',
          'inferred gain-of-function',
          'inferred loss-of-function',
          'inferred resistance',
          'inferred sensitivity',
          'inhibits-pathway',
          'less-effective-than',
          'likely gain-of-function',
          'likely oncogenic',
          'loss-of-function',
          'minimal resistance',
          'minimal sensitivity',
          'more-effective-than',
          'mutation hotspot',
          'no dominant negative',
          'no functional effect',
          'no gain-of-function',
          'no loss-of-function',
          'no resistance',
          'no response',
          'no sensitivity',
          'not determined',
          'not specified',
          'observed',
          'oncogene',
          'oncogenic fusion',
          'pathogenic',
          'putative disease-driver',
          'putative oncogene',
          'putative tumour suppressor',
          'recurrent',
          'reduced-function',
          'reduced-sensitivity',
          'resistance',
          'response',
          'sensitivity',
          'switch-of-function',
          'targetable',
          'test target',
          'tumour suppressor',
          'unfavourable',
          'weakly-increased-function',
          'weakly-reduced-function',
        ],
        zygosity: [
          'any',
          'ns',
          'homozygous',
          'heterozygous',
          'na',
        ],
        referenceTypes: [
          'ClinicalTrials.gov id',
          'curated database',
          'database',
          'doi',
          'other',
          'pmcid',
          'pubmed',
          'url',
        ],
      },
      knowledgebase: {
  
        sampleType: [
          'caenorhabditis elegans',
          'chicken',
          'drosophila melanogaster',
          'hamster',
          'human cell-line',
          'human patient',
          'human patient-cells',
          'human patient-xenograft',
          'mouse',
          'rat',
          'saccharomyces cerevisiae',
          'saccharomyces pombe',
        ],
        preClinicalModel: [
          'dominant negative',
          'inhibitor',
          'knockout',
          'mutant',
          'RNAi',
        ],
  
      },
    };
  }

  /**
    * Retrieve all analyses that user can access with options
    * @param {Object} getter - Object key to retrieve
    * @return {Promise} Resolves with array of reports
    * @throws {ErrorType} Thrown when API call fails
    */
  get(getter) {
    return this.dicts[getter];
  }
}
  
export default AlterationService;
