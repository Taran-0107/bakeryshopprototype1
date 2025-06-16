const fs = require('fs');
const path = require('path');

/**
 * Dynamically loads all routes from the '../routes' directory.
 * @param {object} app - The Express app instance.
 */
function route_my_app(app) {
  // Construct the absolute path to the routes directory
  const routesDir = path.join(__dirname, '..', 'routes');

  // Read all filenames from the directory
  fs.readdirSync(routesDir).forEach(file => {
    // We only want to process JavaScript files
    if (file.endsWith('.js')) {
      // Get the name of the route from the filename, e.g., "login.js" -> "login"
      const routeName = path.basename(file, '.js');

      // Require the router module using its full path
      const router = require(path.join(routesDir, file));
      
      // Determine the URL path for the router.
      // We'll treat 'home' as a special case to map it to the root path '/'.
      const urlPath = `/${routeName}`;

      // Use the router with the determined path
      app.use(urlPath, router);
      //console.log(`Successfully mounted ${file} at ${urlPath}`);
    }
  });
}

module.exports = route_my_app;