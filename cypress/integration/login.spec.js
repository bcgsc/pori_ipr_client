describe('Login', () => {
  it('Visits IPR and logs in as an admin', () => {
    cy.login('admin');
    cy.url().should('include', 'reports/dashboard');
  });

  it('Visits IPR and logs in as a test user', () => {
    cy.login('test');
    cy.url().should('include', 'reports');
  });
});
