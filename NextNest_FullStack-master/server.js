const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/geo_detail/:year/:geo_type/:geo_id', routes.geo_detail);
app.get('/geo_shapes/:geo_type/:metric/:year', routes.geo_shapes);
app.get('/geo_shape/:geo_id', routes.geo_shape);
app.get('/geo_trends/:geo_type/:geo_name/:metric1/:metric2/:timeframe1/:timeframe2', routes.geo_trends);
app.get('/geo_keys/:geo_type', routes.geo_keys);

//app.get('/get_password/:username', routes.validate_login);
//app.get('/check_userName/:username_req', routes.check_usernameAvail);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
