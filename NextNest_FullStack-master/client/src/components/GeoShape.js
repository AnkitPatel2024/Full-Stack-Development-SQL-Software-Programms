import { useEffect, useState } from 'react';
import reproject from 'reproject'
import proj4 from 'proj4';
import parse from 'html-react-parser'
const config = require('../config.json');
const geojson2svg = require('geojson2svg');


const converter = geojson2svg({
  viewportExtent: {width: 50, height: 50},
  mapExtent: {left: -50, bottom: -50, right: 50, top: 50},
  explode: false
});

export default function GeoShape(props) {

    const [geoShape, setGeoShape] = useState('');
    const [geoJson, setGeoJson] = useState({});
    const [box, setBox] = useState('0 0 0 0');

    const getShape = () => {
        console.log(props.geoID);
        fetch(
            `http://${config.server_host}:${config.server_port}/geo_shape/${props.geoID}`
        )
          .then(res => res.json())
          .then(resJson => {
            // DataGrid expects an array of objects with a unique id.
            // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
            let record = resJson;
            let geoj = JSON.parse(record.geo_json)
            geoj = reproject.reproject(geoj,proj4('EPSG:4269'),proj4('EPSG:3857'))
            setGeoJson(geoj)
            
            if (geoj){
                let converted = converter.convert(geoj,{attributes: {
                  'style': `stroke:${props.stroke || 'black'}; fill:${props.fill || 'black'};stroke-width:${props.strokeWidth || '0.5px'};`,
                  'vector-effect':'non-scaling-stroke'
                }});
                if(converted) setGeoShape(converted.join(''))

                let svgStr = converter.convert(geoj,{'output':'path'})
                if(svgStr){
                  svgStr = svgStr.map((x)=>x.split(' ').map((y)=>y.split(',')))
                  let xs = svgStr.flat().map((x)=>Number(x[0].replace('M','').replace('Z','')))
                  let ys = svgStr.flat().map((x)=>Number(x[1].replace('M','').replace('Z','')))
            
                  let xmin = Math.min(...xs) - 10
                  let xmax = Math.max(...xs) + 10
                  let ymin = Math.min(...ys) - 10
                  let ymax = Math.max(...ys) + 10
                  let xdist = xmax - xmin
                  let ydist = ymax - ymin
                  let tmpbox = `${xmin} ${ymin} ${xdist} ${ydist}`
                  setBox(tmpbox)
                }
                 
              }
          });
      }
      //#ff5722; fill:#ff784e;
    
      useEffect(()=>{
        getShape();
      },[])

    return(
        <svg width={props.width || "150"} height={props.width || "150"} viewBox={box}>
            {
              parse(geoShape)
            }
        </svg>       
    )

  }