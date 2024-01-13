
const mysql = require('mysql')
const config = require('./config.json')
const NodeCache = require('node-cache')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const geoTypeMap = {
  state: 'states',
  county: 'counties',
  metro: 'metros',
  place: 'places'
}

const geonamesCache = new NodeCache();
const geo_names = async function(req, res) {
  console.log(req.query.types)
  if (geonamesCache.has('geo_names')){
    console.log("Getting it from cache");
    //console.log(geonamesCache.get('geo_names'))
    return res.send(geonamesCache.get('geo_names'));
  }
  else{ 
  let subqueries = req.query.types.map((t)=>{
    return (
      `SELECT name, geo_id, '${t}' as type from ${geoTypeMap[t]}`
    )
  })
  let query = subqueries.join(' UNION ALL ')
  connection.query(
    query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      geonamesCache.set('geo_names', data);
      console.log("Getting it from API cache")
      res.json(data);
    }
  });
}
}

const geo_detail = async function(req, res) {
  
  connection.query(`
    with avg_review as (
      SELECT geo_id, AVG(stars) as rating from reviews where geo_id = '${req.params.geo_id}'
      group by geo_id
    )

    SELECT a.name, b.*, ar.rating FROM
    ${geoTypeMap[req.params.geo_type]} a
    inner join
    ${req.params.geo_type}_stats b
    on a.geo_id = b.geo_id
    LEFT JOIN avg_review as ar
    ON a.geo_id = ar.geo_id
    where a.geo_id = '${req.params.geo_id}' and year=${req.params.year} ;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

const user_reviews = async function(req, res) {
  
  connection.query(`
    with urev as (SELECT 
      r.*
    from reviews r
    WHERE r.reviewer = '${req.params.user}')

    SELECT l.name, r.* from
    urev as r, states as l
      where r.geo_id = l.geo_id and r.geo_type = 'state'

    UNION 

    SELECT l.name, r.* from
    urev as r, counties as l
      where r.geo_id = l.geo_id and r.geo_type = 'county'

    UNION 

    SELECT l.name, r.* from
    urev as r, places as l
      where r.geo_id = l.geo_id and r.geo_type = 'place'

      UNION 

    SELECT l.name, r.* from
    urev as r, metros as l
      where r.geo_id = l.geo_id and r.geo_type = 'metro'
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const user_favorites = async function(req, res) {
  
  connection.query(`
    with ufav as (SELECT 
      r.*
    from favorites r
    WHERE r.user = '${req.params.user}')

    SELECT l.name, r.* from
    ufav as r, states as l
      where r.geo_id = l.geo_id and r.geo_type = 'state'

    UNION 

    SELECT l.name, r.* from
    ufav as r, counties as l
      where r.geo_id = l.geo_id and r.geo_type = 'county'

    UNION 

    SELECT l.name, r.* from
    ufav as r, places as l
      where r.geo_id = l.geo_id and r.geo_type = 'place'

      UNION 

    SELECT l.name, r.* from
    ufav as r, metros as l
      where r.geo_id = l.geo_id and r.geo_type = 'metro'
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const geo_name = async function(req, res) {
  
  connection.query(`
    SELECT * FROM
    ${geoTypeMap[req.params.geo_type]} 
    where geo_id = '${req.params.geo_id}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}



const geo_shapes = async function(req, res) {
  //36.703853 -114.804650, 37.233365 -113.624950
  let matched = req.query.coords ? `with matched as (
    select
        geo_id, geo_json, type
    from
        geo_indexed
    where
    mbrintersects(
      ST_GeomFromText('LINESTRING(${req.query.coords})',4326),
      geo_index
    )
        AND
        type = '${req.params.geo_type}'
)` : `with matched as (select geo_id, geo_json, type from geo_indexed where type = '${req.params.geo_type}')`
  let query =`
      ${matched}
  SELECT 
    geo.geo_id, geo.geo_json, geo.type,
    meta.name,
    '${req.params.metric}' as metric,
    metrics.${req.params.metric} as value
  FROM 
    matched geo
  INNER JOIN
    ${geoTypeMap[req.params.geo_type]} meta
    ON geo.geo_id = meta.geo_id
  INNER JOIN
    ${req.params.geo_type}_stats metrics
    ON geo.geo_id = metrics.geo_id
  AND metrics.year = ${req.params.year}
  ORDER BY metrics.${req.params.metric} desc;
`;
console.log(query);
  connection.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const geo_shape = async function(req, res) {
  
  connection.query(`
    SELECT 
      * from
    geo where geo_id = '${req.params.geo_id}'
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

const favorite = async function(req, res) {
  let b = req.body;
  let query;
  if (b.get){
    query = `
      select user from favorites where user = '${b.user}' and geo_type='${b.geo_type}' and geo_id = '${b.geo_id}'; 
    `
    connection.query(query, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json({isFavorite: data.length>0});
      }
    });
  }else{
    if(b.favorite){
      query = `
        INSERT INTO favorites (user, geo_type, geo_id)

        VALUES ('${b.user}','${b.geo_type}','${b.geo_id}');
       `
    }else{
      query = `
        delete from favorites where user = '${b.user}' and geo_type='${b.geo_type}' and geo_id = '${b.geo_id}'; 
       `
    }


    connection.query(query, (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json({ok: true});
      }
    });
  }
  
}

const post_review = async function(req, res) {
  let b = req.body;
  let query;
  if (b.update){
    query = `
      UPDATE reviews set
      lived = ${b.lived}, duration = ${b.duration}, review='${b.review}', stars=${b.stars}
      WHERE geo_id = '${b.geo_id}' and reviewer = '${b.user}';
    `
  }else{
    query = `
      INSERT INTO reviews (reviewer, lived, duration, review, stars, geo_type, geo_id)

      VALUES ('${b.user}',${b.lived},${b.duration},'${b.review}',${b.stars},'${b.geo_type}','${b.geo_id}')
    `
  }
  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json({ok: true});
    }
  });
}

const search = async function(req, res) {
  
  let jsn = req.body;

  let pageSize = jsn.pageSize || 100;
  let page = jsn.page - 1 || 0; 
  let offset = pageSize * page;
  let b = jsn.filters;
  let desc = jsn.desc ? 'DESC' : ''
  let sort = jsn.sort || 'name';
  let selection = b.map((f)=>`b.${f.field} BETWEEN ${f.min} AND ${f.max}`);
  let projection = b.map((f)=>`,b.${f.field}`).join('');
  let selection_joined = selection.join(' AND ')
  let query_body = jsn.geos.map((g)=>{
    return(
      `SELECT a.geo_id, a.name, '${g}' as geo_type ${projection}
      FROM ${geoTypeMap[g]} as a join
      ${g}_stats as b on a.geo_id = b.geo_id
      where b.year = 2021 AND ${selection_joined}`
    )
  }).join(' UNION ')
  let query = `
    SELECT * FROM(
      ${query_body}
      ) as res
    ORDER BY ${sort} ${desc}, name
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  console.log(query)
  connection.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const get_review = async function(req, res) {
  let query =`
    SELECT * FROM reviews WHERE 
    reviewer='${req.params.user}' AND
    geo_id = '${req.params.geo_id}' AND
    geo_type = '${req.params.geo_type}';
  `;
  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

const delete_review = async function(req, res) {
  let query =`
    DELETE FROM reviews WHERE 
    reviewer='${req.params.user}' AND
    geo_id = '${req.params.geo_id}' AND
    geo_type = '${req.params.geo_type}';
  `;
  connection.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.json({ok:false});
    } else {
      res.json({ok:true});
    }
  }); 
}

//Route geo_keys: GET /geo_keys/:geo_type'
const geo_keys = async function(req, res) { 
  const geo_type = req.params.geo_type; 

  connection.query(`
  SELECT geo.name
  FROM ${geoTypeMap[req.params.geo_type]} geo
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

//Route geo_trends: GET /geo_trends/:geo_type/:geo_name/:metric1/:metric2/:timeframe1/:timeframe2
const geo_trends = async function(req, res) { 
  console.count(Date.now());
  const geo_type = req.params.geo_type; 
  const geo_name = req.params.geo_name;
  const metric1 = req.params.metric1;
  const metric2 = req.params.metric2;

  connection.query(`
  SELECT b.geo_id, b.year, b.${req.params.metric1}, b.${req.params.metric2}
  FROM
  ${geoTypeMap[req.params.geo_type]} a
  JOIN
  ${req.params.geo_type}_stats b
  on a.geo_id = b.geo_id
  WHERE a.name LIKE '${geo_name}' and b.year >= ${req.params.timeframe1} 
            and b.year <= ${req.params.timeframe2}
  ORDER BY b.year;
  `, (err, data) => {   
    if (err || data.length === 0) {
      console.log("line 110", err);
      res.json({});
    } else {
      console.log(Date.now())
      res.json(data);
    }
  });
}
 
//
module.exports = {
  geo_detail,
  geo_shapes,
  geo_shape,
  geo_names,
  geo_name,
  get_review,
  post_review,
  favorite,
  user_reviews,
  user_favorites,
  delete_review,
  geo_keys,
  geo_trends,
  search
}
