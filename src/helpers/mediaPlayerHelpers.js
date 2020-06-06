import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'

momentDurationFormatSetup(moment);

export function getProgress(duration, currentTime) {
    if(currentTime === 0) {
        return 0    
    }
    
    const total = moment.duration(duration).asSeconds()
    return (currentTime * 100) / total
}

export function getTime(duration, progress) {
    const total = moment.duration(duration).asSeconds()
    return (progress * total) / 100
}

export function formatTime(duration, progress) {
    const time = getTime(duration, progress)
    const totalSeconds = time % 3600
    const minutes = Math.floor( totalSeconds / 60)
    const seconds = parseInt(totalSeconds % 60)
    
    return `${time > 3600 ? `${Math.floor( time / 3600 )}:`:''}${minutes < 10 ? '0':''}${minutes}:${seconds < 10 ? '0':''}${seconds}`
}