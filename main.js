const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

// Aviso de que el cliente esta listo para usarse.
client.on('ready', () => {
    console.log("+ Cliente de Whatsapp en Funcionamiento!");
});

// Para crear el Qr por terminal y loggearnos.
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Validaciones del cliente.
client.on('auth_failure', msg => {
    console.error('Error de autenticación:', msg);
});

client.on('disconnected', reason => {
    console.log('Cliente desconectado:', reason);
});


console.log("Inicialiazando el bot!\n --------------------------------------------------------------------");
client.initialize();

// Escuchamos todos los mensajes que lleguen al bot.
client.on('message_create', async (message) => {

    console.log(`+ Mensaje recibido de ${message.from} para ${message.to}: ${message.body}`);

    if (message.body === '!date') {
    const fecha = new Date();

    const horaArgentina = fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // para obtener el formato 24HS
        timeZone: 'America/Argentina/Buenos_Aires'
    });

    const fechaArgentina = fecha.toLocaleDateString('es-AR', {
        weekday: 'long',    // jueves
        day: 'numeric',     // 28
        month: 'long',      // agosto
        year: 'numeric',    // 2025
        timeZone: 'America/Argentina/Buenos_Aires'
    });

        const mensaje = `📅 *Fecha y hora en Argentina:*\n- ${fechaArgentina}\n- 🕒 ${horaArgentina}`;

        message.reply(mensaje);
    }


    // Comando basico para saber el estado del bot.
    if(message.body === '!ping'){
        message.reply("El bot esta Activo!");
    }

    // Esto es para obtener la info de quien le escribe al bot.
    if(message.body === '!info'){
        const ADVERTENCIA = 'No disponible.'

        const contact = await message.getContact();
        const foto_perfil = await contact.getProfilePicUrl() || ADVERTENCIA;
        const numero = await contact.getFormattedNumber();
        const cod_pais = await contact.getCountryCode();
        const estado = await contact.getAbout() || ADVERTENCIA;
        
        const grupos_comun_ids = await contact.getCommonGroups();
        let nombres_grupos = [];

    if(grupos_comun_ids.length > 0){
        for (const id of grupos_comun_ids) {
            try {
                const grupo = await client.getChatById(id);
                nombres_grupos.push(grupo.name || grupo.subject || "Grupo sin nombre");
            } catch (error) {
                nombres_grupos.push("Error al obtener nombre del grupo");
            }
        }
    }else{
        nombres_grupos.push('No hay grupos en común.');
    }

    const gruposTexto = nombres_grupos.length === 1 && nombres_grupos[0] === "No hay grupos en común."
    ? nombres_grupos[0]
    : nombres_grupos.map((nombre, i) => `   ${i + 1}. ${nombre}`).join("\n");

        const informacion = `
        *Informacion del Usuario:*
        - Id Usuario: ${contact.id._serialized}\n
        - Nombre: ${contact.name || ADVERTENCIA}\n
        - Nombre Público: ${contact.pushname}\n
        - Estado: ${estado}\n
        - Numero: ${numero}\n
        - Código de Pais: ${cod_pais}\n
        - Es un Grupo?: ${contact.isGroup ? 'Si' : 'No'}\n
        - Grupos en común con el bot: ${gruposTexto}\n
        - Cuenta Empresa?: ${contact.isBusiness ? 'Si' : 'No'}\n
        - Cuenta Verificada por Meta?: ${contact.isEnterprise ? 'Si' : 'No'}\n
        - Es la Cuenta del Bot?: ${contact.isMe ? 'Si' : 'No'}\n
        - Esta registrado en WhatsApp?: ${contact.isWAContact ? 'Si' : 'No'}\n
        - Foto Perfil:  ${foto_perfil}
        `;

        message.reply(informacion);
    }

    // Envio de archivos multimedia a traves de una URL donde esta el recurso.
    if (message.body === '!media') {
        // debe ser una url directa a un archivo.
        const media = await MessageMedia.fromUrl('https://upload.wikimedia.org/wikipedia/commons/f/f7/WhatsApp_logo.svg');
        // Se puede enviar con el objeto cliente.
        //await client.sendMessage(message.from, media, {caption: 'Información Adicional.'});
        message.reply(media, null,{caption: 'Información Adicional.'});
    }

});