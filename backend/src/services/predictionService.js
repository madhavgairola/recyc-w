// Predicts when a bin will overflow based on its current fill_rate

// fill_rate is in % per 5-second update cycle
// We convert to % per minute for human-readable output
const CYCLE_SECONDS = 5;
const CYCLES_PER_MINUTE = 60 / CYCLE_SECONDS; // = 12

const predictOverflow = (bin) => {
  const remainingCapacity = 100 - bin.fill_level;

  if (remainingCapacity <= 0) {
    return { minutesUntilFull: 0, eta: 'OVERFLOWING NOW', urgent: true };
  }

  const ratePerMinute = bin.fill_rate * CYCLES_PER_MINUTE; // effective fill per minute
  if (ratePerMinute <= 0) {
    return { minutesUntilFull: Infinity, eta: 'Not filling', urgent: false };
  }

  const minutesUntilFull = remainingCapacity / ratePerMinute;
  const urgent = minutesUntilFull < 30; // flag bins that will overflow within 30 mins

  // Human-readable ETA
  let eta;
  if (minutesUntilFull < 60) {
    eta = `~${Math.round(minutesUntilFull)} min`;
  } else {
    const hours = (minutesUntilFull / 60).toFixed(1);
    eta = `~${hours} hrs`;
  }

  return { minutesUntilFull: Math.round(minutesUntilFull), eta, urgent };
};

module.exports = { predictOverflow };
