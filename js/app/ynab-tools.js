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
          var metadata = new yt.exporting.metadata.creditCard();

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
      metadata: {
        creditCard: function() {
          
        }
      },
      statement: function(metadata, lines) {
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
      csv: function() {

      }
    }
  }

  return yt;
});