/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.task', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/tracking/task';

  let $task = {};

  /**
   * Get all tracking state definitions
   *
   * @param {string} ident - Retrieve the task by ident
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $task.getByIdent = (ident) => {
    return $q((resolve, reject) => {

      $http.get(api + '/' + getByIdent).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

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
  $task.getTaskByState = (POGID, analysis, state, task) => {

    return $q((resolve, reject) => {

      $http.get(api + '/' + POGID + '/' + analysis + '/' + state + '/' + task).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

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
  $task.checkInTask = (POGID, analysis, state, task, outcome) => {

    return $q((resolve, reject) => {

      $http.patch(api + '/checkin/' + POGID + '/' + analysis + '/' + state + '/' + task, {outcome: outcome}).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )
    });
  };


  /**
   * Update a task's details
   *
   * @param {object} task - The updated task object to be submitted
   *
   * @returns {Promise} - Resolves with updated task
   */
  $task.update = (task) => {
    return $q((resolve, reject) => {

      $http.put(api + '/' + task.ident, task).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

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
  $task.checkInTaskIdent = (task, outcome) => {

    return $q((resolve, reject) => {

      $http.patch(api + '/checkin/' + task, {outcome: outcome}).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )
    });
  };


  /**
   * Revoke a checkin entry
   *
   * @param {string} task - The task ident
   * @param {string} datestamp - Datestamp key to be removed
   * @returns {Promise} - Resolves with updated task
   */
  $task.revokeCheckin = (task, datestamp) => {

    return $q((resolve, reject) => {

      $http.delete(api + '/checkin/' + task + '/' + datestamp).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

    });


  };

  return $task;

}]);
