var express = require("express");
var mysql = require("mysql")
var router = express.Router();
var pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	password: '123456', //mysql安装时设置的pwd
	database: 'project', // 数据库名称
	port: 3306 //端口号
});

//分页
router.get('/page', function(requst, response) {
	console.log('分页')
	var pageNum = requst.param('pageNum')
	 var total = 0;
    getPages(pageNum,function(err,results){
        if(err){
            console.log('error!')
        }else if(results){
        total = results;
            getResults(pageNum,function(err,results,pageSize){
               // total=results.length;
                var page = Math.ceil(total/pageSize);
                var data = {total:total,pageSize:pageSize,page:page,list:results};
                response.send(data)

            })
        }

    })

})

//搜索
router.get('/search', function(req, res) {
		console.log('搜索页');
		var cont = req.param('cont');
		console.log(cont);
		searchUsersById(cont, function(err, results) {
			if(err) {
				res.send(err);
			} else if(results) {
				// console.log('>>>'+results);
				res.send(results);
			}
		})
	})
	//删除
router.get('/del', function(req, res) {
	console.log('删除页');
	var id = req.param('id') //get方式获取参数
	console.log('id:' + id);
	deleteById(id, function(err, results) {
		if(err) {
			res.send({
				flag: 2
			});
		} else if(results.affectedRows > 0) {
			//res.send({flag:1});
			res.send(results);
		}
	})

});
//详情
router.get('/detail', function(req, res) {
	console.log('详情页');
	var id = req.param('id') //get方式获取参数
	console.log('id:' + id);
	getUserById(id, function(err, results) {
		if(err) {
			res.send(err);
		} else if(results) {
			res.send(results);
		}
	})

});
//提交
router.post('/tijiao', function(req, res) {
	console.log('提交页');
	var username = req.body['username'];
	var uname = req.body['uname'];
	var pwd = req.body['pwd'];
	var sex = req.body['sex'];
	var age = req.body['age'];
	var tel = req.body['tel'];
	var email = req.body['email'];
	var uid = req.body['uid'];
	updateInterview(username, uname, pwd, sex, age, tel, email, uid, function(err, result) {
		if(err) {
			err = {
				flag: 3
			}; //更新失败
			res.send(err)
			return;
		}
		if(result.changedRows > 0) {
			result = {
				flag: 1
			}; //更新成功
			res.send(result);
		} else {
			err = {
				flag: 2
			}; //更新失败
		}
	});

});

router.post('/login', function(requst, response) {
	console.log('登录页')
	response.send({
		"flag": 1
	});
});

router.post('/denglu', function(req, res) {
	console.log('登录页')
	var username = req.body['username'];
	var pwd = req.body['pwd'];
	console.log(pwd)
		//console.log(username+','+pwd)
	getUserByName(username, function(err, results) {
		if(results == null || results == '') {
			console.log('用户名不存在')
			res.send({
				flag: 2
			});
			return;
		} else if(results[0].pwd != pwd) {
			console.log('密码错误')
			res.send({
				flag: 3
			});
			return
		} else if(results[0].pwd == pwd && results[0].username == username) {
			console.log('成功')
			res.send({
				flag: 1
			});
			return
		} else {
			res.send({
				flag: 4
			});
			return
		}
	})
});

router.get('/list', function(req, res) {
	console.log('列表页')
		/*var arr=[
		   {name:'syy',id:'1',intime:'2016-12-14'},
		   {name:'yxs',id:'2',intime:'2016-12-14'},
		   {name:'qqq',id:'3',intime:'2016-12-14'},
		   {name:'www',id:'4',intime:'2016-12-14'}];
		   res.send(arr)*/
	getAllUsers(function(err, results) {
		if(err) {
			res.send(err);
		} else if(results) {
			// console.log('>>>'+results);
			res.send(results);
		}
	})

});

