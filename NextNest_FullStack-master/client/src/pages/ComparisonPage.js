
import { Button, Container, Grid, Typography, Box, Modal, Card, CardHeader } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, React } from 'react';
import { useParams } from 'react-router-dom';
import InfoCard from '../components/InfoCard';
import { metrics } from '../helpers/metrics'

import GeoShape from '../components/GeoShape';
import { blueGrey } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import AutoComplete from '../components/AutoComplete';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useNavigate, useSearchParams } from 'react-router-dom';



const config = require('../config.json');



let categories = {}
Object.keys(metrics).map((k)=>{
  let v = metrics[k];
  if(categories[v.category]){
    categories[v.category].push(v);
  }else{
    categories[v.category] = [v];
  }
})

function compareCategories( a, b ) {
  if ( a.category_rank < b.category_rank ){
    return -1;
  }
  if ( a.category_rank > b.category_rank ){
    return 1;
  }
  return 0;
}
Object.values(categories).forEach((x)=>x.sort(compareCategories))



export default function ComparisonPage() {
    // const [searchParams] = useSearchParams();
    // console.log([...searchParams])
    // let ids_from_params = [...searchParams].filter((x)=>x[0]=='geo_id').map((x)=>x[1])
    // console.log(ids_from_params);
    let { geo_type, geo_id } = useParams();
    const [geoID, setGeoID] = useState(geo_id);
    const [geoList, setGeoList] = useState([]);
    const [geoType, setGeoType] = useState(geo_type);
    const [year, setYear] = useState(2021);
    const [dataList, setDataList] = useState([]);
    const [searchList, setSearchList] = useState([]);
    const [detailList, setDetailList] = useState([]);
    const [data, setData] = useState({});
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const navigate = useNavigate();

      const style = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: 'none',
      // boxShadow: 24,
      p: 4,
    };

    const columns = [
        { field: 'name', headerName: 'Metric', flex:1, renderCell: (params)=>{
          return params.value in metrics ? metrics[params.value].display : null;
        }},
        { field: 'value', headerName: 'Value', flex:1, renderCell: (params)=>{
          return params.row.name in metrics && params.value ? metrics[params.row.name].formatter(params.value) : null;
        }},
      ]

      const getNames = () => {
        fetch(
            `http://${config.server_host}:${config.server_port}/geo_names?types=state&types=county&types=metro&types=place`
        )
          .then(res => res.json())
          .then(resJson => {
            setDataList(resJson ? resJson : []);
            console.log(resJson);
          });
      }


      useEffect(() => {
        getNames();
      }, []);

      useEffect(() => {
        
        async function fetchDetails(add, curDetails){
          for(let x of add){
            const details = await getDetails(x.geo_id, x.type);
            console.log(details)
            curDetails.push(details);
          }
          console.log(curDetails);
          setDetailList(curDetails);
        }

        const curIDs = new Set(searchList.map((x)=>x.geo_id));
        const oldIDs = new Set(detailList.map((x)=>x.geo_id));

        let curDetails = [...detailList].filter(x=>curIDs.has(x.geo_id));
        let add = searchList.filter(x => !oldIDs.has(x.geo_id));

        fetchDetails(add, curDetails);
        // navigate(
        //   {
        //     pathname: '/compare',
        //     search: searchList.length ? `?geo_id=${searchList.map((x)=>x.geo_id).join('&geo_id=')}` : ''
        //   },
        //   {
        //     replace: true
        //   }
        // );

      }, [searchList]);

      async function getDetails(geoID, geoType, year=2021){ 
        let res = await fetch(
          `http://${config.server_host}:${config.server_port}/geo_detail/${year}/${geoType}/${geoID}`
        )
          const resJson = res.json()
          console.log(resJson);
          return resJson;
        
      }


      
      const catTitles = [
        'Demographic Info',
        'Quality of Life',
        'Education',
        'Cost of Living',
        'Income'
      ]

      function checkNull(array, key){
        for(let el of array){
          if(!el[key]){
            return false;
          }
        }

        return true;
      }
     


  return (
    <Container>
      <AutoComplete callback={setSearchList} list={dataList}/>
      {/* {detailList.map(v=>)} */}
      {
        detailList.length ? 
          <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell component="th" scope="row">
    
                </TableCell>
                {detailList.map((d)=>{
                  return(
                  <TableCell key={d.geo_id + 'shape'} component="th" scope="row" align='center'>
                    <GeoShape  geoID={d.geo_id} height={'10em'} width={'10em'} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
                  </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                    Name
                </TableCell>
                {detailList.map((d)=>{
                  return(
                  <TableCell key={d.name} component="th" scope="row" align='center'>
                    {d.name}
                  </TableCell>
                  )
                })}
              </TableRow>
            </TableHead>
            <TableBody>

              {Object.keys(metrics).map((metric) => (
                checkNull(detailList,metric) ? <TableRow
                  key={metrics[metric].metric}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {metrics[metric].display}
                  </TableCell>
                  {detailList.map((d)=>{
                    return(
                      <TableCell key={d.geo_id + metric} component="th" scope="row" align='center'>
                        {d[metric] ? metrics[metric].formatter(d[metric]) : "N/A"}
                      </TableCell>
                    )
                  })}
                </TableRow> : null
              ))}
            </TableBody>
          </Table>
        </TableContainer> : null

      }
      {/* <div>{searchList.map(v=><div key={v.name}>{v.name}</div>)}</div> */}
      {/* <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card sx={style}>
          <CardHeader>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Search for a Location
            </Typography>
          </CardHeader>
          
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
          
        </Card>
      </Modal> */}
      <Grid container alignItems={'center'} justifyContent={'space-around'}  sx={{ m: '2rem' }}>
        <Grid item xs={6}>
          <Typography variant='h3' color='secondary' align='center'>
            {data ? data.name : null}
          </Typography>
        </Grid>
        <Grid item xs={6} >
          <center>
            {/* <GeoShape geoID={geoID} height={'10em'} width={'10em'} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} /> */}
          </center>
        </Grid>
      </Grid>

      {/* {
        data ? catTitles.map((t)=><InfoCard 
          titleColor={'primary'}
          key={t}
          title={t} 
          metrics={categories[t]}
          data={data}
        />) : null
      } */}
    </Container>
  );
};