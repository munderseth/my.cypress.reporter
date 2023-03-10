describe('TEST11', () => {
  it('case1', () => { })
  it('case2', () => { })
  it('case3 - failure', () => {
    expect(1).to.equal(2);
  })
  describe('MORE TESTS', () => {
    it('another case1', () => { })
    it('another case2', () => { })
    it('case3 - failure', () => {
      expect(1).to.equal(2);
    })
  })
})



