const fs = require('node:fs');
const path = require('node:path');

const multer = require('multer');

const { documentTypes, uploadDir, uploadMaxFileSize } = require('../config/app');

const tmpDir = path.join(uploadDir, 'tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

function safeFileName(fileName) {
  const parsed = path.parse(fileName);
  const base = parsed.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'document';
  return `${base}${parsed.ext.toLowerCase()}`;
}

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, tmpDir);
  },
  filename(_req, file, callback) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${unique}-${safeFileName(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: uploadMaxFileSize,
    files: documentTypes.length
  },
  fileFilter(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      callback(new Error('Les fichiers doivent etre au format PDF, JPG ou PNG.'));
      return;
    }
    callback(null, true);
  }
});

const applicationUpload = upload.fields(documentTypes.map((item) => ({ name: item.key, maxCount: 1 })));

function cleanupFiles(files = {}) {
  for (const group of Object.values(files)) {
    for (const file of group || []) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }
}

function moveApplicationFiles(reference, files = {}) {
  const referenceDir = path.join(uploadDir, reference);
  fs.mkdirSync(referenceDir, { recursive: true });

  const moved = {};
  for (const type of documentTypes) {
    const file = files[type.key]?.[0];
    if (!file) {
      continue;
    }
    const storedName = `${type.key}-${safeFileName(file.originalname)}`;
    const destination = path.join(referenceDir, storedName);
    fs.renameSync(file.path, destination);
    moved[type.key] = {
      ...file,
      label: type.label,
      storedName,
      absolutePath: destination,
      relativePath: path.relative(path.join(__dirname, '..', '..'), destination)
    };
  }
  return moved;
}

module.exports = {
  applicationUpload,
  cleanupFiles,
  moveApplicationFiles,
  safeFileName
};
