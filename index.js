const { Sequelize, DataTypes, Op } = require('sequelize');

module.exports = function mysqlORM(mysqlConfig) {
  const { host, user, password, db, port=3306 } = mysqlConfig;

  const sequelize = new Sequelize(db, user, password, {
    host,
    port,
    dialect: 'mysql'
  });

  console.log(`Connected to MySQL database ${db} at ${host}:${port} as user ${user}`);

  // 自动定义模型（类似 M('user')）
  async function M(tableName) {
    // 先查询表结构
    const [results] = await sequelize.query(`DESCRIBE ${tableName}`);
    
    // 动态创建模型
    const attributes = {};
    results.forEach(column => {
      attributes[column.Field] = {
        type: getDataType(column.Type),
        allowNull: column.Null === 'YES',
        primaryKey: column.Key === 'PRI',
        autoIncrement: column.Extra.includes('auto_increment')
      };
    });
    
    return sequelize.define(tableName, attributes, {
      tableName,
      timestamps: false // 不自动添加 createdAt/updatedAt
    });
  }

  // MySQL 数据类型到 Sequelize DataTypes 的映射函数
  function getDataType(mysqlType) {
    // 提取基础类型（去掉括号内的长度信息）
    const baseType = mysqlType.split('(')[0].toLowerCase();
    
    switch (baseType) {
      case 'int':
      case 'integer':
      case 'tinyint':
      case 'smallint':
      case 'mediumint':
      case 'bigint':
        if (mysqlType.includes('unsigned')) {
          return DataTypes.INTEGER.UNSIGNED;
        }
        return DataTypes.INTEGER;
        
      case 'float':
        return DataTypes.FLOAT;
        
      case 'double':
      case 'double precision':
        return DataTypes.DOUBLE;
        
      case 'decimal':
      case 'dec':
      case 'numeric':
        return DataTypes.DECIMAL;
        
      case 'char':
      case 'varchar':
      case 'tinytext':
      case 'text':
      case 'mediumtext':
      case 'longtext':
        return DataTypes.STRING;
        
      case 'binary':
      case 'varbinary':
      case 'tinyblob':
      case 'blob':
      case 'mediumblob':
      case 'longblob':
        return DataTypes.BLOB;
        
      case 'date':
        return DataTypes.DATEONLY;
        
      case 'datetime':
      case 'timestamp':
        return DataTypes.DATE;
        
      case 'time':
        return DataTypes.TIME;
        
      case 'year':
        return DataTypes.INTEGER;
        
      case 'enum':
      case 'set':
        // 提取枚举值
        const enumValues = mysqlType.match(/\(([^)]+)\)/);
        if (enumValues) {
          const values = enumValues[1].replace(/'/g, '').split(',');
          return DataTypes.ENUM(...values);
        }
        return DataTypes.STRING;
        
      case 'boolean':
      case 'bool':
        return DataTypes.BOOLEAN;
        
      case 'json':
        return DataTypes.JSON;
        
      default:
        console.warn(`Unknown MySQL type: ${mysqlType}, using STRING as fallback`);
        return DataTypes.STRING;
    }
  }

  //返回值
  return { sequelize, M, Op };
}
