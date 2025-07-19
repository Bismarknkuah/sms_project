// sms-server/app.js
const express      = require('express');
const mongoose     = require('mongoose');
const bodyParser   = require('body-parser');
const cors         = require('cors');
const path         = require('path');
const multer       = require('multer');
const { expressjwt: jwtMiddleware } = require('express-jwt');
require('dotenv').config();

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/sms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// --- App setup ---
const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Static assets ---
// 1) Serve /assets → public/assets
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
// 2) Serve /uploads → public/uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// 3) Fallback: serve everything in public/ at web-root
app.use(express.static(path.join(__dirname, '../public')));

// --- JWT Auth ---
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';
app.post('/api/auth/login', require('./routes/auth').login);
app.use(
  jwtMiddleware({ secret: JWT_SECRET, algorithms: ['HS256'] })
    .unless({
      path: [
        '/api/auth/login',
        '/',                   // public/index.html
        '/admin-voting.html',  // your admin UI
        '/voting.html'         // your student UI
      ]
    })
);
app.use((req, res, next) => {
  if (req.auth) req.user = { id: req.auth.id, role: req.auth.role };
  next();
});

// --- Multer for candidate uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// --- API Routes ---
app.use('/api/admin/elections',  require('./routes/admin/elections'));
app.use('/api/admin/positions',  require('./routes/admin/positions'));
app.use(
  '/api/admin/candidates',
  upload.single('image'),
  require('./routes/admin/candidates')
);
app.use('/api/voting',           require('./routes/voting'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
