Cypress.Commands.add('login', (userType, options) => {
  cy.visit('login')
  cy.readFile('.auth.json').then((auth) => {
    if (userType === 'admin') {
      cy.get('#input_0').type(auth.admin.username)
      cy.get('#input_1').type(auth.admin.password, { log: false })
    } else if (userType === 'test') {
      cy.get('#input_0').type(auth.test.username)
      cy.get('#input_1').type(auth.test.password, { log: false })
    }
    cy.get('form').submit()
  })
})