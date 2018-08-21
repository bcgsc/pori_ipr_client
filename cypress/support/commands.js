Cypress.Commands.add('login', (userType) => {
  cy.visit('login');
  if (userType === 'admin') {
    cy.get('#input_0').type(Cypress.env('ADMIN'));
  } else {
    cy.get('#input_0').type(Cypress.env('TEST'));
  }
  cy.get('#input_1').type(Cypress.env('PASSWORD'), { log: false });
  cy.get('form').submit();
});
