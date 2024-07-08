import { CronJob, CronTime } from 'cron'
import { settingService } from '../services/index.js'
import { logger } from '../utils/logger.js'
import emitter from '../utils/event.js'

const cb = async (setting) => {
  logger.info('Start trigger cron')
  emitter.emit('event-socket-action', { isOn: true })
  setTimeout(() => {
    emitter.emit('event-socket-action', { isOn: false })
    logger.info('Stop trigger cron')
  }, Number(setting.time) * 60 * 1000)
}

const initCron = async () => {
  let setting = { startTime: '05:00', timerOn: false, time: 1 }
  try {
    setting = await settingService.getOne()
  } catch (err) {
    logger.error(err)
  }
  const times = setting.startTime.split(':')
  const cron = new CronJob(`00 ${times[1]} ${times[0]} * * *`, () => cb(setting), null, false, 'UTC')
  if (setting.timerOn) {
    cron.start()
    logger.info('Created cron')
  }
  emitter.on('event-update-setting', (data) => {
    setting = data
    const times = setting.startTime.split(':')
    const cronTime = new CronTime(`00 ${times[1]} ${times[0]} * * *`)
    cron.setTime(cronTime)
    if (!setting.timerOn && cron.running) {
      cron.stop()
    } else if (setting.timerOn && !cron.running) {
      cron.start()
    }
  })
  return cron
}

export default initCron
