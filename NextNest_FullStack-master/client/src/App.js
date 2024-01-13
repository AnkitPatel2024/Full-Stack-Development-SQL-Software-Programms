import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber, teal, deepOrange, blue, blueGrey } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import HeatMapPage from './pages/HeatMapPage';
import SearchPage from './pages/SearchPage';
import TrendsPage from './pages/TrendsPage';
import ComparisonPage from './pages/ComparisonPage';
import DetailsPage from './pages/DetailsPage';
import ReviewsPage from './pages/ReviewPage'
import ProfilePage from './pages/Profile'
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history';
import ProtectedRoute from "./auth/protected-route";


// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: teal,
    secondary: blueGrey
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Auth0ProviderWithHistory>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/heatmap/:geo_type/:metric_type" element={<HeatMapPage />} />
            <Route path="/heatmap" element={<HeatMapPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/details/:geo_type/:geo_id" element={<DetailsPage />} />
            <Route path="/review/:geo_type/:geo_id" element={<ReviewsPage />} />
          </Routes>
          </Auth0ProviderWithHistory>
      </BrowserRouter>
    </ThemeProvider>
  );
}