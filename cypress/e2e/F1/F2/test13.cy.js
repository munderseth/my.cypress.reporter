describe('TEST13', () => {
  it('case1', () => { })
  it('case2', () => { })
  it('case3 - failure', () => {
    expect(1).to.equal(2);
  })
  describe('MORE TESTS', () => {
    describe('ANOTHER LEVEL', () => {
      it('case9',  () => { })
      it('case10', () => { })
      it('case11 - failure', () => {
        expect(1).to.equal(2);
      })
    })
    it('case6', () => { })
    it('case7', () => { })
    it('case8 - failure', () => {
      expect(1).to.equal(2);
    })
  })
  it('case4', () => { })
  it('case5', () => { })
})
it('case0', () => { })
it('case0a - failure', () => {
  expect(1).to.equal(2);
})




