import get from 'lodash.get';

class AclService {
  /* @ngInject */
  constructor(UserService) {
    this.UserService = UserService;

    this.actions = { // Move this out to some sort of constants file eventually
      report: {
        view: {
          allow: ['*'],
          reject: [],
        },
        edit: {
          allow: ['admin', 'analyst', 'bioinformatician', 'manager'],
          reject: ['clinician', 'collaborator'],
        },
        remove: {
          allow: ['admin', 'manager'],
          reject: [],
        },
      },
    };

    this.resources = {
      report: {
        allow: ['*'],
      },
      germline: {
        allow: ['admin', 'analyst', 'bioinformatician', 'projects'],
      },
    };
  }

  /**
   * Global Permission Resource Lookup
   * @param {String} name - Resource name
   * @return {Promise} Boolean with if user is allowed to see resource
   */
  async checkResource(name) {
    let resource;

    try {
      resource = get(this.resources, name);
    } catch (e) {
      return false;
    }

    if (resource.allow.includes('*')) {
      return true;
    }

    const user = await this.UserService.me();
    return user.groups.some(entry => resource.allow.includes(entry.name.toLowerCase()));
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
    const allowsIntersection = userGroups.filter(userGroup => action.allow.includes(userGroup.toLowerCase()));

    if (action.allow.includes('*')) {
      permission = true;
    }
    if (allowsIntersection && allowsIntersection.length > 0) {
      permission = true;
    }

    /* Get intersection of arrays, check rejects now */
    const rejectsIntersection = userGroups.filter(userGroup => action.reject.includes(userGroup.toLowerCase()));

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
   * Check if the user is external
   * @return {Promise} Is external
   */
  async isExternalMode() {
    /* eslint-disable no-return-await */
    return (await this.inGroup('clinician') || await this.inGroup('collaborator'));
  }
}

export default AclService;
