// $(document).ready(() => {
//   let calendarEl = document.getElementById("calendar");
//   let today = new Date();
//   let clickCnt = 0;

//   let calendar = new FullCalendar.Calendar(calendarEl, {
//     selectable: true,
//     headerToolbar: {
//       left: "prevYear,prev,next,nextYear today",
//       center: "title",
//       right: "dayGridMonth,dayGridWeek,dayGridDay",
//     },
//     select: function (startDate, endDate, jsEvent, view) {},
//     dateClick: function (info) {},
//     // Custom double-click handling
//     height: "calc(100vh - 200px)",
//     // height: "500px",
//     width: "100%",
//     initialDate: today, //'2023-01-12',
//     navLinks: true, // can click day/week names to navigate views
//     editable: true,
//     dayMaxEvents: true, // allow "more" link when too many events
//     // events: events,
//     themeSystem: "lumen",
//   });

//   calendar.render();
// });
