var CHECK = 1;
if (Cypress.env('CHECK')) CHECK=Cypress.env('CHECK');

describe('TEST7.A', () => {
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

describe('TEST7.B', () => {
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

it('case5', () => { })
it('case6', () => { })
it('case7', () => {
  expect(1).to.equal(CHECK);
})

