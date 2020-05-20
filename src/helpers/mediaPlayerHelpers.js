import moment from 'moment'

export function getProgress(duration, currentTime) {
    const total = moment.duration(duration).asSeconds()
    return (currentTime * 100) / total
}

export function getTime(duration, progress) {
    const total = moment.duration(duration).asSeconds()
    return (progress * total) / 100
}

export function formatTime(progress) {
    const time = getTime(progress)
    const totalSeconds = time % 3600
    const minutes = Math.floor( totalSeconds / 60)
    const seconds = parseInt(totalSeconds % 60)
    
    return `${time > 3600 ? `${Math.floor( time / 3600 )}:`:''}${minutes < 10 ? '0':''}${minutes}:${seconds < 10 ? '0':''}${seconds}`
}