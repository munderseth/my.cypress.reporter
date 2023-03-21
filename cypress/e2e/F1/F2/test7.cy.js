var CHECK = 1;
var FIXTURE = 1;
if (Cypress.env('CHECK')   !== undefined) CHECK=Cypress.env('CHECK');
if (Cypress.env('FIXTURE') !== undefined) FIXTURE=Cypress.env('FIXTURE');

before( () => {
  if (FIXTURE == 40) throw new Error('Before All');
})

describe('TEST7.A', () => {
  before( () => {
    if (CHECK == 41) throw new Error('Before All');
  })

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

after( () => {
  if (FIXTURE == 50) throw new Error('Before All');
})
