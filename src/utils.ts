export function getYDMStringByDate(date: Date) {
  return {
    year: date.getFullYear().toString(),
    month:
      date.getMonth() + 1 < 10
        ? '0' + (date.getMonth() + 1)
        : (date.getMonth() + 1).toString(),
    day: date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString(),
  }
}
