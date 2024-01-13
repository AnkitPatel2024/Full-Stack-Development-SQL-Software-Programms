
import {  
    Container, 
    TextField, 
    Grid, 
    Rating,
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,
    FormLabel,
    MenuItem,
    Select,
    InputLabel,
    Box,
    Button,
    Typography
} from '@mui/material';
import GeoShape from '../components/GeoShape';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { amber } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useAuth0 } from '@auth0/auth0-react';
import { shouldComponentUpdate } from 'react-window';




const config = require('../config.json');
console.log([...Array(5).keys()])


function ReviewPage() {
    let { geo_type, geo_id } = useParams();
    const [geoID, setGeoID] = useState(geo_id);
    const [geoType, setGeoType] = useState(geo_type);
    const [geoName, setGeoName] = useState('');
    const [stars, setStars] = useState(0);
    const [lived, setLived] = useState("1");
    const [timeUnit, setTimeUnit] = useState('days');
    const [time, setTime] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [update, setUpdate] = useState(false);
    const theme = useTheme();
    const { user } = useAuth0();
    const navigate = useNavigate();
    
    const search = () => {
        fetch(
            `http://${config.server_host}:${config.server_port}/geo_name/${geoType}/${geoID}`
        )
          .then(res => res.json())
          .then(resJson => {
            console.log(resJson)
            setGeoName(resJson.name);
          });
      }

      const getReview = () => {
        fetch(
            `http://${config.server_host}:${config.server_port}/review/${geoType}/${geoID}/${user.sub}`
        )
          .then(res => res.json())
          .then(resJson => {
            console.log(resJson)
            if(resJson.reviewer){
                setLived(resJson.lived ? "1" : "0");
                setStars(resJson.stars);
                setTime(resJson.duration);
                setTimeUnit('days');
                setReviewText(resJson.review)
                setUpdate(true);
            }
            
          });
      }

      useEffect(() => {
        search();
        getReview();
      }, [geoID]);

    function submit(){
        let days = timeUnit == 'days' ? time : timeUnit == 'years' ? time * 365 : time * 30;
        let data = {
            user: user.sub,
            lived: lived == "1" ? true : false,
            geo_type: geo_type,
            geo_id: geo_id,
            stars: stars,
            duration: days,
            review: reviewText,
            update: update
        }

        console.log(data);


        fetch(
            `http://${config.server_host}:${config.server_port}/review`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        )
          .then(res => res.json())
          .then(resJson => {
            console.log(resJson)
            navigate(`/details/${geoType}/${geoID}`)
          });

    }

  return (
    <Container >
        <Grid container alignItems={'center'} justifyContent={'space-around'}  sx={{ m: '2rem' }}>
            <Grid item xs={12}>
                <Typography variant='h3' color='primary' align='center'>
                    Leave a Review
                </Typography>
            </Grid>
            <Grid item xs={6}>
            <Typography variant='h3' color='secondary' align='center'>
                {geoName}
            </Typography>
            </Grid>
            <Grid item xs={6} >
            <center>
                <GeoShape geoID={geoID} height={'10em'} width={'10em'} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
            </center>
            </Grid>
        </Grid>
        <Grid container spacing={1} justifyContent={'center'} alignItems={'center'}>
            <Grid item xs={12}>
                <center>
                    <FormControl>
                        <FormLabel sx={{m:1}} id="demo-row-radio-buttons-group-label">Did you live here?</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            value={lived}
                            onChange={(e)=>{setLived(e.target.value)}}
                        >
                            <FormControlLabel value="1" control={<Radio />} label="Lived" />
                            <FormControlLabel value="0" control={<Radio />} label="Visited" />
                        </RadioGroup>
                    </FormControl>
                </center>
            </Grid>
            <Grid item xs={12}>
                <center>
                    <Box sx={{m:1}}><FormLabel >How long?</FormLabel></Box>
                    <TextField
                        type="number"
                        id="outlined-basic"
                        label="Duration"
                        variant="outlined"
                        onChange={(e) => setTime(e.target.value)}
                        value={time}
                    />
                    <FormControl sx={{ml:5}}>
                    <InputLabel id="demo-simple-select-label">Time Unit</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={timeUnit}
                        label="Time Unit"
                        onChange={(evt)=>setTimeUnit(evt.target.value)}
                    >
                        <MenuItem value={'days'}>Days</MenuItem>
                        <MenuItem value={'months'}>Months</MenuItem>
                        <MenuItem value={'years'}>Years</MenuItem>
                    </Select>
                    </FormControl>
                </center>
            </Grid>
            <Grid xs={12} sx={{ml:20, mr:20}} item>
                <TextField
                id="outlined-multiline-flexible"
                label="Review"
                multiline
                maxRows={10}
                minRows={3}
                fullWidth
                value={reviewText}
                onChange={(evt)=>setReviewText(evt.target.value)}
                />
            </Grid>
            <Grid xs={12} item>
                <center>
                    < Rating 
                        name="size-large" 
                        defaultValue={0} 
                        size="large" 
                        onChange={(event, newValue) => {
                            setStars(newValue);
                        }}
                        value={stars}
                    />
                </center>
                
                {/* <center>
                    {[...Array(5).keys()].map((x)=>{
                        return <span style={{cursor:'pointer'}} onClick={(evt)=>{setStars(x+1)}}>
                            {x >= stars ? <StarBorderRoundedIcon fontSize='large' color={'primary'} /> 
                            : <StarRoundedIcon fontSize='large' color={'primary'} />}
                        </span>
                    })}
                </center> */}
            </Grid>
            <Grid xs={12} sx={{ml:20, mr:20}} item>
                <center>
                    <Button variant="contained" onClick={(evt)=>submit()}>Save</Button>
                </center>
            </Grid>
        </Grid>
        
    </Container>
  );
};

export default withAuthenticationRequired(ReviewPage);