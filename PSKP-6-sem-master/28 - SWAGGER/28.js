const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(3000, ()=>{
    console.log('app is listerning on port 3000');
});