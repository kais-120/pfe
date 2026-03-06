const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/others';

    if (file.fieldname === 'avatar') {
      folder = 'uploads/avatar';
    } else if (file.fieldname === 'service_doc') {
      folder = 'uploads/services';
    }else if(file.fieldname === 'partner_doc'){
      folder = 'uploads/partner_files';
    }

    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqId = randomUUID()
    cb(null, Date.now() + '-' + uniqId + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;
