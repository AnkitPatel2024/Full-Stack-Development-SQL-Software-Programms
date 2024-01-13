
import { Button, Stack, Divider, Paper, Box, Card, CardContent, CardHeader, Checkbox, Container, Rating, FormControlLabel, Grid, Link, Slider, TextField, Typography, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InfoCard from '../components/InfoCard';
import { metrics } from '../helpers/metrics'

import GeoShape from '../components/GeoShape';
import { blueGrey } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { styled } from '@mui/material/styles';



const config = require('../config.json');

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

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



export default function DetailsPage() {
    let { geo_type, geo_id } = useParams();
    const [geoID, setGeoID] = useState(geo_id);
    const [weather, setWeather] = useState({});
    const [geoType, setGeoType] = useState(geo_type);
    const [year, setYear] = useState(2021);
    const [dataList, setDataList] = useState([]);
    const [isFavorite, setIsFavorite] = useState([]);
    const [data, setData] = useState({});
    const theme = useTheme();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();

    console.log(geo_type + geo_id);

    const columns = [
        { field: 'name', headerName: 'Metric', flex:1, renderCell: (params)=>{
          return params.value in metrics ? metrics[params.value].display : null;
        }},
        { field: 'value', headerName: 'Value', flex:1, renderCell: (params)=>{
          return params.row.name in metrics && params.value ? metrics[params.row.name].formatter(params.value) : null;
        }},
      ]

      const search = () => {
        fetch(
            `http://${config.server_host}:${config.server_port}/geo_detail/${year}/${geoType}/${geoID}`
        )
          .then(res => res.json())
          .then(resJson => {
            setData(resJson);
            getWeather(resJson.name)
          });
      }

      const updateFavorite = (get, isFavorite=false) => {
        let data ={
          favorite: isFavorite,
          user: user.sub,
          geo_id: geoID,
          geo_type: geoType,
          get: get
        }

        fetch(
            `http://${config.server_host}:${config.server_port}/favorite`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        )
        .then(res => res.json())
        .then(resJson => {
          if(!get && resJson.ok){
            setIsFavorite(isFavorite);
          }else if(get){
            setIsFavorite(resJson.isFavorite);
          }
        });
      }


      useEffect(() => {
        search();
        if(user){updateFavorite(true)};

      }, [year, geoType, geoID]);

      function getWeather(name){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();

        if(dd<10) 
        {
            dd='0'+dd;
        } 

        if(mm<10) 
        {
            mm='0'+mm;
        } 

        let now = `${yyyy}-${mm}-${dd}`
        let past = `${yyyy-1}-${mm}-${dd}`
        //New%20York%20City%2CNY
        fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${name}%20usa?unitGroup=us&key=4VPUSWE2HPT537LEK289DAETR&contentType=json`, {
        "method": "GET",
        "headers": {
        }
        })
        .then(response => response.json()).then(resJson => {
          console.log(resJson);
          setWeather(resJson)
        })
        .catch(err => {
          console.error(err);
        });
      }

      


      
      const catTitles = [
        'Demographic Info',
        'Quality of Life',
        'Education',
        'Cost of Living',
        'Income'
      ]
     


  return (
    <Container>
      <Grid container alignItems={'center'} justifyContent={'space-around'}  sx={{ m: '2rem' }}>
        <Grid item xs={6}>
          <Typography variant='h3' color='secondary' align='center'>
            {data ? data.name : null}
          </Typography>
        </Grid>
        <Grid item xs={6} >
          <center>
            <GeoShape geoID={geoID} height={'10em'} width={'10em'} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
          </center>
        </Grid>
        
        
        

        {/* <TextField id="outlined-basic" label="Geo ID" variant="outlined" 
            onChange={(e)=>setGeoID(e.target.value)}
        />
        <Button onClick={() => search() }>
            Search
        </Button> */}
      </Grid>

      
      <Card sx={{m:5}}>
        <CardContent>
          <Grid container alignItems={'center'}>
            <Grid item>
              <Typography  color={'primary'} variant='h5'>
                Average Rating: 
              </Typography>
            </Grid>
            <Grid item>
              { data.rating ? <Rating name="half-rating-read" size={'large'} value={data.rating} precision={0.1} readOnly /> : 'No Reviews'}
            </Grid>
            { isAuthenticated ? <Grid item sx={{ marginLeft: "auto" }}>
              <Tooltip title={'Leave a review'}>
                <IconButton onClick={()=>navigate(`/review/${geoType}/${geoID}`)}>
                  <RateReviewIcon color={'secondary'} />
                </IconButton>
              </Tooltip>
              <Tooltip title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}>
                <IconButton onClick={()=>updateFavorite(false, !isFavorite)}>
                  {isFavorite ? <FavoriteIcon color={'secondary'} /> : <FavoriteBorderIcon color={'secondary'}/>}
                </IconButton>
              </Tooltip>
            </Grid> : null
            }
          </Grid>
        </CardContent>
      </Card>

      {
        data ? catTitles.map((t)=><InfoCard 
          titleColor={'primary'}
          key={t}
          title={t} 
          metrics={categories[t]}
          data={data}
        />) : null
      }

        { weather.currentConditions ? <Card sx={{m:5}}>
          <CardHeader title='Weather' titleTypographyProps={{color:'primary'}}>

          </CardHeader>
          <CardContent>
            <Box sx={{m:2}} ><Typography color={'secondary'} variant={'h5'}>Current Temperature: </Typography><Typography variant={'h5'}>{weather.currentConditions.temp} &#176;</Typography></Box>
            
            
            <Box sx={{m:2}}>
              <Typography color={'secondary'} variant={'h5'}>Forecast:</Typography>
              <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              sx={{overflowX:'scroll', p:2}}
            >

                {weather.days.map(d=>{
                  return(<Item sx={{width:'300px'}}>
                    <Typography key={d.datetime} color={'primary'} variant={'h6'}>
                      {d.datetime.slice(-5).replace('-','/')}: 
                      <Typography style={{color:'black'}}>Low: {d.tempmin}&#176;</Typography>
                      <Typography style={{color:'black'}}>High: {d.tempmax}&#176;</Typography>
                    </Typography></Item>)
                })}
            </Stack>
              
            </Box>
          </CardContent>
        </Card> : null }
    </Container>
  );
};