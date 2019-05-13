import React from 'react'
import L from 'leaflet'
import { withStyles } from '@material-ui/core/styles'
import { ipcRenderer } from 'electron'
import settings from 'electron-settings'
import path from 'path'
import { K } from '../../shared/combinators'
import 'leaflet/dist/leaflet.css'
import Leaflet from '../leaflet'

// Dedicated file for map settings:
settings.setPath(path.format({
  dir: path.dirname(settings.file()),
  base: 'MapSettings'
}))

const styles = {
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 10
  }
}


// https://github.com/PaulLeCam/react-leaflet/issues/255
// Stupid hack so that leaflet's images work after going through webpack.
import marker from 'leaflet/dist/images/marker-icon.png'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl: marker2x,
    iconUrl: marker,
    shadowUrl: markerShadow
})

const defautTileProvider = {
  "id": "OpenStreetMap.Mapnik",
  "name": "OpenStreetMap",
  "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "maxZoom": 19,
  "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
}


class Map extends React.Component {

  componentDidMount() {
    const {id, options} = this.props
    const tileProvider = settings.get('tileProvider') || defautTileProvider
    const viewPort = settings.get('viewPort')

    // Override center/zoom if available from settings:
    if(viewPort) {
      options.center = L.latLng(viewPort.lat, viewPort.lng)
      options.zoom = viewPort.zoom
    }

    this.map = K(L.map(id, options))(map => {
      L.tileLayer(tileProvider.url, tileProvider).addTo(map)
    })

    ipcRenderer.on('COMMAND_MAP_TILE_PROVIDER', (event, options) => {
      Leaflet.layers(this.map)
        .filter(layer => layer instanceof L.TileLayer)
        .forEach(layer => this.map.removeLayer(layer))
        L.tileLayer(options.url, options).addTo(this.map)

      settings.set('tileProvider', options)
    })

    ipcRenderer.on('COMMAND_ADJUST', (_, filter) => {
      console.log('COMMAND_ADJUST', filter)
    })

    this.map.on('moveend', () => {
      const { lat, lng } = this.map.getCenter()
      const zoom = this.map.getZoom()
      settings.set('viewPort', { lat, lng, zoom })
    })
  }

  componentDidUpdate(prevProps) {
    const { center } = this.props
    if(center && !center.equals(prevProps.center)) this.map.panTo(center)
  }


  render() {
    return <div
      id={ this.props.id }
      className={ this.props.classes.root }
    >
    </div>
  }
}

export default withStyles(styles)(Map)