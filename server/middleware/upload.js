const multer = require('multer');
const path = require('path');
const fs = require('fs');


const dirs = ['uploads/resumes', 'uploads/assignments', 'uploads/avatars', 'uploads/logos', 'uploads/certificates', 'uploads/verification'];
dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', folder));
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

const fileFilter = (allowed) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error(`Only ${allowed.join(', ')} files are allowed`), false);
};

const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['.pdf', '.doc', '.docx']),
});

const uploadAssignment = multer({
  storage: createStorage('assignments'),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: fileFilter([
    '.pdf', '.doc', '.docx', '.txt', '.md',
    '.zip', '.rar', '.tar', '.gz',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css',
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
    '.mp4', '.mov', '.webm',
    '.xlsx', '.xls', '.csv', '.pptx',
    '.ipynb',
  ]),
});

const uploadAvatar = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png', '.webp']),
});

const uploadLogo = multer({
  storage: createStorage('logos'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png', '.webp', '.svg']),
});

const uploadVerificationDocs = multer({
  storage: createStorage('verification'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png']),
});

module.exports = { uploadResume, uploadAssignment, uploadAvatar, uploadLogo, uploadVerificationDocs };
