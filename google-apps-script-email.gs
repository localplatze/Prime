const ALLOWED_DESTINATION = 'oticaprime3@gmail.com';

function enviarEmailTeste() {
  GmailApp.sendEmail(ALLOWED_DESTINATION, 'Teste de alerta - Otica Prime', 'Se voce recebeu este e-mail, o envio pelo Google Apps Script esta autorizado.');
}

function doGet() {
  return jsonResponse({ ok: true, service: 'Otica Prime email webhook' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const recipient = data.destinatario || ALLOWED_DESTINATION;

    if (recipient !== ALLOWED_DESTINATION) {
      throw new Error('Destinatario nao permitido.');
    }

    const subject = 'Novo agendamento solicitado - Otica Prime';
    const body = [
      'Um novo agendamento foi solicitado pelo site.',
      '',
      `Nome: ${data.nome || 'Nao informado'}`,
      `Contato: ${data.contato || 'Nao informado'}`,
      `Data: ${data.data || 'Nao informada'}`,
      `Hora: ${data.hora || 'Nao informada'}`,
      `Origem: ${data.origem || 'Site Otica Prime'}`
    ].join('\n');

    GmailApp.sendEmail(recipient, subject, body, {
      name: 'Otica Prime'
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
