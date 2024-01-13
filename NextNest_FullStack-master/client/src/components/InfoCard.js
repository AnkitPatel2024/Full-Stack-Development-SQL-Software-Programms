
import { Card, CardContent, CardHeader, Typography } from '@mui/material';


import { metrics } from '../helpers/metrics'

const config = require('../config.json');

export default function InfoCard(props) {

  return (
       <Card sx={{m:5}}>
        <CardHeader
          title={props.title}
          titleTypographyProps={{color: props.titleColor}}
        />
        <CardContent>
          {props.metrics.map((f)=>{
            return f.metric in props.data && props.data[f.metric] ? 
                <Typography key={f.metric}>
                    <b>{f.display}:</b> {f.formatter(props.data[f.metric])}
                </Typography> : null;
          })}
        </CardContent>
      </Card>
  );
};