const express = require("express");
const router = express.Router();
const DateModel = require("../models/Date");

router.get("/api/getdate", async (req, res) => {
    try {
        const date = await DateModel.find();
        res.status(200).json(date);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
router.post("/api/adddate", async (req, res) => {
    const { date } = req.body;
    try {
        const newDate = new DateModel({
            date: date
        });
        await newDate.save();
        res.status(200).json(newDate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
router.get("/api/getalldate", async (req, res) => {
    try {
        const date = await DateModel.find();
        res.status(200).json(date);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})


router.post("/api/getalldate", async (req, res) => {
    let pattern = new RegExp("^" + req.body.query, "i")
    DateModel.find({
        date: { $regex: pattern },
    }).then((date) => {
        if (date.length === 0) {
            res.status(422).json({ message: "No Dates found" });
        } else {
            res.status(200).json(date );
        }
    }).catch((err) => {
        res.status(422).json({ error: err.message })
    })
})


router.get('/api/examDates', async (req, res) => {
    try {
        const uniqueDates = await DateModel.distinct('date');
        console.log("numberOfExamDates", uniqueDates);
        res.status(200).json({ uniqueDates: uniqueDates });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router