import get from 'lodash.get';

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
  async checkResource(name) {
    let permission = false;
    let resource;

    try {
      resource = get(this.resources, name);
    } catch (e) {
      return false;
    }

    /* Pull out the user's groups into an array */
    const userGroups = [];
    const user = await this.UserService.me();
    user.groups.forEach((entry) => {
      userGroups.push(entry.name.toLowerCase());
    });

    /* Get intersection of arrays, check allows first */
    const allowsIntersection = userGroups.filter((userGroup) => {
      return resource.allow.includes(userGroup);
    });

    if (resource.allow.includes('*')) {
      permission = true;
    }
    if (allowsIntersection && allowsIntersection.length > 0) {
      permission = true;
    }

    /* Get intersection of arrays, check rejects now */
    const rejectsIntersection = userGroups.filter((userGroup) => {
      return resource.reject.includes(userGroup);
    });

    /* Rejects takes priority over allows */
    if (rejectsIntersection && rejectsIntersection.length > 0) {
      permission = false;
    }

    return permission;
  }

  /**
   * Lookup if a user is in a group that allows them to perform a given action
   * @param {String} name - The action string to be parsed
   * @return {Promise} Boolean with if an action can be performed
   */
  async checkAction(name) {
    let permission = false;
    let action;

    try {
      action = get(this.actions, name);
    } catch (e) {
      return false;
    }

    /* Pull out the user's groups into an array */
    const userGroups = [];
    const user = await this.UserService.me();
    user.groups.forEach((entry) => {
      userGroups.push(entry.name.toLowerCase());
    });

    /* Get intersection of arrays, check allows first */
    const allowsIntersection = userGroups.filter((userGroup) => {
      return action.allow.includes(userGroup);
    });

    if (action.allow.includes('*')) {
      permission = true;
    }
    if (allowsIntersection && allowsIntersection.length > 0) {
      permission = true;
    }

    /* Get intersection of arrays, check rejects now */
    const rejectsIntersection = userGroups.filter((userGroup) => {
      return action.reject.includes(userGroup);
    });

    /* Rejects takes priority over allows */
    if (rejectsIntersection && rejectsIntersection.length > 0) {
      permission = false;
    }

    return permission;
  }

  /**
   * Is the user in a specified group
   * @param {String} group - Group to be checked for membership
   * @return {Promise} Boolean with if the user is in a group
   */
  async inGroup(group) {
    const user = await this.UserService.me();
    return user.groups.some(userGroup => group.toLowerCase() === userGroup.name.toLowerCase());
  }

  /**
   * Can the user access a specified POG (by project)
   * @param {String} pogID - POG to be checked for access
   * @return {Promise} Boolean with if the user can access a POG
   */
  async canAccessPOG(pogID) {
    const resp = await this.PogService.id(pogID);

    /* Check for intersection between user's projects and project needed for access */
    const projects = [];
    resp.projects.forEach((entry) => {
      projects.push(entry.name);
    });

    const user = await this.UserService.me();
    const intersection = user.projects.filter(userProject => projects.includes(userProject));

    /* Check if user has individual project access or is part of full access group */
    /* Intersection array will be empty if part of full access group */
    if (intersection.length > 0 || await this.inGroup('Full Project Access')) {
      return true;
    }
    return false;
  }

  /**
   * Check if the user is external
   * @return {Promise} Is external
   */
  async isExternalMode() {
    /* eslint-disable no-return-await */
    return (await this.inGroup('clinician') || await this.inGroup('collaborator'));
  }
}

export default AclService;
