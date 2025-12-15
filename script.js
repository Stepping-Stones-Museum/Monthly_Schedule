
let allEvents = {};
const blueColorEvents = ["Music Makers", "Discovery Station"];
const greenColorEvents = ["Page to Stage", "Turn the Page"];
const purpleColorEvents = ["Edible Garden"];
const pinkColorEvents = ["Puppet/Mascot"];
const calendarHeader = document.querySelector(".calendar-header")



setInterval(() => {
    location.reload();
}, 600000);


document.addEventListener('DOMContentLoaded', () => {

    const weekdays = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
    ];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = [
        '', '_2026', '_2027'
    ];

    // Initial month/day to display
    let chosenMonth = "09";
    let chosenDay = "02";
    let renderMonth = new Date().getMonth();
    let renderYear = 0;
    let fetchUrl = `https://ssmc-daily-schedule-default-rtdb.firebaseio.com/${months[renderMonth]}${years[renderYear]}.json`;

    console.log(fetchUrl)



    // List of locations (columns) in the schedule table
    const locations = [
        "Traveling", "PG", "MMG", "Courtyard", "Big Adventures", "Lights On",
        "Energy Lab", "Hub", "Light Gallery", "Studio K", "Edible Garden",
        "Book Nook", "Roaming"
    ];

    // Create 30-minute time increments for the schedule (10:00-17:00)
    const times = [];
    for (let h = 10; h <= 17; h++) {
        if (h < 17) {
            times.push(`${h.toString().padStart(2, '0')}:00`);
            times.push(`${h.toString().padStart(2, '0')}:30`);
        } else {
            times.push(`${h.toString().padStart(2, '0')}:00`);
        }
    }

    // Define background colors for each activity type
    const eventColors = {
        "Music Makers": "#A4C1E3",
        "Art Smarts": "#A4C1E3",
        "Puppet Place": "#A4C1E3",
        "Edible Garden": "#EBB1CC",
        "Pop Up": "#B1A3CB",
        "Turn the Page": "#CBDEB8",
        "Page to Stage": "#CBDEB8",
        "Art of Storytelling": "#CBDEB8",
        "Let's Move": "#A4C1E3",
        "Discovery Station": "#A4C1E3",
        "Puppet/Mascot": "#EBB1CC"
    };






    // Create a container for additional activity lists (optional)
    const activityListContainer = document.createElement("div");
    activityListContainer.id = "activity-list";
    document.body.prepend(activityListContainer);

    // Helper function to extract time from a datetime string
    function itemTime(dateTimeStr) {
        return dateTimeStr.split(" ")[1];
    }

    // Main function to render schedules
    function renderAllSchedules() {
        // Generate 7-day schedule range starting from chosen date
        let startDate = new Date("2025-" + chosenMonth + "-" + chosenDay);
        const scheduleDates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        });

        // Convert "HH:MM" to total minutes
        function timeToMinutes(timeStr) {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
        }

        // Format date string as "Weekday, Month Day"
        function formatDateFromYMD(dateStr) {
            const [year, month, day] = dateStr.split('-').map(Number);
            const d = new Date(Date.UTC(year, month - 1, day));



            const weekdayName = weekdays[d.getUTCDay()];
            const monthName = months[month - 1];

            return `${weekdayName}, ${monthName} ${day}`;
        }

        const container = document.getElementById("weekly-schedule-container");
        container.innerHTML = ""; // Clear previous content

        scheduleDates.forEach((dateStr) => {
            // Filter events for the current date
            const eventsForDate = allEvents.filter(e => e.date === dateStr);

            // Group events by location (excluding certain locations if needed)
            const eventsByLocation = {};
            eventsForDate.forEach(event => {
                if (event.location === "Mathews Park") return;
                if (!eventsByLocation[event.location]) eventsByLocation[event.location] = [];
                eventsByLocation[event.location].push(event);
            });

            const dateWrapper = document.createElement("div");
            dateWrapper.className = "day-schedule";

            const heading = document.createElement("h2");
            const prettyDate = formatDateFromYMD(dateStr);
            const activityTotal = eventsForDate.filter(e => e.location !== "Mathews Park").length;
            heading.textContent = `${prettyDate} — Total Activities: ${activityTotal}`;
            heading.id = prettyDate.replace(/, /g, "-").replace(/ /g, "_");

            dateWrapper.appendChild(heading);

            // Create a mapping of events by cell key for rendering
            const eventMap = {};
            eventsForDate.forEach(event => {
                const startIndex = times.indexOf(event.start);
                const endIndex = times.indexOf(event.end);
                const rowspan = endIndex - startIndex;

                if (startIndex !== -1 && rowspan > 0) {
                    const key = `${startIndex}-${event.location}`;
                    eventMap[key] = {
                        activityLabel: event.activity,
                        hoursLabel: `<small>(${event.hours})</small>`,
                        staffLabel: event.staff ? `Staff: ${event.staff}` : "",
                        descLabel: event.description ? `<small>${event.description}</small>` : "",
                        rowspan,
                        bgColor: event.hasConflict ? '#FF6666' : (eventColors[event.activity])
                    };
                }
            });

            // Create table and header row
            const table = document.createElement("table");
            const thead = table.createTHead();
            const headRow = thead.insertRow();
            const th = document.createElement("th");
            th.textContent = "Time";
            headRow.appendChild(th);
            locations.forEach(loc => {
                const locTh = document.createElement("th");
                locTh.textContent = loc;
                headRow.appendChild(locTh);
            });

            // Create table body
            const tbody = table.createTBody();
            const skipMap = {};
            locations.forEach(loc => skipMap[loc] = 0);

            // Loop through each time slot
            times.forEach((time, rowIdx) => {
                const tr = tbody.insertRow();
                const timeTd = document.createElement("td");
                timeTd.classList.add("time-cell");
                timeTd.textContent = time;
                tr.appendChild(timeTd);

                locations.forEach(loc => {
                    if (skipMap[loc] > 0) { // Skip cells covered by rowspan
                        skipMap[loc]--;
                        return;
                    }

                    const key = `${rowIdx}-${loc}`;
                    if (eventMap[key]) {
                        // Create event cell
                        const td = document.createElement("td");
                        const divOne = document.createElement("div");
                        const activityName = document.createElement("p");
                        const activityHours = document.createElement("p");
                        const divTwo = document.createElement("div");
                        const activityStaff = document.createElement("p");

                        // Handle description if present
                        if (eventMap[key].descLabel) {
                            const activityDesc = document.createElement("p");
                            activityDesc.classList.add("description");
                            activityDesc.innerHTML = eventMap[key].descLabel;

                            if (eventMap[key].descLabel.length > 20) {
                                expandToggle = document.createElement("span");
                                expandToggle.classList.add("expand-toggle");
                                expandToggle.innerText = "Expand";
                                // Toggle expand/collapse
                                expandToggle.addEventListener("click", () => {
                                    if (activityDesc.classList.contains("expanded")) {
                                        activityDesc.classList.remove("expanded");
                                        expandToggle.innerText = "Expand";
                                        activityDesc.style.webkitLineClamp = "2";
                                    } else {
                                        activityDesc.classList.add("expanded");
                                        expandToggle.innerText = "Collapse";
                                        activityDesc.style.webkitLineClamp = "unset";
                                    }
                                });
                            }







                            // Container for description + toggle
                            const descContainer = document.createElement("div");
                            descContainer.classList.add("description-container");
                            descContainer.appendChild(activityDesc);
                            descContainer.appendChild(expandToggle);



                            divTwo.appendChild(descContainer);
                        }

                        divOne.classList.add("event-div");
                        divTwo.classList.add("event-div");

                        activityName.innerHTML = eventMap[key].activityLabel;
                        activityHours.innerHTML = eventMap[key].hoursLabel;
                        activityStaff.innerHTML = eventMap[key].staffLabel;

                        divOne.appendChild(activityName);
                        divOne.appendChild(activityHours);
                        divTwo.appendChild(activityStaff);

                        td.appendChild(divOne);
                        td.appendChild(divTwo);
                        td.rowSpan = eventMap[key].rowspan;
                        td.style.backgroundColor = eventMap[key].bgColor;
                        td.className = "event";

                        tr.appendChild(td);
                        skipMap[loc] = eventMap[key].rowspan - 1;
                    } else {
                        tr.appendChild(document.createElement("td")); // Empty cell
                    }
                });
            });

            dateWrapper.appendChild(table);
            container.appendChild(dateWrapper);

            // Check if total events rendered match expected and flag conflicts
            const tables = document.querySelectorAll("table");
            tables.forEach((table) => {
                const rows = table.querySelectorAll("tr");
                let count = 0;
                rows.forEach((row) => {
                    const eventsInRow = row.querySelectorAll("td.event");
                    count += eventsInRow.length;
                });

                heading.textContent = `${prettyDate} — Total Activities Shown: ${count} / ${activityTotal}`;
                if (count !== activityTotal) {
                    heading.classList.add("red");
                } else {
                    heading.classList.remove("red");
                }

            });





            tables.forEach((table) => {
                const rows = table.querySelectorAll("tr");
                const cols = table.querySelectorAll("th");


                // console.log("cols:", cols.length)
                // console.log("rows:", rows.length)


                for (let j = 2; j < cols.length - 1; j++) {
                    let eventCounter = 0;
                    for (let i = 1; i < rows.length; i++) {
                        const firstTdInRow = rows[i].querySelector(`td:nth-child(${j})`);
                        // console.log(firstTdInRow);

                        if (firstTdInRow && firstTdInRow.classList.contains("event")) {
                            eventCounter += 1;
                            break
                        } else {
                            // console.log(emptyRowCount);
                        }
                    }

                    if (eventCounter === 0) {
                        for (let i = 1; i < rows.length; i++) {
                            const firstTdInRow = rows[i].querySelector(`td:nth-child(${j})`);
                            if (firstTdInRow) {
                                firstTdInRow.style.display = "none";
                            }
                        }
                        const firstThInRow = rows[0].querySelector(`th:nth-child(${j})`);
                        // console.log("header", firstThInRow)
                        if (firstThInRow) {
                            firstThInRow.style.display = "none";
                        }
                    }
                }

            });

        });
    }

    // Event listeners for day/month buttons (desktop dropdowns)
    const singleDateDropdownBtn = document.querySelectorAll(".single-date-dropdown-btn");
    singleDateDropdownBtn.forEach(btn => {
        btn.addEventListener("click", function () {

            const btnVal = btn.getAttribute("button-value");
            const btnUrl = btn.getAttribute("button-url");
            const dropdown = document.querySelector(".dropdown-nav-container month-dropdown");
            chosenMonth = btnVal;
            fetchUrl = btnUrl;
            fetchWithUrl(fetchUrl);
            renderAllSchedules(chosenMonth, chosenDay);
        });
    });

    const chooseDayProgramDesktopBtn = document.querySelectorAll(".choose-day-program-desktop-btn");
    chooseDayProgramDesktopBtn.forEach(btn => {
        btn.addEventListener("click", function () {
            const val = btn.getAttribute("button-value");
            chosenDay = val;
            renderAllSchedules(chosenMonth, chosenDay);

            chooseDayProgramDesktopBtn.forEach(b => b.classList.remove("active-desktop-daily-toggle-btn"));
            btn.classList.add("active-desktop-daily-toggle-btn")




        });
    });



    let currentDate = new Date(); // November 2025 (month is 0-based)
    const calendar = document.getElementById("calendar");
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        document.getElementById("monthLabel").innerText =
            date.toLocaleString("default", { month: "long", year: "numeric" });


        calendar.innerHTML = "";

        // Fill empty cells before first day TEST
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.classList.add("day", "empty");
            calendar.appendChild(emptyCell);
        }

        // Fill actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("div");
            dayCell.classList.add("day");

            const dayNumber = document.createElement("div");
            dayNumber.classList.add("day-number");
            dayNumber.textContent = day;

            dayCell.appendChild(dayNumber);



            const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const theDay = new Date(isoDate).getDay();

            if (theDay === 2) {

                dayCell.classList.add("closed-day");
            }


            const days = 40;

            const fallStart = new Date(2025, 9, 19);   // Jan 19, 2025 (month is 0-indexed)
            const winterStart = new Date(2025, 10, 28); // Nov 28, 2025

            for (let i = 0; i < days; i++) {
                let d = new Date(fallStart);   // clone start date
                d.setDate(fallStart.getDate() + i);  // add i days
                let key = d.toISOString().split("T")[0]; // YYYY-MM-DD

                if (isoDate === key) {
                    dayCell.classList.add("background-leaf");
                }
            }

            for (let i = 0; i < days; i++) {
                let d = new Date(winterStart);  // clone start date
                d.setDate(winterStart.getDate() + i);
                let key = d.toISOString().split("T")[0];

                if (isoDate === key) {
                    dayCell.classList.remove("background-leaf");
                    dayCell.classList.add("background-ice");
                }
            }





            // if (events[isoDate]) {
            //     events[isoDate].forEach(ev => {
            //         const eventEl = document.createElement("div");
            //         eventEl.classList.add("event");
            //         eventEl.textContent = ev;
            //         dayCell.appendChild(eventEl);
            //     });
            // }

            const eventContainer = document.createElement("div");
            eventContainer.classList.add("day-events-container");

            const eventBlockTop = document.createElement("div");
            eventBlockTop.classList.add("day-events-block", "day-events-top");

            const eventBlockMiddle = document.createElement("div");
            eventBlockMiddle.classList.add("day-events-block", "day-events-middle");

            const eventBlockBottom = document.createElement("div");
            eventBlockBottom.classList.add("day-events-block", "day-events-bottom");

            eventContainer.appendChild(eventBlockTop);
            eventContainer.appendChild(eventBlockMiddle);
            eventContainer.appendChild(eventBlockBottom);

            dayCell.appendChild(eventContainer);



            // Loops through all events for the day
            for (let i = 0; i < allEvents.length; i++) {
                if (allEvents[i].date == isoDate) {
                    const eventEl = document.createElement("p");
                    eventEl.classList.add("event");
                    eventEl.textContent = allEvents[i].activity;

                    const eventBlockSingle = document.createElement("div");
                    eventBlockSingle.classList.add("block-single");


                    // Config map: define which block to append to and if it needs a time element
                    const eventConfig = {
                        "Dismissals": { block: eventBlockTop, addTime: false, class: "dismissals" },
                        "Closures": { block: eventBlockTop, addTime: false, class: "closures" },
                        "All Day Event": { block: eventBlockTop, addTime: false, class: "all-day" },
                        "Holiday": { block: eventBlockTop, addTime: false, class: "holiday" },

                        "Maintenance": { block: eventBlockBottom, addTime: false, class: "maintenance" },

                        "Experiences": { block: eventBlockMiddle, addTime: true, class: "experiences" },
                        "Facility Rental": { block: eventBlockMiddle, addTime: true, class: "facility-rental" },
                        "ELLI": { block: eventBlockMiddle, addTime: true, class: "elli" },
                        "Group & School": { block: eventBlockMiddle, addTime: true, class: "group-school" },
                        "Community Event": { block: eventBlockMiddle, addTime: true, class: "community-event" },
                        "Birthday Party": { block: eventBlockMiddle, addTime: true, class: "birthday" },
                    };

                    // Look up the event type in the config
                    const config = eventConfig[allEvents[i].type];

                    if (config) {
                        if (config.addTime) {
                            const eventTime = document.createElement("p");
                            eventTime.textContent = allEvents[i].hours;
                            eventTime.classList.add("event", config.class);
                            eventBlockSingle.appendChild(eventTime);
                        }



                        const divBlock = document.createElement('div');
                        divBlock.append(eventEl);
                        divBlock.classList.add("event")
                        eventBlockSingle.appendChild(divBlock);


                        if (allEvents[i].location !== "None") {
                            const eventLoc = document.createElement("p");
                            eventLoc.textContent = allEvents[i].location;
                            eventLoc.classList.add("event", config.class);
                            divBlock.textContent = `${allEvents[i].activity} [${allEvents[i].location}]`;

                            eventBlockSingle.appendChild(divBlock);
                        }

                        eventBlockSingle.classList.add(config.class);

                        config.block.appendChild(eventBlockSingle);
                        eventEl.classList.add(config.class);
                    }

                    // eventList.appendChild(eventNameLi);
                    // const eventHoursLi = document.createElement("li");
                    // eventHoursLi.textContent = allEvents[i].hours;
                    // eventList.appendChild(eventHoursLi);

                    // eventContainer.addEventListener("click", function () {
                    //     eventContainer.querySelector(".event-expanded").classList.toggle("display-block")
                    // })

                    // if (pinkColorEvents.includes(allEvents[i].activity)) {
                    //     eventEl.classList.add("pink-bg");
                    // } else if (greenColorEvents.includes(allEvents[i].activity)) {
                    //     eventEl.classList.add("green-bg");
                    // } else if (purpleColorEvents.includes(allEvents[i].activity)) {
                    //     eventEl.classList.add("purple-bg");
                    // } else if (blueColorEvents.includes(allEvents[i].activity)) {
                    //     eventEl.classList.add("blue-bg");
                    // }
                    // eventEl.textContent = allEvents[i].activity;


                    // eventExpanded.appendChild(eventList);

                    // eventContainer.appendChild(eventEl);
                    // eventContainer.appendChild(eventExpanded);

                }
            }




            calendar.appendChild(dayCell);
        }

        // for (let i = 0; i < days; i + 7) {
        //     const d = new Date(start);
        //     d.setDate(start.getDate() + i);
        //     const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        //     console.log(key)
        //     const cell = document.querySelector(`${selector}[data-date="${key}"]`);
        //     if (!cell) continue;

        //     // Skip if already marked
        //     if (cell.querySelector(".background-leaf")) continue;

        //     cell.classList.add("background-leaf")
        // }
    }



    document.getElementById("prevMonth").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        if (renderMonth == 0) {
            renderMonth = 11;
            renderYear -= 1;
        } else {
            renderMonth -= 1;
        }
        fetchUrl = `https://ssmc-daily-schedule-default-rtdb.firebaseio.com/${months[renderMonth]}${years[renderYear]}.json`;
        fetchWithUrl(fetchUrl);
        changeHeadingBg(months[renderMonth]);
        // renderCalendar(currentDate);
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);

        if (renderMonth == 11) {
            renderMonth = 0;
            renderYear += 1;
        } else {
            renderMonth += 1;
        }

        fetchUrl = `https://ssmc-daily-schedule-default-rtdb.firebaseio.com/${months[renderMonth]}${years[renderYear]}.json`;
        fetchWithUrl(fetchUrl);
        changeHeadingBg(months[renderMonth]);
        // renderCalendar(currentDate);
    });

    function changeHeadingBg(month) {
        calendarHeader.classList = 'calendar-header';
        const monthLabel = document.getElementById('monthLabel')
        if (month == 'November') {
            calendarHeader.classList = 'calendar-header november-bg';
            monthLabel.classList = 'november'
        } else if (month == 'December') {
            calendarHeader.classList = 'calendar-header december-bg';
            monthLabel.classList = 'december'
        } else if (month == 'October') {
            calendarHeader.classList = 'calendar-header october-bg';
            monthLabel.classList = 'october'
        } else if (month == 'January') {
            calendarHeader.classList = 'calendar-header january-bg';
            monthLabel.classList = 'january'
        } else if (month == 'February') {
            calendarHeader.classList = 'calendar-header february-bg';
            monthLabel.classList = 'february'
        } else if (month == 'March') {
            calendarHeader.classList = 'calendar-header march-bg';
            monthLabel.classList = 'march'
        } else if (month == 'April') {
            calendarHeader.classList = 'calendar-header april-bg';
            monthLabel.classList = 'april'
        } else if (month == 'June') {
            calendarHeader.classList = 'calendar-header june-bg';
            monthLabel.classList = 'june'
        } else if (month == 'July') {
            calendarHeader.classList = 'calendar-header july-bg';
            monthLabel.classList = 'july'
        }
    }


    // Fetch events data from Firebase Realtime Database

    fetchWithUrl(fetchUrl)

    function fetchWithUrl(urlData) {
        fetch(urlData)
            .then((res) => res.json())
            .then((data) => {
                allEvents = Object.values(data);
                renderAllSchedules(chosenMonth, chosenDay); // Initial render
                renderCalendar(currentDate);

                console.log(currentDate)
                console.log("Rendered Info", allEvents)
            })
            .catch((err) => {
                console.error("Failed to fetch schedule data:", err);
            });
    }

    const monthlyCalendarSection = document.querySelector(".monthly-calendar-section")
    const dailyCalendarSection = document.querySelector(".daily-calendar-section")
    const chooseCalendarViewBtns = document.querySelectorAll(".choose-calendar-view-btn");
    let monthlyView = false;

    chooseCalendarViewBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            monthlyView = !monthlyView; // toggle true/false
            toggleCalendarView();
        });
    });

    function toggleCalendarView() {
        const calendar = document.querySelector(".calendar"); // or your calendar element
        if (monthlyView) {
            monthlyCalendarSection.style.display = "block";
            dailyCalendarSection.style.display = "none";
        } else {
            monthlyCalendarSection.style.display = "none";
            dailyCalendarSection.style.display = "block";
        }
    }





});

