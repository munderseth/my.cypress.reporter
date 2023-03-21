var CHECK = 1;
if (Cypress.env('CHECK') !== undefined) CHECK=Cypress.env('CHECK');

describe('TEST5', () => {
  it('case1', () => { })
  it('case2', () => { })
  it('case3', () => {
    expect(1).to.equal(CHECK);
  })
  describe('NEST', () => {
    describe('NEST2', () => {
      it('case1', () => { })
      it('case2', () => { })
      it('case3', () => {
        expect(1).to.equal(CHECK);
      })
    })
  })
})



