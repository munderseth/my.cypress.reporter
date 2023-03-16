var CHECK = 1;
if (Cypress.env('CHECK')) CHECK=Cypress.env('CHECK');

it('case1', () => {})
it('case2', () => {})
it('case3', () => {
    expect(1).to.equal(CHECK);
})
