describe('TEST6', () => {
  it('case1', () => { })
  it('case2', () => { })
  it('case3 - failure', () => {
    expect(1).to.equal(2);
  })
  describe('MORE TESTS', () => {
    describe('ANOTHER LEVEL', () => {
      it('case10', () => { })
      it('case11', () => { })
      it('case12 - failure', () => {
        expect(1).to.equal(2);
      })
    })
    it('case7', () => { })
    it('case8', () => { })
    it('case9 - failure', () => {
      expect(1).to.equal(2);
    })
  })
  it('case4', () => { })
  it('case5', () => { })
  it('case6 - failure', () => {
    expect(1).to.equal(2);
  })
})
it('case0', () => { })




