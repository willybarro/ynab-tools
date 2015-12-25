define(['app/ynab-tools'], function (yt) {
	var main = {
		flashMessageTimeout: null,
		flashMessage: function(message, error) {
			error = error | false;
			main.hideFlashMessage();

			if (error) {
				$('#alert-error .message').html(message);
				$('#alert-error').show();
			} else {
				$('#alert-success .message').html(message);
				$('#alert-success').show();
			}

			clearTimeout(main.flashMessageTimeout);
			main.flashMessageTimeout = window.setTimeout(function() {
				$('.alert').fadeOut('fast');
			}, 4000);
		},
		hideFlashMessage: function() {
			$('.alert').hide();
			$('.alert').removeClass('hidden');
		},
		downloadButton: {
			disable: function() {
				$('#btn-download').addClass('disabled');
			},
			enable: function() {
				$('#btn-download').removeClass('disabled');
			}
		},
		convertButton: {
			disable: function() {
				$('#btn-convert').addClass('disabled');
			},
			enable: function() {
				$('#btn-convert').removeClass('disabled');
			}
		},
		setDownload: function(content, filename) {
			var btn = $('#btn-download');

			// Generate a base64 encoded string to generate a link
			var b64ofx = window.btoa(content);

			// Fill the link
			btn.attr('href', 'data:text/plain;base64,' + b64ofx);
			btn.attr('download', filename);
		},
		getSelectedConversionOption: function() {
			return $('#tab-opcoes li.active').data('option');
		},
		getStatementString: function() {
			return $.trim($('#statement-textarea').val());
		},
		lastStatement: '',
		init: function() {
			$('#statement-textarea').on('blur paste keyup', function() {
				var statementString = main.getStatementString();

				if (statementString != main.lastStatement) {
					main.hideFlashMessage();
					main.downloadButton.disable();
					main.convertButton.disable();

					if(statementString != '') {
						main.convertButton.enable();
					}
				}

				main.lastStatement = statementString;
			});

			$('#btn-convert').bind('click', function() {
				var statementString = main.getStatementString();
				var option = main.getSelectedConversionOption();
				var statement = null;
				var filename = 'extrato.ofx';

				switch(option) {
					case 'itau-cartao':
						statement = yt.parse.creditCard.itau(statementString);
						filename = 'extrato-' + option + '-' + yt.util.isoDateFormat(statement.metadata.currentDate) + '.ofx';
					break;
					case 'itau-poupanca':
					break;
					case 'nubank-cartao':
					break;
				}

				if (statement == null || statement.transactions.length == 0) {
					main.flashMessage('Formato de fatura inválido.', true);
				} else {
					main.flashMessage('Convertido! Clique em <b>Baixar .OFX</b>');

					// Sets the download link
					main.setDownload(yt.output.ofx(statement), filename);

					main.convertButton.disable();
					main.downloadButton.enable();
				}
			});
		}
	};

	$(main.init);
});