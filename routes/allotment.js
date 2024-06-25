const express = require("express")
const router = express.Router();
const Room = require("../models/Room");
const Teacher = require("../models/Teacher");
const requiredLogin = require("../middleware/requiredLogin");
const ShiftModel = require("../models/ShiftModel");
const DateModel = require("../models/Date");


router.post("/allotment", requiredLogin, async (req, res) => {
    const { rooms, teachers } = req.body;
    if (!teachers) {
        return res(422).json({ error: "Please add all fields" })
    }
    try {
        const existingRoom = await Room.find()
            .select("roomNo capacity")
            .populate("teacherAlloted")
            .populate("shift")
    }
    catch (err) {
        return res.status(422).json({ error: err })
    }




})
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;

};

router.post('/api/allocateTeachers',requiredLogin, async (req, res) => {
    try {
        const { date } = req.body;
        const rooms = await Room.find({ avalability: true });
        if (rooms.length == 0) {
            return res.status(422).json({ error: "No rooms available" });
        }
        const dateAvalability = await DateModel.findOne({ date: date })
        // console.log("dateAvalability", dateAvalability);
        if (dateAvalability) {
            return res.status(422).json({ error: "Already allocated" });
        }

        for (let shift = 1; shift < 4; shift++) {
            let teacherIndex = 0;
            let count = 0;
            const availableAllTeachers = shuffleArray(await Teacher.find({ avalability: true, leave: false }));
            const unallocatedTeachers = shuffleArray(await Teacher.find({ avalability: false, leave: false }));

            for (let room of rooms) {

                if (availableAllTeachers.length === 0) {
                    return res.status(422).json({ error: "All Teacher are on leave" });
                }

                let allotedTeachers = [];

                let requiredTeachers = Math.ceil(room.capacity / 20);
                for (let i = 0; i < requiredTeachers; i++) {
                    while (teacherIndex < availableAllTeachers.length && availableAllTeachers[teacherIndex].allotedRooms.length === 5) {
                        availableAllTeachers[teacherIndex].leave = true;
                        await availableAllTeachers[teacherIndex].save();
                        teacherIndex++;
                        if (teacherIndex === availableAllTeachers.length) {
                            return res.status(422).json({ error: "No teachers available" });
                        }
                    }

                    while (teacherIndex < availableAllTeachers.length && availableAllTeachers[teacherIndex].cycleCompleted) {
                        teacherIndex++;
                    }
                    if (teacherIndex === availableAllTeachers.length) {
                        teacherIndex = 0;
                        while (availableAllTeachers[teacherIndex].avalability === false) {
                            teacherIndex++;
                            if (teacherIndex === availableAllTeachers.length) {
                                return res.status(422).json({ error: "No teachers available" });
                            }
                        }
                        availableAllTeachers.forEach(teacher =>
                            teacher.cycleCompleted = false
                        );
                        unallocatedTeachers.forEach(teacher => teacher.cycleCompleted = false);

                    }
                    availableAllTeachers[teacherIndex].allotedRooms.push({ Shift: shift, room: room.roomNo, date: date });
                    allotedTeachers.push(availableAllTeachers[teacherIndex].name);
                    availableAllTeachers[teacherIndex].avalability = false;
                    availableAllTeachers[teacherIndex].cycleCompleted = true;
                    await availableAllTeachers[teacherIndex].save();
                    teacherIndex++;
                    count++;
                }


                const dateAvailable = room.teachers.find((teacher) => teacher.date === date);
                // console.log("dateAvailable", dateAvailable);

                if (dateAvailable) {
                    dateAvailable.allotedShift.push({ shift: shift, teacherList: allotedTeachers });
                    // await dateAvailable.save();
                } else {
                    room.teachers.push({ date: date, allotedShift: { shift: shift, teacherList: allotedTeachers } });
                    // await room.save();
                }


                await room.save();


            }

            for (let i = 0; i < availableAllTeachers.length; i++) {
                if (availableAllTeachers[i].avalability) {
                    availableAllTeachers[i].avalableDates.push({ date: date, shift: shift });
                    await availableAllTeachers[i].save();
                }
            }

            const dateavalabile = await DateModel.findOne({ date: date });
            if (!dateavalabile) {
                const AddNewDate = new DateModel({ date: date, rooms: rooms });
                await AddNewDate.save();
            }
            let index = 0;
            while (index < unallocatedTeachers.length) {
                unallocatedTeachers[index].avalability = true;
                await unallocatedTeachers[index].save();
                index++;
            }


        }
        res.json({ success: 'Teachers allocated successfully', rooms });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/clearTeachers',requiredLogin, async (req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
        return res.status(400).json({ error: "Room ID is required" });
    }


    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        room.teachers = [];
        await room.save();

        res.json({ message: 'Teachers cleared successfully', room });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;