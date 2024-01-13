import { Container, Grid, Link, Slider, TextField, Typography, Radio, FormControl, FormControlLabel, FormLabel, InputLabel, Select, MenuItem, RadioGroup, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, CartesianGrid, Legend, Line, XAxis, YAxis } from 'recharts';
//import InfoCard from '../components/InfoCard';
import { metrics } from '../helpers/metrics'

//import GeoShape from '../components/GeoShape';
//import { blueGrey } from '@mui/material/colors';
//import { useTheme } from '@mui/material/styles';
import { 
  MapContainer, 
  TileLayer, 
  Tooltip
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
const config = require('../config.json');

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

export default function TrendsPage() {
    let{geo_type, geo_name , metric_type1, metric_type2} = useParams();     
    const [timeframe, setTimeframe] = useState([2011, 2021]);
    const [geoType, setGeoType] = useState(geo_type || 'state');
    const [metric1, setMetric1] = useState(metric_type1 || 'total_population'); 
    const [metric2, setMetric2] = useState(metric_type2 || 'median_age'); 
    const [geokeys, setGeoKeys] = useState([] )  
    const [data, setData] = useState([]);  //Data should be year vs metric value for a selected geography
    const [geoName, setGeoName] = useState(geo_name || 'Alabama') 
    
    
    useEffect(() => {
      //user first chooses geography type (i.e. state, county etc)
      //Base on the geography type, list of names of geographies are fetched to use as menu items in geography search form
      //this function search_key is called every time user changes geo_type(geography type)
    const search_keys = () =>{
      fetch (`http://${config.server_host}:${config.server_port}/geo_keys/${geoType}`  
      )
        .then(res => res.json())
        .then(resJson => 
          setGeoKeys(resJson));
      }
      search_keys();
    },[geoType]);
    

    //user then selects geography name, metric type and timeframe 
    //below we fetch data for the metric for the selected geogrphy for selected timeframe    
    useEffect(() => {
      const getGeoData = () =>{   
        fetch( `http://${config.server_host}:${config.server_port}/geo_trends/${geoType}/${geoName}/${metric1}/${metric2}/${timeframe[0]}/${timeframe[1]}`)
          .then(res => res.json())
          .then(resJson => {              
            setData(resJson);
            console.log(resJson)})           
      }
      getGeoData();     
      }, [timeframe, metric1, metric2, geoName]);  

      function updateSlider(val){
        if(val[0] < val[1]){
          setTimeframe(val);
        }
      }
  return (
    <Grid container justifyContent={'space-between'}>
    <Grid item xs={9}>
    <Typography color={'primary'} variant="h6" sx={{m:3}} align='center'>
      {(metrics[metric1].display + ' AND ' + metrics[metric2].display+ ' OF  ' + geoName).toUpperCase() + ' OVER TIME ' }
    </Typography>
     
      <MapContainer center={[ 37.0902,-95.7129 ]} zoom={4} scrollWheelZoom={false}
          style={{ height:"75vh", width:'100%',backgroundColor:'white'
            }}
          attributionControl={undefined}
        >        
         <div style={{ margin: 20 }}>{
          <ResponsiveContainer width="100%" aspect={3}>
          <LineChart width={730} height={250} data={data} 
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  />
            <YAxis yAxisId="left" label={{value: metrics[metric1].display, angle: -90, position: "insideLeft", style:{textAnchor: 'middle'}, offset: -10}} />           
            <YAxis yAxisId="right" orientation="right" label={{value: metrics[metric2].display, angle: -90,position: "insideRight", style:{textAnchor: 'middle'}, offset: 10 }} />            
            <Tooltip />
            <Legend />
            <Line  yAxisId="left" type="monotone" dataKey= {metric1}  stroke="#8884d8"  />
            <Line yAxisId="right" type="monotone" dataKey= {metric2} stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>}
          </div> 
          
      </MapContainer>
    </Grid>
    <Grid item xs={3}>
          <Grid container direction={'column'} spacing={5} sx={{p:10}}>
            <Grid item >
              <FormControl sx={{my:2}}>
                <InputLabel id="demo-simple-select-label">Metric</InputLabel>
                <Select
                  style={{
                      maxWidth: '12em'
                    }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={metric1}
                  label="Metric"
                  onChange={(evt)=>setMetric1(evt.target.value)}
                >
                  {metric_keys.map(m=><MenuItem key={m} value={m}>{metrics[m].display}</MenuItem>)}
                </Select>
              </FormControl>
                          
            <Grid item >
              <FormControl >
                <InputLabel id="demo-simple-select-label">Metric</InputLabel>
                <Select
                  style={{
                      maxWidth: '12em'
                    }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={metric2}
                  label="Metric"
                  onChange={(evt)=>setMetric2(evt.target.value)}
                >
                  {metric_keys.map(m=><MenuItem key={m} value={m}>{metrics[m].display}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
 
        <Grid item xs={3}>
    
         <Grid container direction={'column'}>
            <Grid item >
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
                <FormControl>
                <InputLabel id="demo-simple-select-label">Geography</InputLabel>
                <Select
                  style={{
                      maxWidth: '12em'
                    }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={geoName}
                  label="Geography"
                  onChange={(evt)=>setGeoName(evt.target.value)}
                >                 
                  {geokeys.map(g=><MenuItem key="" value={g.name}>{g.name}</MenuItem>)}
                </Select>
              </FormControl>
              </Grid> 
              </Grid>
              </Grid>
              <Grid item>
            <Grid item xs={9}>
          <p>Timeframe</p>
          <Slider
            value={timeframe}
            min={2011}
            max={2021}
            step={1}
            onChange={(e, newValue) => updateSlider(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value/1}</div>}
          />    
        </Grid> 
        </Grid>       
        </Grid>  
      </Grid>  
      </Grid>  
    </Grid>     
  );
};