define(function(require) {
  yt = require('js/app/ynab-tools');
  statementStubs = require('js/test/statement-stubs');

  describe('YNAB tools', function() {
    describe('create transaction', function() {
      it('should correctly create a transaction object', function () {
        createdLine = new yt.exporting.transaction("2015-10-10", "Payee", "Category", "Memo", "10.90", 0);


        expect(createdLine.payee).to.equal("Payee");
        expect(createdLine.category).to.equal("Category");
        expect(createdLine.memo).to.equal("Memo");
        expect(createdLine.amount).to.equal(10.90);
      });

      it('should correctly convert a string negative outflow to a negative number object', function () {
        createdLine = new yt.exporting.transaction("2015-10-10", "Habibs", "Almoço", "", "-10.90", 0);

        expect(createdLine.amount).to.be.a("number");
        expect(createdLine.amount).to.equal(-10.90);
      });
    });
    describe('itau statement parsing', function() {
      it('should correctly generate one transaction', function() {
        statement = yt.parse.creditCard.itau(statementStubs.creditCard.itau);
        var transaction = statement.transactions[3]; // I'm getting a random transaction to check

        expect(transaction.payee).to.equal("PAO DE ACUCAR-2337-DEL");
        expect(transaction.amount).to.equal(-521.36);
        expect(transaction.date.getMonth()).to.equal(10); // 10 is november

        // I can't enable the test below until we find a better way to detect year for Itaú
        // expect(transaction.date.getFullYear()).to.equal(2015);
      })
    });
    describe('utils', function() {
      it('should correctly format to ofx date format', function() {
        var dt = new Date('2015-01-03T09:04:07');
        resultingDate = yt.util.ofxDateFormat(dt);
        expect(resultingDate).to.equal('20150103090407[-03:EST]');
      })
    });
    describe('output', function() {
      it('should generate a correct ofx file', function() {
        statement = yt.parse.creditCard.itau(statementStubs.creditCard.itau);
        console.log(yt.output.ofx(statement));
        
        //expect(resultingDate).to.equal('20150103090407[-03:EST]');
      })
    })
  });
});