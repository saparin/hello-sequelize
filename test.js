var Sequelize = require('sequelize')
  ,	sequelize = new Sequelize('hello_sequelize', 'root', '1', {
      dialect: "mysql", // or 'sqlite', 'postgres', 'mariadb'
      port:    3306, // or 5432 (for postgres)
    });
    
require('./test.getting_started')(sequelize);
require('./test.models')(sequelize);
