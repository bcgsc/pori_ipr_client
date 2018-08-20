describe('Login', function() {
  it('Visits IPR and logs in', function() {
    cy.login(Cypress.env('access'))
    cy.url().should('include', 'reports/dashboard')
  })
})