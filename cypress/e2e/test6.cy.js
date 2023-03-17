var CHECK = 1;
if (Cypress.env('CHECK')) CHECK=Cypress.env('CHECK');

describe('TEST6', () => {
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
    it('case1', () => { })
    it('case2', () => { })
    it('case3', () => {
      expect(1).to.equal(CHECK);
    })
  })
  it('case4', () => { })
  it('case5', () => { })
  it('case6', () => {
    expect(1).to.equal(CHECK);
  })
})
it('case1', () => { })
it('case2', () => { })
it('case3', () => {
  expect(1).to.equal(CHECK);
})




