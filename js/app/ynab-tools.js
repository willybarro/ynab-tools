define(function () {
  var yt = {
    parse: {
      creditCard: {
        /**
         * @return exporting.statement
         */
        itau: function(stringStatement) {
          // TODO - Find a better way to detect statement year from the pasted statement
          var statementYear = new Date().getFullYear();

          // Build statement Lines
          var startDate = null
          , endDate = null
          , statementLines = []
          , transactionRegex = /(\d+\/\d+)\t(.*?)\t([-+]?[\d,.]+)/g
          , match = null
          ;

          while ((match = transactionRegex.exec(stringStatement)) !== null) {
            var date = match[1].split("/");
            var dateObject = new Date(statementYear, date[1]-1, date[0]);

            // Will be useful for metadata
            if (startDate == null || dateObject < startDate) {
              startDate = dateObject;
            }
            if (endDate == null || dateObject > endDate) {
              endDate = dateObject;
            }

            // Payee, category and memo variables
            var payee = match[2];
            var category = "";
            var memo = "";

            /**
             * Change amount to american format
             *
             * Also multiplies Itau amount * - 1. Because they mark negative (debit)
             * operations on credit cards as "credit" which doesn't make sense.
             */
            var amount = parseFloat(match[3].replace('.', '').replace(',', '.'));
            amount = amount * - 1;

            // Create transaction and push to transaction array
            ln = new yt.exporting.transaction(dateObject, payee, category, memo, amount);
            statementLines.push(ln);
          }

          // Build metadata from the statement - @TODO Add here
          // @TODO Add details about which credit card, which account, etc.
          //  We could use that info to generate the filename.
          var metadata = new yt.exporting.metadata();

          metadata.currentDate = new Date();
          metadata.startDate = startDate;
          metadata.endDate = endDate;

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
          currentDate: null,
          startDate: null,
          endDate: null
        }
      },
      statement: function(metadata, transactions) {
        // @TODO If we're going to add any automatic categorization or something like that, do it here!

        return {
          'metadata': metadata,
          'transactions': transactions
        };
      },
      transaction: function(date, payee, category, memo, amount) {
        var transactionObject = {
          'date': date,
          'payee': payee,
          'category': category,
          'memo': memo,
          'amount' : parseFloat(amount),
          'transactionType': 'DEBIT',
        };

        if (amount > 0) {
          transactionObject.transactionType = 'CREDIT';
        }

        return transactionObject;
      }
    },
    util: {
      ofxDateFormat: function(dt) {
        var returnDate = ""
        + '' + dt.getFullYear()
        + '' + String("00" + (dt.getMonth() + 1)).slice(-2) // Slice is for padding - adding 0 to the left :)
        + '' + String("00" + dt.getDate()).slice(-2)
        + '' + String("00" + dt.getHours()).slice(-2)
        + '' + String("00" + dt.getMinutes()).slice(-2)
        + '' + String("00" + dt.getSeconds()).slice(-2)
        + '' + '[-03:EST]';
        return returnDate;
      },
      isoDateFormat: function(dt) {
        var returnDate = ""
        + '' + dt.getFullYear()
        + '' + String("00" + (dt.getMonth() + 1)).slice(-2) // Slice is for padding - adding 0 to the left :)
        + '' + String("00" + dt.getDate()).slice(-2)
        + 'T' + String("00" + dt.getHours()).slice(-2)
        + '' + String("00" + dt.getMinutes()).slice(-2)
        + '' + String("00" + dt.getSeconds()).slice(-2);
        return returnDate;
      }
    },
    output: {
      /**
       * Build the statement in the weird OFX format.
       * @param statement Statement object, created by yt.exporting.statement
       */
      ofx: function(statement) {
        var metadata = statement.metadata;
        var transactions = statement.transactions;

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
          + "<OFX>\n"
          + "<SIGNONMSGSRSV1>\n"
          + "<SONRS>\n"
          + "<STATUS>\n"
          + "<CODE>0\n"
          + "<SEVERITY>INFO\n"
          + "</STATUS>\n"
          + "<DTSERVER>" + metadata.currentDate + "\n"
          + "<LANGUAGE>" + metadata.language + "\n"
          + "</SONRS>\n"
          + "</SIGNONMSGSRSV1>\n"
          + "<BANKMSGSRSV1>\n"
          + "<STMTTRNRS>\n"
          + "<TRNUID>1001\n"
          + "<STATUS>\n"
          + "<CODE>0\n"
          + "<SEVERITY>INFO\n"
          + "</STATUS>\n"
          + "<STMTRS>\n"
          + "<CURDEF>" + metadata.currency + "\n"
          + "<BANKACCTFROM>\n"
          + "<BANKID>" + metadata.bankId + "\n"
          + "<ACCTID>" + metadata.accountId + "\n"
          + "<ACCTTYPE>" + metadata.accountType + "\n"
          + "</BANKACCTFROM>\n"
        ;

        // OFX Statements - Transaction List
        ofxOutput += ""
          + "<BANKTRANLIST>\n"
          + "<DTSTART>" + yt.util.ofxDateFormat(metadata.startDate) + "\n"
          + "<DTEND>" + yt.util.ofxDateFormat(metadata.endDate) + "\n"
        ;

        for (var i = 0; i < transactions.length; i++) {
          var transaction = transactions[i];
          var transactionId = yt.util.ofxDateFormat(transaction.date).slice(0, 8) + String("000" + (i+1)).slice(-3);

          // Output format
          ofxOutput += ""
            + "<STMTTRN>\n"
            + "<TRNTYPE>" + transaction.transactionType + "\n"
            + "<DTPOSTED>" + yt.util.ofxDateFormat(transaction.date) + "\n"
            + "<TRNAMT>" + transaction.amount + "\n"
            + "<FITID>" + transactionId + "\n"
            + "<NAME>" + transaction.payee + "\n"
            + "<CHECKNUM>" + "\n"
            + "<MEMO>" + transaction.memo + "\n"
            + "</STMTTRN>\n"
          ;
        }

        ofxOutput += "</BANKTRANLIST>\n";

        // OFX closing
        ofxOutput += ""
          + "<LEDGERBAL>\n"
          + "<BALAMT>0\n"
          + "<DTASOF>" + yt.util.ofxDateFormat(metadata.currentDate) + "\n"
          + "</LEDGERBAL>\n"
          + "</STMTRS>\n"
          + "</STMTTRNRS>\n"
          + "</BANKMSGSRSV1>\n"
          + "</OFX>"
        ;

        // Finally, return the file
        return ofxOutput;
      }
    }
  }

  return yt;
});