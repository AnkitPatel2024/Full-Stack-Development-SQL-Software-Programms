
import { Button, Card, CardContent, CardHeader, Checkbox, Container, Rating, FormControlLabel, Grid, Link, Slider, TextField, Typography, Tooltip } from '@mui/material';
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
import { withAuthenticationRequired } from '@auth0/auth0-react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';



const config = require('../config.json');





function ProfilePage() {
    let { geo_type, geo_id } = useParams();
    const [geoID, setGeoID] = useState(geo_id);
    const [geoType, setGeoType] = useState(geo_type);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);

    const theme = useTheme();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();


    const deleteReview = (geoID, geoType) => {
      fetch(
          `http://${config.server_host}:${config.server_port}/review/${geoType}/${geoID}/${user.sub}`,{
            method: 'DELETE'
          }
      )
        .then(res => res.json())
        .then(resJson => {
          // setDataList(resJson ? resJson : []);
          if(resJson.ok){
            let tmprev = reviews.filter((x)=> x.geo_id != geoID)
            setReviews(tmprev);
          }
          
        });
    }


    
    const removeFavorite = (geoID, geoType) => {
      let data ={
        favorite: false,
        user: user.sub,
        geo_id: geoID,
        geo_type: geoType,
        get: false
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
        if(resJson.ok){
          let tmpfav = favorites.filter((x)=> x.geo_id != geoID)
          setFavorites(tmpfav)
        }
      });
    }


      const get_favs = () => {
        fetch(
            `http://${config.server_host}:${config.server_port}/user_favorites/${user.sub}`
        )
          .then(res => res.json())
          .then(resJson => {
            console.log(resJson);
            setFavorites(resJson);
          });
      }

      const get_revs = () => {
        fetch(
            `http://${config.server_host}:${config.server_port}/user_reviews/${user.sub}`
        )
          .then(res => res.json())
          .then(resJson => {
            console.log(resJson);
            setReviews(resJson);
          });
      }





      useEffect(() => {
        get_favs();
        get_revs();
      }, []);


     


  return (
    <Container>
      <Grid container justifyContent={'center'}>
        <Grid item xs={12} sx={{m:10}}>
          {user.sub ? <center>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </center> : null}
        </Grid>
        <Grid item xs={12}>
          <Typography color={'primary'} variant={'h4'}>
            Favorites:
          </Typography>
          {
            favorites.map((f)=>{
              return(<Card sx={{m:2}} key={f.geo_id + 'fav'}>
                <CardContent>
                    <Grid container justifyContent={'space-between'} alignItems={'center'}>
                      <Grid item>
                        <Button onClick={()=>navigate(`/details/${f.geo_type}/${f.geo_id}`)} size='large' color='secondary'>
                          {f.name}
                        </Button>
                      </Grid>
                      <Grid item>
                        <Tooltip title={'Remove from favorites'}>
                          <IconButton onClick={()=>removeFavorite(f.geo_id, f.geo_type)}>
                            <FavoriteIcon color={'secondary'} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
              </Card>)
            })
          }
        </Grid>
        <Grid item xs={12}>
          <Typography color={'primary'} variant={'h4'}>
            Reviews:
          </Typography>
          {
            reviews.map((f)=>{
              return(
                <Card key={f.geo_id + 'rev'} sx={{m:2}}>
                  <CardContent>
                    <Grid container justifyContent={'space-between'} alignItems={'center'}>
                      <Grid item>
                        <Button onClick={()=>navigate(`/details/${f.geo_type}/${f.geo_id}`)} size='large' color='secondary'>
                          {f.name}
                        </Button>
                      </Grid>
                      <Grid item>
                        <Tooltip title={'Delete Review'}>
                          <IconButton onClick={()=>deleteReview(f.geo_id, f.geo_type)}>
                            <DeleteIcon color={'secondary'} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={'Edit Review'}>
                          <IconButton onClick={()=>navigate(`/review/${f.geo_type}/${f.geo_id}`)}>
                            <EditIcon color={'secondary'} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                )
            })
          }
        </Grid>
      </Grid>

      

    </Container>
  );
};

export default withAuthenticationRequired(ProfilePage);