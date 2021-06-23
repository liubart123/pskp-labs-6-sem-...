const express = require('express');
const swaggerUI = require('swagger-ui-express');

const app = express();

const PORT = 5000;

//https://starkovden.github.io/swagger-ui-tutorial.html
//https://idratherbewriting.com/learnapidoc/pubapis_swagger.html

//тут есть описание того, как можно составить swaggerDoc
//https://swagger.io/specification/
//It is RECOMMENDED that the root OpenAPI document be named: openapi.json or openapi.yaml.


//для того, чтобы монжо было нормально прописывать JSON с подсказками нужно добавить схему (свойство "$schema" в начале документа):
//"$schema": "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json",
// https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings
// https://github.com/OAI/OpenAPI-Specification/blob/master/schemas/v3.0/schema.json
// https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json



// setup(
//     swaggerDoc?: JsonObject,
//     opts?: SwaggerUiOptions,
//     options?: SwaggerOptions,
//     customCss?: string,
//     customfavIcon?: string,
//     swaggerUrl?: string,
//     customSiteTitle?: string
// ): e.RequestHandler<ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>

// Creates a middleware function that returns the pre-generated HTML file for the Swagger UI page.

// @param swaggerDoc — JSON object with the API schema.
// @param opts — swagger-ui-express options.
// @param options — custom Swagger options.
// @param customCss — string with a custom CSS to embed into the page.
// @param customfavIcon — link to a custom favicon.
// @param swaggerUrl — URL of the Swagger API schema, can be specified instead of the swaggerDoc.
// @param customSiteTitle — custom title for a page.

// @returns — an express middleware function that returns the generated HTML page.

const swaggerDocument = require('./openapi.json');
const swaggerDocument2 = require('./openapi2.json');

const configuredSwagger = swaggerUI.setup(swaggerDocument, {
    customSiteTitle: 'TS API',
    explorer: true
})


app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})

//app.use(express.static('./node_modules/swagger-ui-dist/'));

//когда ставил app.get, то оно не работало, так как не могло загрузить некоторые из нобходимых ресурсов
app.use('/doc', swaggerUI.serve, configuredSwagger)


app.use(express.json())

const router = require('./api-router');

app.use('/ts', router);

app.use((req, res, next) => {
    res.status(404).send();
})

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        type: "E_INTERNALERROR",
        message: "Internal server error"
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} port`);
})