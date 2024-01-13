import { useEffect, useState } from 'react';
import { Container, Divider, Link, Stack, Box, Button, Grid, Typography, Slider } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import GeoShape from '../components/GeoShape';

import SvgTimelineIcon from '@mui/icons-material/Timeline';
import SvgQueryStatsIcon from '@mui/icons-material/QueryStats';



const config = require('../config.json');


const styles = {
  paperContainer: {
      height: '100%',
      backgroundImage: `url(${process.env.PUBLIC_URL + '/map.png'})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center'
  }
};



export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate()


  return (
    <Grid>


          <Grid container >
            <Grid item sx={{p: 5, height: '65vh'}} xs={8}>
              <Box style={styles.paperContainer}></Box>
            </Grid>
            <Grid item xs={4} >
              <Grid container justifyContent={'center'} alignItems={'center'} sx={{height: '100%', p:8}}>
                <Grid item >
                  Next Nest is a site to help you explore your next hometown. 
                  We've brought together the data that you need to make an informed
                  decision about your next move or trip. Explore information on demographics,
                  wages, cost of living, crime and many other important details.
                </Grid>
                <Grid item >
                  <Button variant={'contained'} onClick={()=>navigate('/heatmap/state/total_population')}>Try our interactive map</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{backgroundColor: theme.palette.primary[100], width: '100%', height: '65vh'}} justifyContent={'center'} alignItems={'center'} container>
            <Grid item xs={4}>
              <Grid container direction={'column'} justifyContent={'center'} alignItems={'center'}>
                <Grid item>
                  <Typography sx={{m:7}}>
                    Do a side by comparison of potential destinations!
                  </Typography>
                </Grid>
                <Grid item>
                  <Button color={'secondary'} variant={'contained'} onClick={()=>navigate('/compare')}>Try it now</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={8}>
              <Grid container justifyContent={'center'}>
                <Grid item><GeoShape geoID={'0400000US48'} height={'10em'} width={'10em'} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} /></Grid>
                <Divider orientation="vertical" flexItem sx={{mx:5}}/>
                <Grid item><GeoShape geoID={'0400000US06'} height={'10em'} width={'10em'} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} /></Grid>
                <Divider orientation="vertical" flexItem sx={{mx:5}} />
                <Grid item><GeoShape geoID={'0400000US36'} height={'10em'} width={'10em'} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} /></Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{width: '100%', height: '65vh'}} justifyContent={'center'} alignItems={'center'} container>

            <Grid item xs={8}>
              <Grid container justifyContent={'center'}>
                <SvgQueryStatsIcon color={'primary'} style={{width: '10em', height: '10em'}}/>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container direction={'column'} justifyContent={'center'} alignItems={'center'}>
                <Grid item>
                  <Typography sx={{m:7}}>
                    Take a look at trends over time to see if things are improving or getting worse!
                  </Typography>
                </Grid>
                <Grid item>
                  <Button  variant={'contained'} onClick={()=>navigate('/trends')}>Start Here</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{backgroundColor: theme.palette.secondary[100], width: '100%', height: '65vh'}} justifyContent={'center'} alignItems={'center'} container>
            <Grid item xs={4}>
              <Grid container direction={'column'} justifyContent={'center'} alignItems={'center'}>
                <Grid item>
                  <Typography sx={{m:7}}>
                    Filter on any combination of metrics to find your perfect match!
                  </Typography>
                </Grid>
                <Grid item>
                  <Button  variant={'contained'} onClick={()=>navigate('/search')}>Check it out</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={8}>
              <Grid container justifyContent={'center'} alignItems={'center'} direction={'column'}>
                <Grid item>
                  <Typography id="input-slider1" gutterBottom>
                    Population
                  </Typography>
                  <Slider
                    sx={{width: '300px'}}
                    aria-labelledby="input-slider1"
                    defaultValue={75}
                    color="secondary"
                  />
                </Grid>
                <Grid item>
                  <Typography id="input-slider1" gutterBottom>
                    Cost of Living
                  </Typography>
                  <Slider
                    sx={{width: '300px'}}
                    aria-labelledby="input-slider2"
                    defaultValue={15}
                    color="secondary"
                  />
                </Grid>
                <Grid item>
                  <Typography id="input-slider1" gutterBottom>
                    Median Income
                  </Typography>
                  <Slider
                    sx={{width: '300px'}}
                    aria-labelledby="input-slider3"
                    defaultValue={45}
                    color="secondary"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          


    </Grid>
  );
};