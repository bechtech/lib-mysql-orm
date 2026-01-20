# lib-mysql-orm
工具库:mysql-orm
使用 M 自动创建表的模型

# 安装
```
npm i lib-mysql-orm
```

# 使用
```js
//example.js
const mysqlORM = require('lib-mysql-orm.js');

const {M, Op} = mysqlORM({
  host: '192.168.3.107',
  user: 'root',
  password: 'root',
  db: 'db_test',
  port: 3302
});

async function main(){
  const User = await M('users');
  const users = await User.findAll();
  console.log(users);
}

main();
```