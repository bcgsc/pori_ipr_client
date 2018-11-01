app.service('$acl', ['$q', '_', 'api.user', 'api.pog', ($q, _, $user, $pog) => {  
  const actions = {
    report: {
      view: {
        allow: ['*'],
        reject: []
      },
      edit: {
        allow: ['admin','analyst','bioinformatician','reviewer'],
        reject: ['clinician', 'collaborator']
      },
      remove: {
        allow: ['admin'],
        reject: []
      }
    },
    analyses: {
      view: {
        allow: ['*'],
        reject: ['clinician', 'collaborator']
      },
      edit: {
        allow: ['projects', 'admin'],
        reject: ['clinician', 'collaborator']
      },
      remove: {
        allow: ['projects', 'admin'],
        reject: []
      }
    },
    tracking: {
      view: {
        allow: ['*'],
        reject: ['clinician', 'collaborator']
      },
      edit: {
        allow: ['*'],
        reject: ['clinician', 'collaborator']
      },
      remove: {
        allow: ['projects', 'admin'],
        reject: []
      }
    }
  };
  
  const resources = {
    report: {
      allow: ['*'],
      reject: []
    },
    genomic_report: {
      allow: ['*'],
      reject: []
    },
    probe_report: {
      allow: ['*'],
      reject: []
    },
    knowledgebase: {
      allow: ['*'],
      reject: ['clinician']
    },
    germline: {
      allow: ['*'],
      reject: ['clinician', 'collaborator']
    },
    analyses: {
      allow: ['*'],
      reject: ['clinician', 'collaborator']
    },
    tracking: {
      allow: ['*'],
      reject: ['clinician', 'collaborator']
    },
  };

  const $acl = {
    resource,
    action,
    inGroup,
    canAccessPOG,
    isExternalMode,
  };
  return $acl;

  /**
   * Global Permission Resource Lookup
   *
   * @param {string} r - Resource name
   * @param {object} u - User object to override late user values from init promise
   *
   * @returns {boolean} - User is allowed to see resource
   */
  function resource(r) {
    let permission = false;
    let resource;
    
    try {
      resource = resources[r];
    } catch (e) {
      console.log('Failed to find resource: ', r);
      return false;
    }

    // Check Allows first
    let allows = _.intersection(resource.allow, _.map(_.mapValues($user.meObj.groups, (r) => { return {name: r.name.toLowerCase()}}), 'name'));
    if(resource.allow.indexOf('*') > -1) permission = true;
    if(allows && allows.length > 0) permission = true;


    // Check Rejections
    let rejects = _.intersection(resource.reject, _.map(_.mapValues($user.meObj.groups, (r) => { return {name: r.name.toLowerCase()}}), 'name'));
    if(resource.reject.indexOf('*') > -1) permission = false; // No clue why this would exist, but spec allows
    if(rejects && rejects.length > 0) permission = false;

    return permission;
  }

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
  function action(a, u=null) {
    let permission = false;
    let action;
    
    try {
      action = _.get(actions, a);
      let allow = action.allow;
      let reject = action.reject;
    }
    catch(e) {
      console.log('Failed to find action: ', a, e);
      return false;
  
    }
    
    // Check Allows first
    let allows = _.intersection(action.allow, _.map(_.mapValues($user.meObj.groups, (r) => { return {name: r.name.toLowerCase()}}), 'name'));
    if(action.allow.indexOf('*') > -1) permission = true;
    if(allows && allows.length > 0) permission = true;


    // Check Rejections
    let rejects = _.intersection(action.reject, _.map(_.mapValues($user.meObj.groups, (r) => { return {name: r.name.toLowerCase()}}), 'name'));
    if(action.reject.indexOf('*') > -1) permission = false; // No clue why this would exist, but spec allows
    if(rejects && rejects.length > 0) permission = false;

    return permission;
  }

  /**
   * Is the user in a specified group
   *
   * @param {string} group - Group to be checked for membership
   *
   */
  function inGroup(group) {
    return !!_.find($user.meObj.groups, (userGroup) => {
      return group.toLowerCase() === userGroup.name.toLowerCase();
    });
  }

  /**
   * Can the user access a specified POG (by project)
   *
   * @param {string} POGID - POG to be checked for access
   *
   */
  async function canAccessPOG(POGID) {
    try {
      const pogResp = await $pog.id(POGID);
      // check if user has individual project access or is part of full access group
      if (_.intersectionBy($user.meObj.projects, pogResp.projects, 'name').length > 0
        || _.find($user.meObj.groups, { name: 'Full Project Access' })) {
        return true;
      }
      return Promise.reject(new Error('projectAccessError'));
    } catch (err) {
      return Promise.reject(new Error(err.message));
    }
  }

  /**
   * Check if the user is external
   * @return {Promise} Is external
   */
  async function isExternalMode() {
    return inGroup('clinician') || inGroup('collaborator');
  }
}]);
