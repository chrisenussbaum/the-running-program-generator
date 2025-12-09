/**
 * Program Logic based on the 'Mileage Calculator / Planner' structure.
 *
 * Weekly Distribution Percentages (Approximate based on 12-18% range):
 * - Core/Strides Run: 12.00%
 * - Bands + Stretches Run: 18.00%
 * - Weights + Bands Run (Long Run/Race): ~18.00% (This is often the long run)
 * - Chill/Rest: 0.00% run (Day off)
 */

function generateProgram() {
  const weeklyMileage = parseFloat(document.getElementById('weeklyMileage').value);
  const trainingPhase = document.getElementById('trainingPhase').value;
  const scheduleBody = document.querySelector('#schedule-table tbody');
  const scheduleNote = document.getElementById('schedule-note');
  scheduleBody.innerHTML = ''; // Clear previous schedule

  if (isNaN(weeklyMileage) || weeklyMileage <= 0) {
    alert("Please enter a valid weekly mileage.");
    return;
  }

  // --- Define the Schedule based on the Planner Table Structure ---
  // The days use the approximate percentages seen in the screenshot
  const weeklyPlan = [
    { day: "Monday", focus: "Core/Strides Run", percent: 0.12 },
    { day: "Tuesday", focus: "Bands/Stretches Run", percent: 0.18 },
    { day: "Wednesday", focus: "Core/Strides Run (Workout Day - Fartlek/Threshold)", percent: 0.12 },
    { day: "Thursday", focus: "Bands/Stretches Run", percent: 0.12 },
    { day: "Friday", focus: "Core/Strides Run", percent: 0.18 },
    { day: "Saturday", focus: "Long Run / Race", percent: 0.28 }, // Assuming this covers the 'Weights + Bands' slot and is the long/race day. (100 - (12+18+12+12+18) = 28)
    { day: "Sunday", focus: "Chill / Rest Day", percent: 0.00 }
  ];

  // --- Adjustments based on Training Phase (Simplified Logic) ---
  let phaseFocus = "";
  switch (trainingPhase) {
    case 'BASE':
      phaseFocus = "Focus on Easy effort runs. Use Fartlek for light speed work.";
      weeklyPlan[2].focus = "Core/Strides Run (Light Fartlek)";
      weeklyPlan[5].focus = "Long Run (Easy/Lvl 1 effort)";
      break;
    case 'STRENGTH':
      phaseFocus = "Focus on Threshold and Fartlek workouts. Volume is high.";
      weeklyPlan[2].focus = "Core/Strides Run (Threshold Workout)";
      weeklyPlan[5].focus = "Long Run (Moderate effort)";
      break;
    case 'PEAK':
      phaseFocus = "Focus on Race Pace Fartlek. Highest volume week.";
      weeklyPlan[2].focus = "Core/Strides Run (Race Pace Fartlek)";
      weeklyPlan[5].focus = "Long Run (Race Prep)";
      break;
    case 'TAPER':
      phaseFocus = "Focus on rest and reduced volume. Run a couple of strides.";
      weeklyPlan.forEach(day => {
        day.percent *= 0.6; // ~40% reduction for taper
        if (day.focus.includes("Long Run")) day.focus = "Shortened Long Run";
      });
      break;
  }

  scheduleNote.innerHTML = `Phase: ${trainingPhase}. ${phaseFocus}`;

  // --- Generate Table Rows ---
  let totalScheduledMileage = 0;
  weeklyPlan.forEach(dayPlan => {
    const mileage = (weeklyMileage * dayPlan.percent).toFixed(2);
    totalScheduledMileage += parseFloat(mileage);

    const row = scheduleBody.insertRow();
    row.insertCell().textContent = dayPlan.day;
    row.insertCell().textContent = dayPlan.focus;
    row.insertCell().textContent = mileage > 0 ? `${mileage} miles` : '0 miles';
  });

  // Add a Total row
  const totalRow = scheduleBody.insertRow();
  totalRow.style.fontWeight = 'bold';
  totalRow.style.backgroundColor = '#ccffcc'; // Light green highlight
  totalRow.insertCell().textContent = "TOTAL";
  totalRow.insertCell().textContent = " ";
  totalRow.insertCell().textContent = `${totalScheduledMileage.toFixed(2)} miles`;
}

// Generate the initial program on load
document.addEventListener('DOMContentLoaded', generateProgram);
