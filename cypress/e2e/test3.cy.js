var CHECK = 1;
if (Cypress.env('CHECK') !== undefined) CHECK=Cypress.env('CHECK');

describe('TEST3.A', () => {
  it('case1', () => { })
  it('case2', () => { })
  it('case3', () => {
    expect(1).to.equal(CHECK);
  })
})

describe('TEST3.B', () => {
  it('case1', () => { })
  it('case2', () => { })
  it('case3', () => {
    expect(1).to.equal(CHECK);
  })
})