router.post('/regist', function(req, res) {
	console.log('注册页')
	var username = req.body['username'];
	var pwd = req.body['pwd'];
	var uname = req.body['uname'];
	var sex = req.body['sex'];
	var age = req.body['age'];
	var tel = req.body['tel'];
	var email = req.body['email'];
	console.log(username + ',' + pwd + ',' + age + ',' + sex)
	getUserByName(username, function(err, results) {
		if(results != null && results != '') {
			res.send({
				flag: 2
			});
			return;
		}

		save(username, pwd, uname, sex, age, email, tel, function(err, result) {
			if(err) {
				// err = {flag:4};//注册失败
				res.send({
					flag: 3
				})
				return;
			}
			if(result.insertId > 0) {
				console.log('注册成功！');
				result = {
					flag: 1
				}; //注册成功
				res.send(result);
			} else {
				res.send({
					flag: 3
				})
				return;
			}
		});

	})

});
//获取删除
function deleteById(id, callback) {
	pool.getConnection(function(err, connection) {
		var deleteById_Sql = 'delete from user where uid = ?';
		connection.query(deleteById_Sql, [id], function(err, result) {
			if(err) {
				console.log("deleteById Error: " + err.message);
				return;
			}
			connection.release();
			callback(err, result);
		});
	});
}
//获取信息列表
function getAllUsers(callback) {
	pool.getConnection(function(err, connection) {
		var getAllUsers_Sql = 'select * from  user';
		connection.query(getAllUsers_Sql, function(err, result) {
			if(err) {
				console.log("getAllUsers Error: " + err.message);
				return;
			}
			connection.release();
			callback(err, result);
		});
	});
}

//根据用户名查询
function getUserByName(uname, callback) {
	pool.getConnection(function(err, connection) {
		var sql = "select * from user where username = ?";
		connection.query(sql, [uname], function(err, result) {
			if(err) {
				console.log("getUserByName Error: " + err.message);
				return;
			}
			connection.release();
			console.log("invoked[getUserByName]");
			callback(err, result);
		});
	});
};

//保存数据
function save(username, pwd, uname, sex, age, email, tel) {
	pool.getConnection(function(err, connection) {
		var sql = "insert into user(uid,username,pwd,uname,sex,age,email,tel) values(0,?,?,?,?,?,?,?)";
		connection.query(sql, [username, pwd, uname, sex, age, email, tel], function(err, result) {
			if(err) {
				console.log("insertUser_Sql Error: " + err.message);
				return;
			}
			connection.release();
			console.log("invoked[save]");
			callback(err, result);
		});
	});
};

//通过Id获取详情
function getUserById(id, callback) {
	pool.getConnection(function(err, connection) {
		var getUserById_Sql = 'select * from user where uid=?';
		connection.query(getUserById_Sql, [id], function(err, result) {
			if(err) {
				console.log("getUserById Error: " + err.message);
				return;
			}
			connection.release();
			//console.log("invoked[getUserById]");
			callback(err, result);
		});
	});
}
//更新数据
function updateInterview(username, uname, pwd, sex, age, tel, email, uid, callback) {
	pool.getConnection(function(err, connection) {
		var update_Sql = "update user set username=?,uname=?,pwd=?,sex=?,age=?,tel=?,email=? where uid = ?";
		connection.query(update_Sql, [username, uname, pwd, sex, age, tel, email, uid], function(err, result) {
			if(err) {
				console.log("update_Sql Error: " + err.message);
				return;
			}
			connection.release();
			//console.log("invoked[updateInterview]");
			callback(err, result);
		});
	});
};

//获取搜索列表
function searchUsersById(cont, callback) {
	pool.getConnection(function(err, connection) {
		var searchUsersById_Sql = "select * from user where username like '%' ? '%' or uname like '%' ? '%'";
		connection.query(searchUsersById_Sql, [cont, cont], function(err, result) {
			if(err) {
				console.log("searchUsersById Error: " + err.message);
				return;
			}
			connection.release();
			callback(err, result);
		});
	});
}

//分页
function getResults (pageNum,callback){
    console.log('into getResults....')
    var pageSize = 2;
    var startPage = pageNum*pageSize;
    pool.getConnection(function(err, connection) {
        var total_Sql ='select * from  user limit ?,?';
        connection.query(total_Sql,[startPage,pageSize], function(err, result) {
            if (err) {
                console.log("total_Error: " + err.message);
                return;
            }
             connection.release();
            callback(err,result,pageSize);

        });
    });
}

function getPages (pageNum,callback){
    console.log('into getPages....')
    var total =0;
    pool.getConnection(function(err, connection) {
        var total_Sql ='select uid from  user';
        connection.query(total_Sql, function(err, result) {
            if (err) {
                console.log("total_Error: " + err.message);
                return;
            }
            connection.release();
            total = result.length;
            callback(err,total);

        });

    });

}



module.exports = router;