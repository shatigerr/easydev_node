import express, { query } from 'express'


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//const host = "https://easydevapi.onrender.com/"
const host = "http://localhost:5102/"

app.get("/:key/:projectid/:endpointURL",  (req,res) => {
    let params = req.query
    executeApi(params,req,res)
})

app.post("/:key/:projectid/:endpointURL", (req,res) => {    
    let body = req.body
    executeApi(body,req,res)
})

app.delete("/:key/:projectid/:endpointURL", (req,res) => {    
    let body = req.body
    executeApi(body,req,res)
})

app.put("/:key/:projectid/:endpointURL", (req,res) => {    
    let body = req.body
    executeApi(body,req,res)
})

async function executeApi(object,req,res)
{
    let status = "200";
    let logObject = {
        type:req.method,
        status:status,
        IdUser: null,
        IdProject:req.params["projectid"],
        query:"",
        requestDuration:1
    }
    try {
        
        let key = req.params["key"];
        let projectid = req.params["projectid"];
        let endpointid = req.params["endpointURL"];

        
        

        let par = "";
        for (const key in object) {
            
            if(key.includes(":string"))
            {
                object[key] = `'${object[key]}'`
            }

            par += object[key] + ','
        }
        // Fetch project details
        let dataResponse = await fetch(`${host}api/Project/details/${projectid}`);
        
        let result = await dataResponse.json();
        console.log(result["idUser"]);
        logObject.IdUser = result["idUser"]
        
        

        // Check key
        if (key !== result.key) {
            logObject.status = "401";
            res.status(401).send("INCORRECT KEY");
            await logRequest(logObject)    
        }

        let endpoint = result.endpoints.filter(e => e.url == endpointid);
        
        if (endpoint.length === 0) {
            status = "404"
            res.status(404).send("ENDPOINT NOT FOUND");
            await logRequest(logObject)
        }

        logObject.query = endpoint[0].query;

        
        // Prepare request object
        let requestObj = {
            database: result.iddatabaseNavigation,
            query: endpoint[0].query,
            params: par
        };

        // Post request
        let requestResponse = await fetch(`${host}api/Request`, {
            method: 'POST',
            body: JSON.stringify(requestObj),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!requestResponse.ok) {
            status = "500"
            res.send("ERROR PROCESSING THE REQUEST")
            await logRequest(logObject)
        }

        let requestResponseData = await requestResponse.json();

        // Log and send response

        

        console.log(requestResponseData);
        
        if(req.method == "GET")
        {
            res.send(requestResponseData)
            await logRequest(logObject)
            
        }else{
            res.send({"rowsAffected":requestResponseData});
            await logRequest(logObject)
        }
        

    } catch (error) {
        status = "500"
        await logRequest(logObject)
        console.error("Error in request processing:", error);
        res.status(500).send(`Error in request processing: ${error.message}`);
    }
}

async function logRequest(logObject) {
    try {
        await fetch(`${host}api/Log`, {
            method: 'POST',
            body: JSON.stringify(logObject),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (logError) {
        console.error("Error logging request:", logError);
    }
}


app.listen("8080",() => {
    console.log("PORT 8080");
})