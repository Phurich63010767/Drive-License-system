const express = require('express');
const bodyParser = require('body-parser');
const testRoutes = require('./routes/testRoutes');

const app = express();

// ใช้ body-parser เพื่อจัดการ JSON requests
app.use(bodyParser.json());

// เส้นทางสำหรับ root path
app.get('/', (req, res) => {
    res.send('Welcome to the Driving License Test System API');
});

// ใช้ routes ที่สร้างไว้
app.use('/api', testRoutes);

// เริ่ม server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
