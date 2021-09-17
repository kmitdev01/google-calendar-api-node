const { google } = require('googleapis');
require('dotenv').config();
var moment = require('moment');

// Provide the required configuration
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);


async function freeBusyStatus(auth, calendarId) {
    const startDate = new Date('17 september 2021 9:00').toISOString()
    const endDate = new Date('17 september 2021 19:00').toISOString()
    const check = {
        auth: auth,
        resource: {
            timeMin: startDate,
            timeMax: endDate,
            timeZone: "Asia/Kolkata",
            items: [{ id: calendarId }]
        }
    }

    const response = await calendar.freebusy.query(check)
    let allGoogleSlots = response.data.calendars[calendarId].busy;
    return allGoogleSlots;
}


const getSlots = function(req, res) {
    freeBusyStatus(auth, calendarId).then(freeslotss);

    function freeslotss(googleSlots) {
        {

            let x = {
                slotInterval: 30,
                openTime: '9:00',
                closeTime: '19:30'
            };

            //Format the time
            let startTime = moment(x.openTime, "HH:mm");
            const end = moment(x.openTime, "HH:mm")

            //Format the end time and the next day to it 
            let endTime = moment(x.openTime, "HH:mm").add(10, 'hours');

            //Times
            let allTimes = [];
            let busySlots = [];
            //Loop over the times - only pushes time with 30 minutes interval
            while (startTime < endTime) {
                //Push times
                allTimes.push({ "start": startTime.format("HH:mm"), "end": end.add(30, 'minutes').format("HH:mm") });
                //Add interval of 30 minutes
                startTime.add(x.slotInterval, 'minutes');
            }
            //console.log(allTimes);
            for (let i = 0; i < allTimes.length; i++) {
                const item = allTimes[i];
                googleSlots.forEach(slot => {
                    const { start, end } = slot;
                    if (moment(item.start, 'HH:mm').isBetween(moment(new Date(start)), moment(new Date(end))) ||
                        moment(item.end, 'HH:mm').isBetween(moment(new Date(start)), moment(new Date(end)))) {
                        busySlots.push(item);
                    }
                })
            }

            // console.log(busySlots)
            /// console.log(allTimes)
            var result = allTimes.filter(item1 =>
                !busySlots.some(item2 => (item2.start === item1.start && item2.end === item1.end)))

            return res.json({ message: "success", freeslots: result });
        }
    }

}

module.exports = { getSlots };