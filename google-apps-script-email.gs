const ALLOWED_DESTINATION = 'oticaprime3@gmail.com';
const SENDER_NAME = 'Otica Prime';

function enviarEmailTeste() {
  GmailApp.sendEmail(
    ALLOWED_DESTINATION,
    'Teste de alerta - Otica Prime',
    'Se voce recebeu este e-mail, o envio pelo Google Apps Script esta autorizado.',
    { name: SENDER_NAME }
  );
}

function testarDoPostAgendamento() {
  return doPost({
    postData: {
      contents: JSON.stringify({
        destinatario: ALLOWED_DESTINATION,
        nome: 'Teste pelo editor',
        contato: '92999998888',
        data: '11/09/2026',
        hora: '15:30',
        origem: 'Teste Apps Script'
      })
    }
  });
}

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'Otica Prime email webhook',
    message: 'Webhook ativo. Use POST para enviar notificacoes de agendamento.'
  });
}

function doPost(e) {
  try {
    const data = parseRequestBody(e);
    console.log('Payload recebido: ' + JSON.stringify(data));

    const recipient = normalizeEmail(data.destinatario || ALLOWED_DESTINATION);
    const allowedRecipient = normalizeEmail(ALLOWED_DESTINATION);

    if (recipient !== allowedRecipient) {
      throw new Error('Destinatario nao permitido: ' + recipient);
    }

    const subject = getSubject(data);
    const body = buildEmailBody(data);

    GmailApp.sendEmail(recipient, subject, body, {
      name: SENDER_NAME,
      replyTo: recipient
    });

    console.log('E-mail enviado para: ' + recipient);
    return jsonResponse({
      ok: true,
      sent: true,
      recipient: recipient,
      subject: subject
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail: ' + error.message);
    return jsonResponse({
      ok: false,
      sent: false,
      error: error.message
    });
  }
}

function parseRequestBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Requisicao sem corpo.');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('JSON invalido: ' + error.message);
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getSubject(data) {
  if (String(data.origem || '').toLowerCase().indexOf('teste') !== -1) {
    return 'Teste de alerta - Otica Prime';
  }

  return 'Novo agendamento solicitado - Otica Prime';
}

function buildEmailBody(data) {
  return [
    'Um novo agendamento foi solicitado pelo site.',
    '',
    'Nome: ' + safeValue(data.nome, 'Nao informado'),
    'Contato: ' + safeValue(data.contato, 'Nao informado'),
    'Data: ' + safeValue(data.data, 'Nao informada'),
    'Hora: ' + safeValue(data.hora, 'Nao informada'),
    'Origem: ' + safeValue(data.origem, 'Site Otica Prime'),
    '',
    'Acesse o painel administrativo para verificar conflitos e confirmar o atendimento.'
  ].join('\n');
}

function safeValue(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
