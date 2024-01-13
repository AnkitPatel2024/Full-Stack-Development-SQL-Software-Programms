import { 
  Box, 
  Container, 
  Divider, 
  Link, 
  Chip, 
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Slider, Typography, Autocomplete, TextField, 
  CardHeader, CardContent, Card, Button, Grid, 
  CardActions, Stack, MenuItem, FormControlLabel, CardActionArea, IconButton } from '@mui/material';
import { useState } from 'react';
import * as React from 'react';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import Modal from '@mui/material/Modal';
import { metrics } from '../helpers/metrics';
import { sanitizeSortModel } from '@mui/x-data-grid/hooks/features/sorting/gridSortingUtils';
import { useNavigate } from 'react-router-dom';
import ReviewPage from './ReviewPage';

const config = require('../config.json');

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '3px'
};

export default function SearchPage() {
  const [filters, setFilters] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [curFilt, setCurFilt] = React.useState({display: ''});
  const [curFiltIdx, setCurFiltIdx] = React.useState(-1);
  const [curRange, setCurRange] = React.useState([0,100]);
  const [results, setResults] = React.useState([]);
  const [sort, setSort] = React.useState("");
  const [desc, setDesc] = React.useState(true);
  const [includeStates, setIncludeStates] = React.useState(true);
  const [includeCounties, setIncludeCounties] = React.useState(true);
  const [includeMetros, setIncludeMetros] = React.useState(true);
  const [includePlaces, setIncludePlaces] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);

  const navigate = useNavigate();
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => {setOpen(false);setCurFilt({display: ''});setCurFiltIdx(-1);};

  function deleteFilter(idx){
    let tmpfilt = filters
    tmpfilt.splice(idx, 1);
    setFilters([...tmpfilt])
  }

  function search(newPage=0){
    setPage(newPage);

    let filts = filters.map((f)=>{return({field: f.metric.metric, min: f.min, max:f.max})});
    console.log(filts)
    let geos = []
    if(includeStates) geos.push('state')
    if(includeCounties) geos.push('county')
    if(includeMetros) geos.push('metro')
    if(includePlaces) geos.push('place')

    if(!geos.length){
      alert('Must select at least one geographic type')
      return;
    }

    let data = {
      filters: filts,
      sort: sort,
      desc: desc,
      geos: geos,
      page: newPage,
      pageSize: pageSize
    }
    fetch(
      `http://${config.server_host}:${config.server_port}/search`,{
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
      setResults(resJson);
    });
  }

  function handleClick(filt, idx){
    setCurFilt(filt.metric);
    setCurFiltIdx(idx);
    setCurRange([filt.min, filt.max]);
    handleOpen();
  }

  function handleMetricSelect(value){
    for(let idx in filters){
      if(filters[idx].metric.metric == value.metric){
        handleClick(filters[idx],idx)
        return;
      }
    }

    setCurFilt(value);
    setCurFiltIdx(-1);
  }

  function addFilter(filt){
    if(curFiltIdx > -1){
      let tmpfilt = filters
      tmpfilt.splice(curFiltIdx, 1, filt);
      setFilters([...tmpfilt])
    }else{
      setFilters([...filters, filt]);
    }
    handleClose();
    if(!sort) setSort(filt.metric.metric)
  }

  function changePage(value){
    search(page + value);
  }

  function searchNew(){
    setPage(1);
    search(1);
  }

  return (
    <Container>

      <Card sx={{m:5}}>
        {/* <CardHeader title={'Filters:'} titleTypographyProps={{color:'primary'}}>
          
        </CardHeader> */}
        <Grid container sx={{p:5}} alignItems={'center'} justifyContent={'space-between'}>
          <Grid item xs={12}><Typography color='primary' variant={'h5'}>Search For:</Typography></Grid>
          <Grid item xs={12}>
            <FormControlLabel
              sx={{ml:2}}
              label={'States'}
              control={
                <Checkbox
                  checked={includeStates}
                  onChange={(evt)=>{setIncludeStates(evt.target.checked)}}
                  inputProps={{ 'aria-label': 'States' }}
                />
              }
            />
            <FormControlLabel
              sx={{ml:2}}
              label={'Counties'}
              control={
                <Checkbox
                  checked={includeCounties}
                  onChange={(evt)=>{setIncludeCounties(evt.target.checked)}}
                  inputProps={{ 'aria-label': 'Counties' }}
                />
              }
            />
            <FormControlLabel
              sx={{ml:2}}
              label={'Metros'}
              control={
                <Checkbox
                  checked={includeMetros}
                  onChange={(evt)=>{setIncludeMetros(evt.target.checked)}}
                  inputProps={{ 'aria-label': 'Metros' }}
                />
              }
            />
            <FormControlLabel
              sx={{ml:2}}
              label={'Places'}
              control={
                <Checkbox
                  checked={includePlaces}
                  onChange={(evt)=>{setIncludePlaces(evt.target.checked)}}
                  inputProps={{ 'aria-label': 'Places' }}
                />
              }
            />
          </Grid>
          <Grid item><Typography color='primary' variant={'h5'}>Filters:</Typography></Grid>
          <Grid item>
            {filters.length ? <FormControl sx={{width: '20em'}} >
            <InputLabel size='small' id="demo-simple-select-label">Sort By</InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id="demo-simple-select"
              value={sort}
              defaultValue={filters[0].metric.metric}
              label="Sort By"
              onChange={(evt)=>{setSort(evt.target.value)}}
              size='small'
            >
              {
                filters.map((f)=>{
                  return <MenuItem value={f.metric.metric}>{f.metric.display}</MenuItem>
                })
              }
            </Select>
          </FormControl> : null}
          {filters.length ? <FormControlLabel
              sx={{ml:2}}
              label={'Descending'}
              control={
                <Checkbox
                  checked={desc}
                  onChange={(evt)=>{setDesc(evt.target.checked)}}
                  inputProps={{ 'aria-label': 'Descending' }}
                />
              }
            /> : null}
          </Grid>
        </Grid>
        <CardContent>
          {filters.map((f, idx) => {
              return(
                <Chip
                  key={'filter' + idx}
                  label={`${f.metric.formatter(f.min)} < ${f.metric.display} < ${f.metric.formatter(f.max)}`}
                  onClick={()=>{handleClick(f, idx)}}
                  onDelete={()=>deleteFilter(idx)}
                />
              )
          })}
          
        </CardContent>
        {/* <CardHeader title={'Sort By:'} titleTypographyProps={{color:'primary'}}>
        </CardHeader> */}
        
        <CardActions sx={{display:'flex', justifyContent:'right'}}>
          <Button sx={{m:1}} color='secondary' variant={'contained'} onClick={handleOpen}>Add Filter</Button>
          <Button sx={{m:1}} color='secondary' variant={'contained'} onClick={searchNew}>Search</Button>
        </CardActions>
        
        </Card>

        <Stack spacing={2}>
          {
            results.map((r)=>{
              return(
                <Card  key={r.geo_id} onClick={()=>navigate(`/details/${r.geo_type}/${r.geo_id}`)}>
                  <CardActionArea>
                  <CardContent>
                    <Grid container justifyContent={'space-between'}>
                      <Grid item><Typography color='primary' variant={'h5'}>{r.name}</Typography></Grid>
                      <Grid item><Typography color='secondary' variant={'h6'}>{r.geo_type}</Typography></Grid>
                    </Grid>
                    {
                      Object.values(metrics).map((m)=>{
                        return r[m.metric] ? <Chip
                          key={r.geo_id + m.metric}
                          label={m.display + ': ' + m.formatter(r[m.metric])}
                        /> : null
                      })
                    }
                  </CardContent>
                  </CardActionArea>
                </Card>
              )
            })
          }
        </Stack>
        {results.length ? <Grid container justify='flex-end'>
          <div style={{marginLeft: 'auto'}}>
            <Typography display="inline" variant={'h6'}>
                Page:
            </Typography>
            <IconButton disabled={page==1} onClick={()=>{changePage(-1)}}>
              <ArrowCircleLeftIcon fontSize='large'/>
            </IconButton>
              <Typography display="inline" variant={'h6'}>
                {page}
              </Typography>
            <IconButton disabled={results.length < pageSize} onClick={()=>{changePage(1)}}>
            <ArrowCircleRightIcon fontSize='large'/>
            </IconButton>
          </div>
        </Grid> : null }
        

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <CardHeader title={'Update Filter'}></CardHeader>
            <CardContent>
              <Autocomplete
                disableClearable
                getOptionLabel={(option) => option.display}
                disablePortal
                id="combo-box-demo"
                options={Object.values(metrics)}
                sx={{ width: 300, zIndex: '10000' }}
                renderInput={(params) => <TextField {...params} label="Metric" />}
                renderOption={(props, option)=> <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props} >{option.display}</Box>}
                value={curFilt}
                onChange={(event, newValue) => {
                  handleMetricSelect(newValue);
                }}
              />
              {
                curFilt.display ? 
                  <Box sx={{m:5}}>
                    {curFilt.filter_max ? 
                    <Slider 
                      defaultValue={[curFilt.filter_min,curFilt.filter_max]} 
                      // aria-label="Default" 
                      valueLabelDisplay="on" 
                      min={curFilt.filter_min}
                      step={Math.min((curFilt.filter_max - curFilt.filter_min)/100,1)}
                      max={curFilt.filter_max}
                      valueLabelFormat={curFilt.formatter}
                      value={curRange}
                      onChange={(event, newValue)=>{setCurRange(newValue)}}
                    /> : 
                    <Box>N/A</Box>  
                  }
                  
                  </Box>
                : null
              }
            </CardContent>
            <center>
              <Button color='secondary' sx={{m:1}} variant={'contained'} onClick={handleClose}>Cancel</Button>
              { curFilt.display ? <Button color='secondary' sx={{m:1}} variant={'contained'} onClick={()=>{addFilter({metric:curFilt, min:curRange[0], max:curRange[1]})}}>Add</Button> : null}
            </center>
            
          </Box>
        </Modal>
    </Container>
  );
};