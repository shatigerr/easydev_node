import express, { query } from 'express'


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const host = "https://easydevapi.onrender.com/"

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

        // Check key
        if (key !== result.key) {
            return res.status(401).send("INCORRECT KEY");
        }

        let endpoint = result.endpoints.filter(e => e.url == endpointid);

        if (endpoint.length === 0) {
            return res.status(404).send("ENDPOINT NOT FOUND");
        }

        
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
            throw new Error(`Error in request response: ${requestResponse.statusText}`);
        }

        let requestResponseData = await requestResponse.json();

        // Log and send response
        console.log(requestResponseData);
        if(req.method == "GET")
        {
            res.send(requestResponseData)
        }else{
            res.send({"rowsAffected":requestResponseData});
        }
        

    } catch (error) {
        console.error("Error in request processing:", error);
        res.status(500).send(`Error in request processing: ${error.message}`);
    }
}

app.listen("8080",() => {
    console.log("PORT 8080");
})