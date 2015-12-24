define(function () {
  var yt = {
    parse: {
      creditCard: {
        /**
         * @return exporting.statement
         */
        itau: function(stringStatement) {
          // Build metadata from the statement - @TODO Add here
          // @TODO Add details about which credit card, which account, etc.
          //  We could use that info to generate the filename.
          var metadata = new yt.exporting.metadata();

          // Build statement Lines
          var statementLines = [];

          var lineRegex = /(\d+\/\d+)\t(.*?)\t([-+]?[\d,.]+)/g;
          var match = null;
          while ( (match = lineRegex.exec(stringStatement)) !== null) {
            var date = match[1];
            var payee = match[2];
            var category = "";
            var memo = "";

            // Change amount to american format
            var amount = match[3].replace('.', '').replace(',', '.');

            // Create line and push to line array
            ln = new yt.exporting.line(date, payee, category, memo, amount);
            statementLines.push(ln);
          }

          // Build the statement object and return
          return new yt.exporting.statement(metadata, statementLines);
        },
        nubank: function() {

        }
      },
      savings: {
        itau: function() {

        }
      },
    },
    exporting: {
      metadata: function() {
        return {
          currency: 'BRL',
          language: 'POR',
          bankId: '9999',
          accountId: '999999',
          accountType: 'CHECKING',
          currentDate: '20151224100000[-03:EST]'
        }
      },
      statement: function(metadata, lines) {
        // @TODO If we're going to add some automatic categorization or something like that, do it here!

        return {
          'metadata': metadata,
          'lines': lines
        };
      },
      line: function(date, payee, category, memo, amount) {
        var lineObject = {
          'date': date,
          'payee': payee,
          'category': category,
          'memo': memo,
          'outflow' : 0,
          'inflow': 0
        }

        amount = parseFloat(amount);

        lineObject.outflow = amount;
        if(amount < 0) {
          lineObject.inflow = amount;
        }

        return lineObject;
      }
    },
    output: {
      /**
       * Build the statement in the weird OFX format.
       * @param statement Statement object, created by yt.exporting.statement
       */
      ofx: function(statement) {
        var metadata = statement.metadata;
        var lines = statement.lines;

        var ofxOutput = "";

        // OFX Header
        ofxOutput += ""
          + "OFXHEADER:100\n"
          + "DATA:OFXSGML\n"
          + "VERSION:102\n"
          + "SECURITY:NONE\n"
          + "ENCODING:USASCII\n"
          + "CHARSET:1252\n"
          + "COMPRESSION:NONE\n"
          + "OLDFILEUID:NONE\n"
          + "NEWFILEUID:NONE\n\n"
        ;

        // OFX Content Header
        ofxOutput += ""
          + "<OFX>"
          + "<SIGNONMSGSRSV1>"
          + "<SONRS>"
          + "<STATUS>"
          + "<CODE>0"
          + "<SEVERITY>INFO"
          + "</STATUS>"
          + "<DTSERVER>" + metadata.currentDate
          + "<LANGUAGE>" + metadata.language
          + "</SONRS>"
          + "</SIGNONMSGSRSV1>"
          + "<BANKMSGSRSV1>"
          + "<STMTTRNRS>"
          + "<TRNUID>1001"
          + "<STATUS>"
          + "<CODE>0"
          + "<SEVERITY>INFO"
          + "</STATUS>"
          + "<STMTRS>"
          + "<CURDEF>" + metadata.currency
          + "<BANKACCTFROM>"
          + "<BANKID>" + metadata.bankId
          + "<ACCTID>" + metadata.accountId
          + "<ACCTTYPE>" + metadata.accountType
          + "</BANKACCTFROM>"
        ;

        // OFX Statements - Transaction List
        ofxOutput += ""
          + "<BANKTRANLIST>"
          + "<DTSTART>20151201100000[-03:EST]"
          + "<DTEND>20151224100000[-03:EST]"
        ;

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          var transactionType = "DEBIT";
          ofxOutput += "";
            + "<STMTTRN>"
            + "<TRNTYPE>" + transactionType
            + "<DTPOSTED>20151201100000[-03:EST]"
            + "<TRNAMT>" + line.amount
            + "<FITID>20151201001"
            + "<CHECKNUM>20151201001"
            + "<MEMO>" + line.memo
            + "</STMTTRN>"
        }

        ofxOutput += "</BANKTRANLIST>";

        // OFX closing
        ofxOutput += ""
          + "<LEDGERBAL>"
          + "<BALAMT>0"
          + "<DTASOF>20151224100000[-03:EST]"
          + "</LEDGERBAL>"
          + "</STMTRS>"
          + "</STMTTRNRS>"
          + "</BANKMSGSRSV1>"
          + "</OFX>"
        ;

        // Finally, return the file
        return ofxOutput;
      }
    }
  }

  return yt;
});