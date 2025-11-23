require('dotenv').config();
require('./db');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.env.local', override: true });
}

const PORT = process.env.PORT || 3000;

const app = require('./app');

app.listen(PORT, () => {
  console.log(`Server running. Use our API on port: ${PORT}`);
});
