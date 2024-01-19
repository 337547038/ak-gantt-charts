/**
 * 返回一个相差多少天的时间
 * @param date 时间
 * @param offsetDay 相差天数
 */
export const getNewDay = (date: Date | string, offsetDay: number) => {
    if (typeof date === 'string') {
        date = new Date(date)
    }
    const y = date.getFullYear()
    const m = date.getMonth()
    const d = date.getDate()
    return new Date(y, m, d + offsetDay)
}
/**
 * 将一个date转换为字符串格式
 * @param date
 */
export const formatStringDate=(date:Date)=>{
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
}
