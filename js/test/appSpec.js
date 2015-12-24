define(function(require) {
  yt = require('js/app/ynab-tools');
  statementStubs = require('js/test/statement-stubs');

  describe('YNAB tools', function() {
    describe('create line', function() {
      it('should correctly create a line object', function () {
        createdLine = new yt.exporting.line("2015-10-10", "Payee", "Category", "Memo", "10.90", 0);


        expect(createdLine.payee).to.equal("Payee");
        expect(createdLine.category).to.equal("Category");
        expect(createdLine.memo).to.equal("Memo");
        expect(createdLine.outflow).to.equal(10.90);
        expect(createdLine.inflow).to.equal(0);
      });

      it('should correctly convert a string negative outflow to a negative number object', function () {
        createdLine = new yt.exporting.line("2015-10-10", "Habibs", "Almoço", "", "-10.90", 0);

        expect(createdLine.outflow).to.be.a("number");
        expect(createdLine.outflow).to.equal(-10.90);
      });
    });
    describe('itau statement parsing', function() {
      it('should correctly parse', function() {
        statement = yt.parse.creditCard.itau(statementStubs.creditCard.itau);

        console.log(statement.lines[3]);
      })
    })
  });
});