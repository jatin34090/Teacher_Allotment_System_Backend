const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const requireLogin = require("../middleware/requiredLogin");



router.get("/api/getallrooms", (req, res) => {
    Room.find()
        .then((rooms) => {
            res.json(rooms);
        }).catch((err) => {
            return res.status(422).json({ error: err })
        })
})

router.get('/api/availablerooms', async (req, res) => {
    try {
        const availableTeachers = await Room.find({ avalability: true });
        res.json(availableTeachers);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/api/editRoom', async (req, res) => {
    try {
        const { roomNo, date, shift, newTeacher, prevTeacher } = req.body;
        console.log("roomNo, date, shift, newTeacher, prevTeacher", roomNo, date, shift, newTeacher, prevTeacher)

        if (!roomNo || !date || !shift || !newTeacher || !prevTeacher) {
            res.status(422).json({ error: "Please add all fields" });
        }
        const room = await Room.findOne({ roomNo: roomNo });
        console.log("room", room)
        room.teachers = room.teachers.map((teacher) => {
            console.log("teacher", teacher)
            if (teacher.date === date) {
                teacher.allotedShift = teacher.allotedShift.map((shiftDetail) => {
                    if (shiftDetail.shift === shift) {
                        shiftDetail.teacherList = shiftDetail.teacherList.map((teacher) => {
                            if (teacher === prevTeacher) {
                                return newTeacher;
                            }
                            return teacher;
                        });
                    }
                    return shiftDetail;
                });
            }
            return teacher;
        });
        await room.save();
        res.status(200).json({ message: "Updated successfully", room });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
})

router.post("/api/searchrooms", (req, res) => {
    let pattern = new RegExp("^" + req.body.query, "i")
    Room.find({
        roomNo: { $regex: pattern },
    }).then((rooms) => {
        if (rooms.length === 0) {
            res.json({ message: "No room found" });
        } else {
            res.json({ rooms });
        }
    }).catch((err) => {
        console.log(err)
    })
})


router.post("/api/addroom", async (req, res) => {
    const { roomNo, capacity } = req.body;
    if (!roomNo || !capacity) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    if (capacity < 0) {
        return res.status(422).json({ error: "Capacity cannot be negative" })
    }
    if (roomNo < 0) {
        return res.status(422).json({ error: "Room number must be a positive number" });
    }
    try {
        const existingRoom = await Room.findOne({ roomNo });
        if (existingRoom) {
            return res.status(422).json({ error: 'Room already exists' });
        }

        const newRoom = new Room({ roomNo, capacity });
        const savedRoom = await newRoom.save();
        return res.status(201).json({ message: "Room Add Successfully", savedRoom });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
})

router.post("/api/updateroom", async (req, res) => {
    const { roomNo, updatedRoomNo } = req.body;
    if (!roomNo) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    if (!updatedRoomNo) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    if (roomNo === updatedRoomNo) {
        return res.status(422).json({ error: "Room number cannot be same" })
    }
    try {
        const existingRoom = await Room.findOne({ roomNo: updatedRoomNo })
        if (existingRoom) {
            return res.status(422).json({ error: "Room already exists" })
        }
        const room = await Room.findOneAndUpdate({ roomNo: roomNo }, { roomNo: updatedRoomNo })
        if (!room) {
            return res.status(422).json({ error: "Room not found" })
        }
        res.json(room);
    } catch (err) {
        return res.status(422).json({ error: err })
    }
})


router.post("/api/updateroomavalability", (req, res) => {
    const { roomNo, avalability } = req.body;
    if (!roomNo) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    Room.findOneAndUpdate({ roomNo: roomNo }, { avalability: avalability })
        .then((room) => {
            res.json(room);
        }).catch((err) => {
            return res.status(422).json({ error: err.msg })
        })
})


router.get(`/api/getRooms/:id`, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(422).json({ error: "Room not found" })
        }
        res.status(200).json(room);
    } catch (err) {
        return res.status(422).json({ error: err.msg })
    }
})
// router.get('/api/getShiftModel/:id', async (req, res) => {
//     try {
//         const shift = await ShiftModel.findById(req.params.id);
//         // console.log("shift", shift);
//         res.status(200).json(shift);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

router.get("/getroom", requireLogin, async (req, res) => {
    const { roomNo } = req.body;
    if (!roomNo) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    try {
        const room = await Room.findOne({ roomNo: roomNo })
            .select("roomNo capacity")
            .populate("teacherAlloted")
        if (!room) {
            return res.status(422).json({ error: "Room not found" })
        }
        res.json(room);
    } catch (err) {
        return res.status(422).json({ error: err.msg })
    }
})

router.delete("/deleteroom", requireLogin, async (req, res) => {
    const { roomNo } = req.body;
    if (!roomNo) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    try {
        const room = await Room.findOneAndDelete({ roomNo: roomNo })
        if (!room) {
            return res.status(422).json({ error: "Room not found" })
        }
        res.json(room);
    } catch (err) {
        return res.status(422).json({ error: err })
    }
})

module.exports = router;