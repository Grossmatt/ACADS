const express = require('express')
const path = require('path')
const app = express()
const port = 3001


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/ajax_test.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
    
    
    
    
    
    
    
    
    
    
    
    
  