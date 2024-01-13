# Mavericks

## Dependencies: 
The code has been tested against node js version 19.6.0 on a linux environment

### Client Dependencies
├── @auth0/auth0-react@2.0.1
├── @emotion/react@11.10.5
├── @emotion/styled@11.10.5
├── @mui/icons-material@5.11.11
├── @mui/material@5.11.4
├── @mui/x-data-grid@5.17.18
├── @testing-library/jest-dom@5.16.5
├── @testing-library/react@13.4.0
├── @testing-library/user-event@13.5.0
├── geojson2svg@1.3.3
├── html-react-parser@3.0.15
├── leaflet@1.9.3
├── proj4@2.9.0
├── react-dom@18.2.0
├── react-leaflet@4.2.1
├── react-router-dom@6.6.2
├── react-scripts@5.0.1
├── react-window@1.8.8
├── react@18.2.0
├── recharts@2.3.1
└── reproject@1.2.7

### Server Dependencies
├── cors@2.8.5
├── express-openid-connect@2.15.0
├── express@4.18.2
├── mysql@2.18.1
├── node-cache@5.1.2
├── nodemon@2.0.20
└── supertest@6.3.3

## Steps to run (from a bash terminal):
1. open a terminal and change to the "client" directory
2. from the client directory, run "npm install"
3. change to the "server" directory
4. from the server directory, run "npm install"
5. from the server directory, run "npm start" (runs on port 8080)
6. open a new terminal
7. change to the "client" directory
8. from the client directory, run "npm start" (runs on port 3000)
9. open localhost:3000 in your browser