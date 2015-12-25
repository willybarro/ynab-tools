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

        expect(statement.transactions.length).to.equal(18);

        expect(transaction.payee).to.equal("PAO DE ACUCAR-2337-DEL");
        expect(transaction.amount).to.equal(-521.36);
        expect(transaction.date.getMonth()).to.equal(10); // 10 is november

        // TODO add assertion to start-date/end-date
      })
    });
    describe('nubank statement parsing', function() {
      it('should correctly generate one transaction', function() {
        statement = yt.parse.creditCard.nubank(statementStubs.creditCard.nubank);
        var transaction = statement.transactions[13]; // I'm getting a random transaction to check

        expect(statement.transactions.length).to.equal(31);

        expect(transaction.payee).to.equal("Google Google Storage");
        expect(transaction.amount).to.equal(-7.74);
        expect(transaction.date.getMonth()).to.equal(9); // 9 is october
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
        ofxFile = yt.output.ofx(statement);

        // A statement that it should have generated
        checkString = "<STMTTRN>\n"
          + "<TRNTYPE>DEBIT\n"
          + "<DTPOSTED>20151124000000[-03:EST]\n"
          + "<TRNAMT>-150.55\n"
          + "<FITID>20151124015\n"
          + "<NAME>NATIONAL CAR TOLLS\n"
          + "<CHECKNUM>\n"
          + "<MEMO>\n"
          + "</STMTTRN>\n"
        ;
        
        expect(ofxFile).string(checkString);
      })
    })
  });
});