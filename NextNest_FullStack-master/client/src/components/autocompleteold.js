import * as React from 'react';
import Chip from '@mui/material/Chip';

import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { Typography, Box, Divider, Grid } from '@mui/material';
import { Container } from '@mui/system';


import PropTypes from 'prop-types';

import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList } from 'react-window';


const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: style.top + LISTBOX_PADDING,
  };

  if (dataSet.hasOwnProperty('group')) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  return (
    <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
      {`#${dataSet[2] + 1} - ${dataSet[1]}`}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData = [];
    children.forEach((item) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    });
  
    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
      noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;
  
    const getChildSize = (child) => {
      if (child.hasOwnProperty('group')) {
        return 48;
      }
  
      return itemSize;
    };
  
    const getHeight = () => {
      if (itemCount > 8) {
        return 8 * itemSize;
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };
  
    const gridRef = useResetCache(itemCount);
  
    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  });

export default function Tags(props) {
    const [value, setValue] = React.useState([]);

  return (
      <Autocomplete
        multiple
        id="tags-standard"
        options={props.list}
        getOptionLabel={(option) => option.name}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          if(props.callback) props.callback(newValue);
        }}
        sx={{m:5}}
        renderOption={(props, option, { selected }) => {
            return(
            <li {...props} key={option.geo_id}>
                <Grid container alignItems={'center'} justifyContent={'space-between'} sx={{p:1}}>
                    <Grid item>
                        <Typography variant='body1'>{option.name}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography color={'gray'} variant='body2'>{option.type}</Typography>
                    </Grid>
                </Grid>
                <Divider sx={{m:.5}}/>
            </li>
            )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Location Search"
            placeholder="Search"
          />
        )}
      />
  );
}

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const top100Films = [
  {name: 'st george, utah', type:'place'},
  {name: 'washington county, utah', type:'county'},
  {name: 'salt lake metro area, utah', type:'metro'},
  {name: 'Utah', type:'state'}
];