import qrCode from 'qrcode';
import qrCodeReader from 'qrcode-reader';
import fs from 'fs'
import * as Jimp from 'jimp'

// Generar QRs
export const generateQRCode = async (request, response) => {
    const {sector, estante, columna_estante} = request.body;
    if (!sector){
        return res.status(400).send('Sector Requerido')
    }
    if (!estante){
        return res.status(400).send('Estante Requerido')
    }
    if (!columna_estante){
        return res.status(400).send('Columna de Estante Requerida')
    }
    try {
        const qrText = `${sector}:${estante}:${columna_estante}`;
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
        //response.json({ success: true, qrImage });
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