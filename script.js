/**
 * Converts seconds per mile to "M:SS / mile" format.
 */
function formatPace(paceSeconds) {
  const totalSeconds = Math.round(paceSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculates all personalized training paces based on the user's 5K time.
 * @param {number} totalSeconds - The user's 5K time in seconds.
 * @returns {object} An object containing all calculated training paces in seconds per mile.
 */
function calculatePaces(totalSeconds) {
  // 5K distance in miles
  const D_5K = 3.107;

  // 5K pace in seconds per mile
  const basePace = totalSeconds / D_5K;

  // Multipliers are based on common coaching standards relative to 5K pace.
  return {
    // Easy/Recovery Run: 15-20% slower than 5K pace
    easyLongPace: basePace * 1.18,

    // Tempo Run: 5-10% slower than 5K pace (held for 20-40 min)
    tempoPace: basePace * 1.07,

    // Threshold (T-Pace): 3-5% slower than 5K pace (held for 5-15 min repeats)
    thresholdPace: basePace * 1.035,

    // Interval (I-Pace): 5K pace or slightly faster (e.g., 800m, 1000m repeats)
    intervalPace: basePace * 0.98,

    // Repetition (R-Pace): 10-15% faster than 5K pace (e.g., 200m, 400m repeats)
    repeatPace: basePace * 0.88
  };
}


function generateProgram() {
  const mileageInput = parseFloat(document.getElementById('weeklyMileage').value);
  const phaseInput = document.getElementById('trainingPhase').value;
  const timeInput = document.getElementById('fiftkTime').value;
  const daysInput = parseInt(document.getElementById('trainingDays').value);
  const scheduleBody = document.querySelector('#schedule-table tbody');
  const scheduleNote = document.getElementById('schedule-note');
  scheduleBody.innerHTML = '';

  // 1. Validate and Calculate Paces
  const timeParts = timeInput.split(':').map(Number);
  if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
    alert("Please enter a valid 5K time in MM:SS format.");
    return;
  }
  const totalSeconds = (timeParts[0] * 60) + timeParts[1];

  if (totalSeconds <= 0) {
    alert("Please enter a realistic 5K time.");
    return;
  }

  const paces = calculatePaces(totalSeconds);
  const fp = {}; // formatted paces
  for (const key in paces) {
    fp[key] = formatPace(paces[key]);
  }

  // 2. Define Weekly Plan (Default 6 Days, with percentages based on planner table)
  let weeklyPlan = [
    // Percentages approximate the 12%, 18%, 12%, 12%, 18%, 28% distribution (total 100%)
    { day: "Monday", focus: `Easy Run (${fp.easyLongPace}/mile) + Core/Strides`, percent: 0.17, isRun: true }, // 12% + 5% bump
    { day: "Tuesday", focus: `Threshold Repeats (e.g., 4 \times 1-mile @ ${fp.thresholdPace}/mile) + Bands`, percent: 0.18, isRun: true },
    { day: "Wednesday", focus: `Easy/Recovery Run (${fp.easyLongPace}/mile) + Core/Strides`, percent: 0.17, isRun: true }, // 12% + 5% bump
    { day: "Thursday", focus: `Tempo Run (${fp.tempoPace}/mile) + Bands`, percent: 0.17, isRun: true }, // 12% + 5% bump
    { day: "Friday", focus: `Easy Run (${fp.easyLongPace}/mile) + Core/Strides`, percent: 0.18, isRun: true },
    { day: "Saturday", focus: `Long Run (${fp.easyLongPace}/mile)`, percent: 0.13, isRun: true }, // Reduced Saturday long run for better distribution
    { day: "Sunday", focus: "Rest Day", percent: 0.00, isRun: false }
  ];

  // Adjust Long Run based on the sum of other days' percentages:
  const calculatedSum = weeklyPlan.reduce((sum, day) => sum + day.percent, 0);
  const saturdayShare = 1.00 - calculatedSum;
  weeklyPlan[5].percent = saturdayShare > 0 ? saturdayShare : 0.28; // Ensure Saturday gets the bulk if calculation is off


  // 3. Adjust for Training Days (Overwriting the 6-day plan)
  if (daysInput === 5) {
    // Eliminate Friday run and make Sunday the only rest day
    weeklyPlan[4].focus = weeklyPlan[3].focus; // Move Thursday run focus to Friday
    weeklyPlan[3].focus = "Rest Day"; // Make Thursday rest day
    weeklyPlan[3].percent = 0.00;

    // Redistribute Thursday's volume (0.17)
    weeklyPlan[0].percent += 0.05;
    weeklyPlan[2].percent += 0.05;
    weeklyPlan[5].percent += 0.07;
  } else if (daysInput === 7) {
    // Convert Sunday rest day to a short, chill run.
    weeklyPlan[6].focus = `Chill Run (${fp.easyLongPace}/mile) - No more than 5% volume`;
    weeklyPlan[6].percent = 0.05;
    weeklyPlan[5].percent -= 0.05; // Take 5% from the Long Run
  }

  // 4. Adjust Workouts based on Phase
  let phaseFocus = "";
  switch (phaseInput) {
    case 'BASE':
      phaseFocus = "Focus on Easy effort and building distance. Speed work is controlled Fartlek.";
      weeklyPlan[1].focus = `Light Fartlek (e.g., 5 \times 2-min hard @ ${fp.intervalPace}/mile) + Bands`;
      weeklyPlan[3].focus = `Tempo Run (short duration) @ ${fp.tempoPace}/mile + Bands`;
      break;
    case 'STRENGTH':
      phaseFocus = "Focus on Threshold and Tempo volume. Speed work introduces longer repeats (e.g., 1000s).";
      weeklyPlan[1].focus = `Threshold Repeats (e.g., 4 \times 1000$-m @ ${fp.thresholdPace}/mile) + Bands`;
      weeklyPlan[3].focus = `Longer Tempo Run (e.g., 4 miles @ ${fp.tempoPace}/mile) + Bands`;
      break;
    case 'PEAK':
      phaseFocus = "Focus on Race Pace (Intervals) and maintenance. Highest volume week.";
      weeklyPlan[1].focus = `Intervals (e.g., $6 \times 800$-m @ ${fp.intervalPace}/mile) + Bands`;
      weeklyPlan[3].focus = `Threshold Repeats (e.g., $3 \times 1$-mile @ ${fp.thresholdPace}/mile) + Bands`;
      break;
    case 'TAPER':
      phaseFocus = "Focus on rest and reduced volume (~40% reduction). Keep strides sharp.";
      weeklyPlan.forEach(day => {
        day.percent *= 0.6; // 40% volume reduction
        if (day.focus.includes("Long Run")) day.focus = "Shortened Long Run";
        if (day.focus.includes("Threshold")) day.focus = "Strides Only (4x100m)";
        if (day.focus.includes("Tempo")) day.focus = "Very Easy Run";
      });
      break;
  }

  scheduleNote.innerHTML = `Phase: ${phaseInput}. ${phaseFocus}`;

  // 5. Generate Table Rows
  let totalScheduledMileage = 0;
  weeklyPlan.forEach(dayPlan => {
    const mileage = (mileageInput * dayPlan.percent).toFixed(1);

    if (dayPlan.percent > 0) {
      totalScheduledMileage += parseFloat(mileage);
    }

    const row = scheduleBody.insertRow();
    row.insertCell().textContent = dayPlan.day;
    row.insertCell().textContent = dayPlan.focus;
    row.insertCell().textContent = mileage > 0 ? `${mileage} miles` : '0 miles';
  });

  // Add Total row
  const totalRow = scheduleBody.insertRow();
  totalRow.style.fontWeight = 'bold';
  totalRow.style.backgroundColor = '#ccffcc';
  totalRow.insertCell().textContent = "TOTAL";
  totalRow.insertCell().textContent = `Target Paces (per mile): Easy: ${fp.easyLongPace} | Tempo: ${fp.tempoPace} | Threshold: ${fp.thresholdPace}`;
  totalRow.insertCell().textContent = `${totalScheduledMileage.toFixed(1)} miles`;
}

// Generate the initial program on load
document.addEventListener('DOMContentLoaded', generateProgram);
