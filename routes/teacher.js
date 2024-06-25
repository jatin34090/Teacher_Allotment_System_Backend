const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const requireLogin = require("../middleware/requiredLogin");
const { body, validationResult } = require('express-validator');


router.get("/api/getallteachers", (req, res) => {
    Teacher.find({type: "teacher"})
        .then((teachers) => {
            res.json(teachers);
        }).catch((err) => {
            return res.status(422).json({ message: err.msg })
        })
})
router.post("/api/getteachers", (req, res) => {
    const { email } = req.body;
    Teacher.findOne({email: email})
        .then((teacher) => {
            console.log(teacher);
            res.json(teacher.allotedRooms);
        }).catch((err) => {
            return res.status(422).json({ message: err.msg })
        })
})

router.post("/api/searchTeachers", (req, res) => {
    let pattern = new RegExp("^" + req.body.query, "i")
    Teacher.find({
        email: { $regex: pattern },
    })
        .then((teachers) => {
            if (teachers.length === 0) {
                res.json({ message: "No teachers found" });
            } else {
                res.json({ teachers });
            }
        }).catch((err) => {
            console.log(err)
        })
})

router.delete("/api/deleteteacher", requireLogin, (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    Teacher.findOneAndDelete({ email: email })
        .then((teacher) => {
            res.json(teacher);
        }).catch((err) => {
            return res.status(422).json({ error: err })
        })
})

router.post("/api/addteacher", [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(422).json({ message: "Please add all fields" })
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: `${errors.array()[0].msg}` });
    }
    try {
        const savedTeacher = await Teacher.findOne({ email: email })

        if (savedTeacher) {
            return res.status(422).json({ error: "Teacher with this email already exists" });
        }

        const teacher = new Teacher(req.body);
        await teacher.save()
        res.json({ message: "added successfully", teacher });
    } catch (err) {
        return res.status(422).json({ message: err.msg })
    }
})

router.get('/api/availableteachers', async (req, res) => {
    try {
        const availableTeachers = await Teacher.find({ avalability: true, leave: false });
        res.status(200).json(availableTeachers);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
router.post('/api/availableteachers', async (req, res) => {
    const { date, shift } = req.body;
    try {
        const availableTeachers = await Teacher.find({
            avalableDates: {
                $elemMatch: {
                    date: date,
                    shift: shift
                }
            }
        });
        // console.log(availableTeachers);
        res.status(200).json(availableTeachers);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/api/editPreviousTeacher', async (req, res) => {
    const { email, date, shift } = req.body;

    if (!email || !date || !shift) {
        return res.status(422).json({ error: "Please add all fields" });
    }

    try {
        const teacher = await Teacher.findOne({ email: email });
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        teacher.allotedRooms = teacher.allotedRooms.filter(
            allotedRooms => !(allotedRooms.date === date && allotedRooms.Shift === shift)
        );

        await teacher.save();
        res.status(200).json({ message: "Updated successfully", teacher });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/api/editTeacher', async (req, res) => {
    const { email, date, shift, roomNo } = req.body;
    if (!email) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    const teacher = await Teacher.findOne({ email: email });
    teacher.allotedRooms.push({ Shift: shift, room: roomNo, date: date });
    teacher.save();
    res.status(200).json({ message: "updated successfully", teacher });


})

router.post("/updateteacher", (req, res) => {
    const { email, changedEmail } = req.body;
    if (!email) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    Teacher.findOne({ email: changedEmail })
        .then((savedTeacher) => {
            if (savedTeacher) {
                return res.status(422).json({ error: "Teacher with this email already exists" });
            }
        })
    Teacher.findOneAndUpdate({ email: email }, { email: changedEmail })
        .then((teacher) => {
            res.json({ message: "updated successfully", teacher });
        }).catch((err) => {
            return res.status(422).json({ error: err.msg })
        })
})

router.post("/api/updateteacherAvailability", (req, res) => {
    const { email, avalability } = req.body;
    if (!email) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    Teacher.findOneAndUpdate({ email: email }, { avalability: avalability })
        .then((teacher) => {
            res.json(teacher);
        }).catch((err) => {
            return res.status(422).json({ error: err.msg })
        })
})

router.post("/api/updateLeaveStatus", (req, res) => {
    const { email, leave } = req.body;
    // console.log(email, leave)
    if (!email) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    Teacher.findOneAndUpdate({ email: email }, { leave: leave })
        .then((teacher) => {
            res.status(200).json({ message: "Leave status updated successfully", teacher });
        }).catch((err) => {
            return res.status(422).json({ error: err.msg })
        })
})


module.exports = router