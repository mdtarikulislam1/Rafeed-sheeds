// utils/dateRangeHelper.js

export const startOfDay = (d) => {
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (d) => {
  d.setHours(23, 59, 59, 999);
  return d;
};

// helper: Saturday = 6
export const getDiffFromSaturday = (day) => {
  return (day + 1) % 7; // Saturday → 0, Sunday → 1 ...
};

// Main reusable function
export const getDateRange = (option) => {
  const now = new Date();
  let start, end;

  switch (option) {
    case "Today":
      start = startOfDay(new Date(now));
      end = endOfDay(new Date(now));
      break;

    case "Last 30 Days":
      start = startOfDay(new Date(now));
      start.setDate(now.getDate() - 30);
      end = endOfDay(new Date(now));
      break;

    case "This Year":
      if (now.getMonth() >= 5) {
        start = startOfDay(new Date(now.getFullYear(), 5, 1));
      } else {
        start = startOfDay(new Date(now.getFullYear() - 1, 5, 1));
      }
      end = endOfDay(new Date(now));
      break;

    case "This Month":
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      end = endOfDay(new Date(now));
      break;

    case "This Week":
      const diff = getDiffFromSaturday(now.getDay());
      start = startOfDay(new Date(now));
      start.setDate(now.getDate() - diff);
      end = endOfDay(new Date(now));
      break;

    case "Last Week":
      const diff2 = getDiffFromSaturday(now.getDay());
      end = endOfDay(new Date(now));
      end.setDate(now.getDate() - diff2 - 1);
      start = startOfDay(new Date(end));
      start.setDate(end.getDate() - 6);
      break;

    case "Last Month":
      start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      break;

    case "Last Year":
      let thisFiscalStart;
      if (now.getMonth() >= 5) {
        thisFiscalStart = new Date(now.getFullYear(), 5, 1);
      } else {
        thisFiscalStart = new Date(now.getFullYear() - 1, 5, 1);
      }
      start = startOfDay(new Date(thisFiscalStart.getFullYear() - 1, 5, 1));
      end = endOfDay(new Date(thisFiscalStart.getFullYear(), 4, 31));
      break;

    default:
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      end = endOfDay(new Date(now));
  }

  return { start, end };
};

// comment pore lagte pare ai jonno raka

//   const startOfDay = (d) => {
//     d.setHours(0, 0, 0, 0);
//     return d;
//   };

//   const endOfDay = (d) => {
//     d.setHours(23, 59, 59, 999);
//     return d;
//   };

//   // helper: Saturday = 6
//   const getDiffFromSaturday = (day) => {
//     // JS: Sunday = 0 ... Saturday = 6
//     return (day + 1) % 7; // Saturday → 0, Sunday → 1, Monday → 2 ... Friday → 6
//   };

//   const getDateRange = (option) => {
//     const now = new Date();
//     let start, end;

//     switch (option) {
//       case "Last 30 Days":
//         start = startOfDay(new Date(now));
//         start.setDate(now.getDate() - 30);
//         end = endOfDay(new Date(now));
//         break;

//       case "This Year":
//         start = startOfDay(new Date(now.getFullYear(), 0, 1));
//         end = endOfDay(new Date(now));
//         break;

//       case "This Month":
//         start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
//         end = endOfDay(new Date(now));
//         break;

//       case "This Week":
//         const diff = getDiffFromSaturday(now.getDay());
//         start = startOfDay(new Date(now));
//         start.setDate(now.getDate() - diff);
//         end = endOfDay(new Date(now));
//         break;

//       case "Last Week":
//         const diff2 = getDiffFromSaturday(now.getDay());
//         end = endOfDay(new Date(now));
//         end.setDate(now.getDate() - diff2 - 1); // last week's Friday
//         start = startOfDay(new Date(end));
//         start.setDate(end.getDate() - 6); // start from Saturday
//         break;

//       case "Last Month":
//         start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
//         end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
//         break;

//       case "Last Year":
//         start = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
//         end = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
//         break;

//       default:
//         start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
//         end = endOfDay(new Date(now));
//     }

//     return { start, end };
//   };
