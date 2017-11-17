app.controller('controller.dashboard.tracking.assignment',
['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', 'api.analysis', 'api.jira', '$interpolate', '$mdDialog', '$mdToast', 'definition', 'states', 'group', 'userLoad', 'ticket_templates',
($q, _, $scope, $definition, $state, $task, $analysis, $jira, $interpolate, $mdDialog, $mdToast, definition, states, group, userLoad, ticket_templates) => {

  $scope.definition = definition;
  $scope.assign = {};
  $scope.group = group;
  $scope.states = states;
  $scope.userLoad = userLoad;
  $scope.ticket_templates = ticket_templates;
  $scope.ticket = {
    create: true,
    template: (ticket_templates.length > 0) ? ticket_templates[0].ident : null
  };

  // Click state becomes active
  $scope.selectState = (state) => {
    $scope.assign = state;
    if(state.jira) $scope.ticket.create = false;
  };

  // Cancel editing the selected state
  $scope.cancelAnalysis= () => {
    $scope.assign = {};
    $mdToast.show($mdToast.simple().textContent('No changes have been saved.'));
  };

  // The select all checkbox state has changed
  $scope.selectAllChanged = () => {
    _.forEach($scope.assign.taskSelection, (v, i) => {
      $scope.assign.taskSelection[i] = $scope.selectAll;
    });
  };

  // Toggle row selection for task
  $scope.clickToggle = (value) => {
    return value = !value;
  };

  // Simple get percentage with floor
  $scope.getFloor = (value) => {
    return Math.floor(value);
  };

  // Submit new assignments for all checked tasks
  $scope.assignUsers = (task) => {
    
    
    // Lock assign button
    $scope.assign.submitting = true;

    let promises = [];

    let selectedUser = _.find(group.users, {ident: $scope.assign.user}).username;
    
    _.forEach($scope.assign.taskSelection, (set, task) => {
      if(set) promises.push($task.assignUser(task, $scope.assign.user));
    });
    

    $q.all(promises).then(
      (result) => {

        // Load users, apply and get updated values
        $definition.userLoad(definition.ident).then(
          (ul) => {
            $scope.userLoad = userLoad = ul;
            
            // Create Ticket
            if($scope.ticket.create) {
              generateTicket($scope.assign.analysis, $scope.assign.tasks)
                .then((result) => {
      
                  result.options.assignee = selectedUser;
      
                  $jira.ticket.create(result.project, result.type, result.summary, result.description, result.options)
                    .then((result) => {
                      $scope.ticket.created = result;
                      $scope.assign.submitting = false;
                      $scope.assign.jira = {ticket: result.key};
                      
                      $state.update($scope.assign.ident, $scope.assign)
                        .then((result) => {
                          console.log('Updated state!', result);
                        })
                        .catch((err) => {
                          console.log('Unable to save ticket to state', err);
                        });
                      
                    })
                    .catch((err) => {
                      $mdToast.showSimple('Failed to create JIRA ticket!');
                      console.log('Failed to create JIRA ticket');
                      console.log(err);
                    });
      
                });
            }
            
            // Not creating a ticket
            if(!$scope.ticket.create) {
              $scope.assign.submitting = false;
            }
            
            
            $mdToast.show($mdToast.simple().textContent('The selected user has been bound'));
            $scope.assign.user = null;
            $scope.UserAssignment.$setPristine();

            _.forEach(result, (t) => {

              _.forEach($scope.assign.tasks, (at, i) => {

                if(t.ident === at.ident) $scope.assign.tasks[i] = t;

              });

            });


            // Reset list of tasks checkboxes
            _.forEach($scope.assign.taskSelection, (uc, k) => {
              $scope.assign.taskSelection[k] = false;
            });
            // Reset all Checkbox
            $scope.selectAll = false;

          },
          (err) => {
            console.log('Unable to load userLoad details');
          }
        );

        // Create JIRA ticket
        if($scope.assign.jira === null) {
        
        
        
        }
        

      },
      (err) => {
        console.log('Failed to update tasks:', err);
      }
    )

  };
  
  let generateTicket = (analysis, tasks) => {
    return $q((resolve, reject) => {
      
      let response = {description: null, summary: null};
      let template = _.find(ticket_templates, {ident: $scope.ticket.template});
      
      response.project = template.project;
      response.type = template.issueType;
      response.options = {
        labels: template.tags,
        components: _.map(template.components, (c) => { return {name: c}}),
        security: template.security
      };
      
      // Call API to get extended
      $analysis.extended(analysis.ident)
        .then((result) => {
  
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
          
          _.forEach(tasks, (t) => {
            response.description += "| " + t.name + "| " + parseStatus(t.status).string + " |" + ((t.checkins.length > 0) ? t.checkins[0].outcome : '-') + "|\n";
          });
          
          response.description += "\n\n";
  
          response.description += `| ${parseStatus('pending').string} Pending | ${parseStatus('active').string} Active | ${parseStatus('complete').string} Complete | ${parseStatus('failed').string} Failed | ${parseStatus('hold').string} Hold |\n\n`;
          
          response.description += "{panel:title=Case Notes|borderStyle=solid|borderColor=#ccc|titleBGColor=#f5f5f5|bgColor=#FFFFFF}\n";
          response.description += "None.\n";
          response.description += "{panel}\n\n\n";
          
          response.description = $interpolate(response.description)(result);
          
          resolve(response);
        })
        .catch((err) => {
          console.log('Failed to generate ticket body & template');
          console.log(err);
        })
      
    });
  };
  
  $scope.preview_ticket = (analysis, tasks) => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/tracking/assignment/assignment.ticket_preview.html',
      controller: ['$scope', (scope) => {
        
        let template = _.find(ticket_templates, {ident: $scope.ticket.template});
        
        
        
        scope.analysis = analysis;
        scope.definition = definition;
        scope.loading = true;
        scope.extended = null;
        scope.tasks = tasks;
        scope.summary = null;
        scope.body = null;
        
        // Call API to get extended
        $analysis.extended(analysis.ident)
          .then((result) => {
          
            //let parsed_template_summary = $compile('<span>' + template.summary + '</span>')(result);
            scope.summary = $interpolate(template.summary)(result);
            scope.body = $interpolate(template.body)(result);
          
            scope.loading = false;
            scope.extended = result;
          })
          .catch((err) => {
            console.log('Failed to get extended analysis results');
            console.log(err);
          });
        
        // Close Dialog
        scope.close = () => {
          $mdDialog.hide();
        };
        
        // Map Parse Status function from parent
        scope.parseStatus = parseStatus;
        
        // Map Parse Priority function from parent
        scope.parsePriority = parsePriority;
        
      }]
    })
    
  };
  
  let parseStatus = (status) => {
    
    let response;
    
    switch(status) {
      case 'pending':
        response = {string: '(off)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/lightbulb.png'};
        break;
      case 'active':
        response = {string: '(on)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/lightbulb_on.png'};
        break;
      case 'complete':
        response = {string: '(/)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/check.png'};
        break;
      case 'hold':
        response = {string: '(!)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/warning.png'};
        break;
      case 'failed':
      case 'cancelled':
        response = {string: '(x)', image: 'https://bcgsc.ca/jira/images/icons/emoticons/error.png'};
        break;
    }
    
    return response;
  };
  
  let parsePriority = (priority) => {
    if(priority === 1) return 'low';
    if(priority === 2) return 'Normal';
    if(priority === 3) return 'High';
  }


}]);