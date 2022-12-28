module.exports.isAuthorized = function (req, res, next,result) {
    var Auth = req.headers.authorization;
    if (!Auth) {
        res.status(401).send("Sem credenciais")
    }
    var inf = Buffer.from(Auth.split(' ')[1], "base64").toString().split(":");
    var u = inf[0];
    var p = inf[1];
    var isValid = false;
    for(var i = 0;i < result.length; i++){
        if (result[i].user === u && result[i].pass === p) {
            isValid = true;
        }
    }
    if (isValid){
        next();
    }
    else{
        res.status(401).send("User ou pass errados");
    }
}