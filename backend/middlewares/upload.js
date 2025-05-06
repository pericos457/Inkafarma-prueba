const multer = require('multer');
const path = require('path');

// Configura el almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Asegúrate de que la carpeta exista
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname)); // Asignar un nombre único a cada archivo
  }
});

const upload = multer({ storage });

module.exports = upload;
