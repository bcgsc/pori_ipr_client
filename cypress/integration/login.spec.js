describe('Login', function() {
  it('Visits IPR and logs in', function() {
    cy.login('admin')
    cy.url().should('include', 'reports/dashboard')
  })
})