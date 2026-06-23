export function observePerformance() {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();

  console.log(memory);
  console.log(cpu);
}
