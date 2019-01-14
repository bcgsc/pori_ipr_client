class AclService {
  /* @ngInject */
  constructor(UserService, PogService) {
    this.UserService = UserService;
    this.PogService = PogService;

    this.actions = { // Move this out to some sort of constants file eventually
      report: {
        view: {
          allow: ['*'],
          reject: [],
        },
        edit: {
          allow: ['admin', 'analyst', 'bioinformatician', 'reviewer'],
          reject: ['clinician', 'collaborator'],
        },
        remove: {
          allow: ['admin'],
          reject: [],
        },
      },
      analyses: {
        view: {
          allow: ['*'],
          reject: ['clinician', 'collaborator'],
        },
        edit: {
          allow: ['projects', 'admin'],
          reject: ['clinician', 'collaborator'],
        },
        remove: {
          allow: ['projects', 'admin'],
          reject: [],
        },
      },
      tracking: {
        view: {
          allow: ['*'],
          reject: ['clinician', 'collaborator'],
        },
        edit: {
          allow: ['*'],
          reject: ['clinician', 'collaborator'],
        },
        remove: {
          allow: ['projects', 'admin'],
          reject: [],
        },
      },
    };

    this.resources = {
      report: {
        allow: ['*'],
        reject: [],
      },
      genomic_report: {
        allow: ['*'],
        reject: [],
      },
      probe_report: {
        allow: ['*'],
        reject: [],
      },
      knowledgebase: {
        allow: ['*'],
        reject: ['clinician'],
      },
      germline: {
        allow: ['*'],
        reject: ['clinician', 'collaborator'],
      },
      analyses: {
        allow: ['*'],
        reject: ['clinician', 'collaborator'],
      },
      tracking: {
        allow: ['*'],
        reject: ['clinician', 'collaborator'],
      },
    };
  }

  /**
   * Global Permission Resource Lookup
   * @param {String} name - Resource name
   * @return {Promise} Boolean with if user is allowed to see resource
   */
  checkResource(name) {
    let permission = false;
    let resource;

    try {
      resource = _.get(this.resources, name);
    } catch (e) {
      return false;
    }

    // Check Allows first
    const allows = _.intersection(resource.allow, _.map(_.mapValues(this.UserService.meObj.groups, (r) => { return { name: r.name.toLowerCase() }; }), 'name'));
    if (resource.allow.includes('*')) permission = true;
    if (allows && allows.length > 0) permission = true;

    // Check Rejections
    const rejects = _.intersection(resource.reject, _.map(_.mapValues(this.UserService.meObj.groups, (r) => { return { name: r.name.toLowerCase() }; }), 'name'));
    if (resource.reject.includes('*')) permission = false; // No clue why this would exist, but spec allows
    if (rejects && rejects.length > 0) permission = false;

    return permission;
  }

  /**
   * Lookup if a user is in a group that allows them to perform a given action
   * @param {String} name - The action string to be parsed
   * @return {Promise} Boolean with if an action can be performed
   */
  checkAction(name) {
    let permission = false;
    let action;

    try {
      action = _.get(this.actions, name);
    } catch (e) {
      return false;
    }
    // Check Allows first
    const allows = _.intersection(action.allow, _.map(_.mapValues(this.UserService.meObj.groups, (r) => { return { name: r.name.toLowerCase() }; }), 'name'));
    if (action.allow.includes('*')) permission = true;
    if (allows && allows.length > 0) permission = true;

    // Check Rejections
    const rejects = _.intersection(action.reject, _.map(_.mapValues(this.UserService.meObj.groups, (r) => { return { name: r.name.toLowerCase() }; }), 'name'));
    if (action.reject.includes('*')) permission = false; // No clue why this would exist, but spec allows
    if (rejects && rejects.length > 0) permission = false;
    return permission;
  }

  /**
   * Is the user in a specified group
   * @param {String} group - Group to be checked for membership
   * @return {Promise} Boolean with if the user is in a group
   */
  async inGroup(group) {
    return !!_.find(this.UserService.meObj.groups, (userGroup) => {
      return group.toLowerCase() === userGroup.name.toLowerCase();
    });
  }

  /**
   * Can the user access a specified POG (by project)
   * @param {String} pogID - POG to be checked for access
   * @return {Promise} Boolean with if the user can access a POG
   */
  async canAccessPOG(pogID) {
    const resp = await this.PogService.id(pogID);
    // check if user has individual project access or is part of full access group
    if (_.intersectionBy(this.UserService.meObj.projects, resp.projects, 'name').length > 0
      || _.find(this.UserService.meObj.groups, { name: 'Full Project Access' })) {
      return true;
    }
    return false;
  }

  /**
   * Check if the user is external
   * @return {Promise} Is external
   */
  async isExternalMode() {
    return await this.inGroup('clinician') || this.inGroup('collaborator');
  }
}

export default AclService;
