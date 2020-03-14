import Dms from 'geodesy/dms.js'
import { LatLon } from 'geodesy/mgrs.js'

/* eslint-disable no-unused-vars */
// Default separator is U+202F ‘narrow no-break space’.
const defaultSeparator = Dms.separator
Dms.separator = ''
/* eslint-enable no-unused-vars */

/**
 * dms:  40°26′46″N 79°58′56″W
 * dm:   40°26.767′N 79°58.933′W
 * d:    40.446°N 79.982°W
 * utm:  32U 461344 5481745
 * mgrs: 32U MV 61344 81745
 */

const formats = {
  dms: ({ lat, lng }) => `${Dms.toLat(lat, 'dms')} ${Dms.toLon(lng, 'dms')}`,
  dm: ({ lat, lng }) => `${Dms.toLat(lat, 'dm')} ${Dms.toLon(lng, 'dm')}`,
  d: ({ lat, lng }) => `${Dms.toLat(lat, 'd')} ${Dms.toLon(lng, 'd')}`,
  utm: ({ lat, lng }) => new LatLon(lat, lng).toUtm().toString(),
  mgrs: ({ lat, lng }) => new LatLon(lat, lng).toUtm().toMgrs().toString()
}

const defaultFormat = 'mgrs'
const currentFormat = formats[defaultFormat]

export default {

  format: latlng => {
    try {
      return currentFormat(latlng)
    } catch (e) {
      console.error(e)
      return ''
    }
  }
}
