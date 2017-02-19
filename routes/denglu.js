var express = require("express");
var mysql = require("mysql")
var router = express.Router();
var pool  = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',      //mysql安装时设置的pwd
    database:'project', // 数据库名称
    port: 3306      //端口号
});
router.post('/login',function(requst,response){
	//console.log('into...')
	 getAllUsers(function(err,results){
        if(err){
            res.send(err);
        }else if(results){
            // console.log('>>>'+results);
            res.send(results);
        }
    })
	//response.send([{"flag":1},{"flag":2},{"flag":3}]);
});
router.post('/regist',function(req,res){
	console.log('333333333')
	var pwd = req.body['pwd'];
	var uname = req.body['uname'];
	console.log(username+','+pwd+','+age+','+sex)
	getUserByName(username,function(err,results) {
        if(results!=null&&results!=''){
            res.send({flag:2});
            return;
        }
        
        save(username,pwd,uname,sex,age,email,tel,function (err,result) {
            if (err) {
                // err = {flag:4};//注册失败
                res.send({flag:3})
                return;
            }
            if(result.insertId > 0){
                console.log('注册成功！');
                result={flag:1};//注册成功
                res.send(result);
            }else{
                res.send({flag:3})
                return;
            }
        });

    })

});
module.exports = router;
