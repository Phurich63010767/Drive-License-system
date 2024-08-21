const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/testResults.json');

// ฟังก์ชันช่วยโหลดและบันทึกข้อมูลจาก JSON
const loadResults = () => {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

const saveResults = (results) => {
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
};

// บันทึกข้อมูล
// เส้นทางสำหรับบันทึกข้อมูล POST
router.post('/results', (req, res) => {
    const results = loadResults();
    const { firstName, lastName, physicalTest, theoryTest, practicalTest } = req.body;

    const physicalPassed = (physicalTest.colorBlind + physicalTest.longSighted + physicalTest.astigmatism + physicalTest.response) >= 3;
    const theoryPassed = (theoryTest.trafficSigns + theoryTest.roadLines + theoryTest.rightOfWay) >= 120;
    
    const newResult = {
        id: Date.now().toString(),
        firstName,
        lastName,
        physicalTest: { ...physicalTest, passed: physicalPassed },
        theoryTest: { ...theoryTest, passed: theoryPassed },
        practicalTest,
        createdAt: new Date().toISOString(),
    };

    if (physicalPassed && theoryPassed && practicalTest.passed) {
        newResult.overallStatus = 'ผ่านการทดสอบ';
    } else if (physicalPassed === null || theoryPassed === null || practicalTest.passed === null) {
        newResult.overallStatus = 'รอพิจารณา';
    } else {
        newResult.overallStatus = 'ไม่ผ่านการทดสอบ';
    }

    results.push(newResult);
    saveResults(results);

    res.status(201).json(newResult);
});

// อัปเดตข้อมูล
router.put('/results/:id', (req, res) => {
    const results = loadResults();
    const { id } = req.params;
    const index = results.findIndex(result => result.id === id);

    if (index === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' });

    const { physicalTest, theoryTest, practicalTest } = req.body;

    const physicalPassed = (physicalTest.colorBlind + physicalTest.longSighted + physicalTest.astigmatism + physicalTest.response) >= 3;
    const theoryPassed = (theoryTest.trafficSigns + theoryTest.roadLines + theoryTest.rightOfWay) >= 120;

    results[index] = {
        ...results[index],
        ...req.body,
        physicalTest: { ...physicalTest, passed: physicalPassed },
        theoryTest: { ...theoryTest, passed: theoryPassed },
    };

    if (physicalPassed && theoryPassed && practicalTest.passed) {
        results[index].overallStatus = 'ผ่านการทดสอบ';
    } else if (physicalPassed === null || theoryPassed === null || practicalTest.passed === null) {
        results[index].overallStatus = 'รอพิจารณา';
    } else {
        results[index].overallStatus = 'ไม่ผ่านการทดสอบ';
    }

    saveResults(results);
    res.json(results[index]);
});

// ลบข้อมูล
router.delete('/results/:id', (req, res) => {
    const results = loadResults();
    const { id } = req.params;
    const newResults = results.filter(result => result.id !== id);

    if (results.length === newResults.length) return res.status(404).json({ error: 'ไม่พบข้อมูล' });

    saveResults(newResults);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
});

// แสดงข้อมูลผู้ทดสอบ
router.get('/results', (req, res) => {
    const results = loadResults();
    res.json(results);
});

// แสดงจำนวนผู้ผ่านและไม่ผ่านการทดสอบในแต่ละวัน
router.get('/results/stats', (req, res) => {
    const results = loadResults();
    
    const stats = results.reduce((acc, result) => {
        const date = new Date(result.createdAt).toISOString().split('T')[0]; // แยกวันที่ออกมา
        
        if (!acc[date]) {
            acc[date] = { passed: 0, notPassed: 0 };
        }

        if (result.overallStatus === 'ผ่านการทดสอบ') {
            acc[date].passed += 1;
        } else if (result.overallStatus === 'ไม่ผ่านการทดสอบ') {
            acc[date].notPassed += 1;
        }

        return acc;
    }, {});

    res.json(stats);
});


// ค้นหาชื่อหรือนามสกุลผู้ทดสอบ
router.get('/results/search', (req, res) => {
    const { firstName, lastName } = req.query;
    const results = loadResults();

    let filteredResults = results;

    if (firstName) {
        filteredResults = filteredResults.filter(result =>
            result.firstName.toLowerCase().includes(firstName.toLowerCase())
        );
    }

    if (lastName) {
        filteredResults = filteredResults.filter(result =>
            result.lastName.toLowerCase().includes(lastName.toLowerCase())
        );
    }

    res.json(filteredResults);
});


module.exports = router;
