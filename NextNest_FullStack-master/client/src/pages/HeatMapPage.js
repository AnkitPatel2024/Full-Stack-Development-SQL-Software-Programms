import { useEffect, useState } from 'react';
import { 
  Container, 
  Grid,
  Radio,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Button
} from '@mui/material';

import { 
  MapContainer, 
  TileLayer, 
  useMap,
  Popup,
  Marker,
  GeoJSON,
  Tooltip
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { deepOrange } from '@mui/material/colors';
import { useNavigate, useParams } from 'react-router-dom';
import { useMapEvents } from 'react-leaflet';

import { metrics } from '../helpers/metrics'


const config = require('../config.json');



// let metrics_lookup = {};
// metrics.forEach(x=>metrics_lookup[x.metric] = x.display);

// metrics.forEach(x=>{
//   x.display = x.display.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
// })

function compare( a, b ) {
  if ( a.display < b.display ){
    return -1;
  }
  if ( a.display > b.display ){
    return 1;
  }
  return 0;
}

let metric_keys = Object.values(metrics).sort(compare).map((x)=>x.metric)
// let metric_keys = Object.keys(metrics).sort()
// metrics.sort( compare );

const BINS = 10;

function getOpacity(idx, arr){
  // let med = arr[Math.floor(arr.length/2)].value
  // return Math.max(Math.min((arr[idx].value / med) * .5,1),0.01)
  // return Math.round((arr.length - idx) * 10/arr.length) / 10;
  // let min = 0;
  // for(let i=arr.length -1;i>=0;i--){
  //   if(arr[i].value){
  //     min = arr[i].value;
  //     break;
  //   }
  // }
  
  let pct = Math.max(Math.floor(arr.length/20),1)
  let min = arr[arr.length-pct].value;
  let max = arr[pct].value;
  return Math.max(Math.min((arr[idx].value-min) / (max-min),1),.1);
}

function MyComponent(props) {
  const map = useMapEvents({
    load:()=>{
      console.log(map.getBounds())
      alert();
    },
    moveend:()=>{
      console.log(map.getBounds())
      props.setBounds(map.getBounds())
    }
  })
  return null
}



export default function HeatMapPage() {
  let { geo_type, metric_type } = useParams();
  const [shapes, setShapes] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [geoType, setGeoType] = useState(geo_type || 'state');
  const [metric, setMetric] = useState(metric_type || 'total_population');

  const navigate = useNavigate()

  let limitCoord = (v) => {
    return Math.min(Math.max(v,-180.000000),180.000000)
  }
  
  let getCoords = ()=>{
    return `${limitCoord(bounds.getSouth())} ${limitCoord(bounds.getWest())},${limitCoord(bounds.getNorth())} ${limitCoord(bounds.getEast())}`
  }

  useEffect(() => {
    let url = bounds ? 
    `http://${config.server_host}:${config.server_port}/geo_shapes/${geoType}/${metric}/2021?coords=${getCoords()}` :
    `http://${config.server_host}:${config.server_port}/geo_shapes/${geoType}/${metric}/2021`;

    fetch(url)
      .then(res => res.json())
      .then(resJson => {
        resJson.forEach(element => {

          element.geo_json = JSON.parse(element.geo_json);

        });
        setShapes(resJson);
        console.log(shapes);
      });

      navigate(`/heatmap/${geoType}/${metric}`)
  }, [bounds, geoType, metric]);

  return (

      <Grid container justifyContent={'space-between'}>
        <Grid item xs={9}>
        <Typography color={'primary'} variant="h6" sx={{m:3}} align='center'>
          {(metrics[metric].display + ' BY ' + geoType).toUpperCase()}
        </Typography>
         
          <MapContainer center={[ 37.0902,-95.7129 ]} zoom={4} scrollWheelZoom={false}
              style={{ height:"75vh", width:'100%',backgroundColor:'white'
                }}
              attributionControl={undefined}
            >
              {/* <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              /> */}
              {/* <Marker position={[51.505, -0.09]}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker> */}
              {
                shapes.map((s,idx)=>{
                  return <GeoJSON 
                  key={s.geo_id} 
                  data={s.geo_json} 
                  pathOptions={{
                    color:'#607d8b',
                    weight:.5,
                    fillOpacity: getOpacity(idx,shapes)
                    }}
                  eventHandlers={{
                    click: (evt)=>{
                      console.log(s.geo_id)
                      navigate(`/details/${geoType}/${s.geo_id}`)
                    }
                  }}
                  >
                    <Tooltip>
                      {s.name}<br/>
                      {metrics[s.metric].display}: {s.value ? metrics[s.metric].formatter(s.value) : null}<br/>
                      Rank: {idx+1} of {shapes.length}         
                    </Tooltip>
                  </GeoJSON>
                })
              }
              <MyComponent setBounds={setBounds}/>
          </MapContainer>
        </Grid>
        <Grid item xs={3}>
          <Grid container direction={'column'} spacing={5} sx={{p:10}}>
            <Grid item >
              <FormControl >
                <InputLabel id="demo-simple-select-label">Metric</InputLabel>
                <Select
                  style={{
                      maxWidth: '12em'
                    }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={metric}
                  label="Metric"
                  onChange={(evt)=>setMetric(evt.target.value)}
                >
                  {metric_keys.map(m=><MenuItem key={m} value={m}>{metrics[m].display}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">Geographic Level</FormLabel>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="state"
                  name="radio-buttons-group"
                  value={geoType}
                  onChange={(evt)=>setGeoType(evt.target.value)}
                >
                  <FormControlLabel value="state" control={<Radio />} label="State" />
                  <FormControlLabel value="county" control={<Radio />} label="County" />
                  <FormControlLabel value="metro" control={<Radio />} label="Metro Area" />
                  <FormControlLabel value="place" control={<Radio />} label="City/Town" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
        

        

  );
};