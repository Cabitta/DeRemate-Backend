import qrCode from 'qrcode';
import qrCodeReader from 'qrcode-reader';
import fs from 'fs'
import * as Jimp from 'jimp'

// Generar QRs
export const generateQRCode = async (request, response) => {
    const {id} = request.body;
    if (!id){
        return res.status(400).send('ID Requerido')
    }
    try {
        const qrText = `${id}`;
        const qrImage = await qrCode.toDataURL(qrText)
        response.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          <h2>QR generado para:</h2>
          <p><strong>${qrText}</strong></p>
          <img src="${qrImage}" alt="Código QR" />
        </body>
      </html>
    `);
    } 
    catch (error) {
        console.error(error);
        response.status(500).json({ mensaje: "Error en el servidor" });
  }
};

//Escanear QRs
export const scanQRCode = async (request, response) => {
    try {
        const imagePath = request.file.path;
    const image = await Jimp.read(imagePath);

    const qr = new qrCodeReader();
    qr.callback = (err, value) => {
      fs.unlinkSync(imagePath);
      if (err || !value) {
        return response.status(400).json({ error: "No se pudo leer el código QR" });
      }

      response.json({ result: value.result });
    };
    qr.decode(image.bitmap);
  } catch (error) {
    response.status(500).json({ error: "Error al procesar la imagen" });
  }
};

export default { generateQRCode };