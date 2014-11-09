/*
 * http://sequelizejs.com/docs/latest/models
 */
 
var Sequelize = require('sequelize')
  ,	assert = require('assert')
  ,	_ = require('underscore')
  ,	json = require('format-json')
  ,	colors = require('colors');
  
module.exports = function(sequelize){
	 
	/*
	 * http://sequelizejs.com/docs/latest/models#finders-find
	 */
	it('#101: Data retrieval / Finders.\
		find - Search for one specific element in the database.', function(cb){
		var Project = sequelize
							.define('Project101', {
								title: Sequelize.STRING,
								name: Sequelize.STRING
							});
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([
					{ title: 'Project 1 title', name: 'Project 1' },
					{ title: 'Project 2 title', name: 'Project 2' },
					{ title: 'Project 3 title', name: 'Project 3' }]);
			})
			.then(function(){
				// search for known ids
				return Project.find(2);
			})
			.then(function(project){
				// project will be an instance of Project and stores the content of the table entry
				// with id 2. if such an entry is not defined you will get null
				assert.equal(project.id, 2);
				// search for attributes
				return Project.find({ where: {title: 'Project 2 title'} });
			})
			.then(function(project){
				// project will be the first entry of the Projects table with the title 'aProject' || null
				assert.equal(project.id, 2);
				// since v1.3.0: only select some attributes and rename one
				return Project
							.find({
								where: { title: 'Project 2 title' },
								attributes: ['id', ['name', 'title']]
							});
			})
			.then(function(project){
				// project will be the first entry of the Projects table with the title 'aProject' || null
				// project.title will contain the name of the project
				assert.equal(project.id, 2);
				assert.equal(project.title, 'Project 2');
				cb();
			})
			.catch(function(err){
				console.log('#101:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#finders-findorcreate
	 */
	it('#102: Data retrieval / Finders.\
		findOrCreate - Search for a specific element or create it if not available', function(cb){
		var User = sequelize
						.define('User102', {
							username: Sequelize.STRING,
							job: Sequelize.STRING
						});
						
		User.sync({ force: true })
			.then(function(){
				return User.findOrCreate({ where: {username: 'sdepold', job: 'Technical Lead JavaScript'} });
			})
			.spread(function(user, created){
				assert.equal(user.username, 'sdepold');
				assert(created);
				return User.findOrCreate({ where: {username: 'sdepold', job: 'Technical Lead JavaScript'} });
			})
			.spread(function(user, created){
				// So when we already have an instance
				assert.equal(user.username, 'sdepold');
				assert(!created);
				cb();
			})
			.catch(function(err){
				console.log('#102:'.bold, err.message.bold);
				assert(false);
				cb();
			});
				
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#finders-findandcountall
	 */
	it('#103: Data retrieval / Finders.\
		findAndCountAll - Search for multiple elements in the database, returns both data and total count', function(cb){
		var Project = sequelize
							.define('Project103', {
								title: Sequelize.STRING
							});
							
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([
					{ title: 'foo1' },
					{ title: 'foo2' },
					{ title: 'foo3' }]);
			})
			.then(function(){
				return Project
							.findAndCountAll({
								where: ["title LIKE 'foo%'"],
								//~ where: { title: 'foo2' },
								offset: 1,
								limit: 2
							});
			})
			.then(function(result){
				// an integer, total number of records (matching the where clause)
				assert.equal(result.count, 3);
				// an array of objects, the records (matching the where clause) within the limit/offset range
				assert.equal(result.rows.length, 2);
				assert.equal(result.rows[0].title, 'foo2');
				assert.equal(result.rows[1].title, 'foo3');
				cb();
			})
			.catch(function(err){
				console.log('#103:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#finders-findall
	 */
	it('#104: Data retrieval / Finders.\
		findAll - Search for multiple elements in the database', function(cb){
		var Project = sequelize
							.define('Project104', {
								name: Sequelize.STRING
							});
		
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([
					{ name: 'Project 1' },
					{ name: 'Project 2' },
					{ name: 'Project 3' }]);
			})
			.then(function(){
				// find multiple entries
				return Project.findAll();
			})
			.then(function(projects){
				// projects will be an array of all Project instances
				assert.equal(projects.length, 3);
				// also possible:
				return Project.all();
			})
			.then(function(projects){
				// projects will be an array of all Project instances
				assert.equal(projects.length, 3);
				// search for specific attributes - hash usage
				return Project.findAll({ where: {name: 'Project 2'} });
			})
			.then(function(projects){
				// projects will be an array of Project instances with the specified name
				assert.equal(projects.length, 1);
				assert.equal(projects[0].name, 'Project 2');
				// search with string replacements
				return Project.findAll({ where: ["id > ?", 2] });
			})
			.then(function(projects){
				// projects will be an array of Projects having a greater id than 2
				assert.equal(projects.length, 1);
				assert.equal(projects[0].id, 3);
				// search within a specific range
				return Project.findAll({ where: { id: [1,3] } });
			})
			.then(function(projects){
				// projects will be an array of Projects having the id 1, 3
				// this is actually doing an IN query
				assert.equal(projects.length, 2);
				assert(_.findWhere(projects, { id: 1 }));
				assert(_.findWhere(projects, { id: 3 }));
				// or
				return Project.findAll({ where: "name = 'Project 2'" });
			})
			.then(function(projects){
				// the difference between this and the usage of hashes (objects) is, that string usage
				// is not sql injection safe. so make sure you know what you are doing!
				assert.equal(projects.length, 1);
				assert.equal(projects[0].name, 'Project 2');
				// since v1.7.0 we can now improve our where searches
				return Project.findAll({ where: {id: {gt: 2}} }); // id > 2
			})
			.then(function(projects){
				// projects will be an array of Projects having a greater id than 2
				assert.equal(projects.length, 1);
				assert.equal(projects[0].id, 3);
				cb();
			})
			.catch(function(err){
				console.log('#104:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});

	/*
	 * http://sequelizejs.com/docs/latest/models#finders-complex-where-queries
	 */
	it('#105: Data retrieval / Finders.\
		Complex filtering / OR queries', function(cb){
		var Project = sequelize
							.define('Project105', {
								name: Sequelize.STRING
							});
		
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([
					{ name: 'Project 1' },
					{ name: 'Project 1' },
					{ name: 'Project 3' },
					{ name: 'Project 4' },
					{ name: 'Project 5' }]);
			})
			.then(function(){
				// Since v1.7.0-rc3, it is possible to do complex where queries with multiple levels of nested AND and OR conditions.
				// Notice, that instead of Sequelize.and you can also use a plain array which will be treated as Sequelize.and 
				// if it contains objects or hashes or other complex data types.
				return Project
							.find({
								where: Sequelize.and(
									{ name: 'Project 1' },
									Sequelize.or(
										{ id: 5 },
										{ id: { lt: 3 }}
									)
								)
							});
			})
			.then(function(project){
				assert.equal(project.id, 1);
				cb();
			})
			.catch(function(err){
				console.log('#105:'.bold, err.message.bold);
				assert(false);
				cb();
			});
		
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#finders-limit---offset---order---group
	 */
	it('#106: Data retrieval / Finders.\
		Manipulating the dataset with limit, offset, order and group', function(cb){
		var Project = sequelize
							.define('Project106', {
								name: Sequelize.STRING,
								age: Sequelize.INTEGER
							});
		
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([
					{ name: 'Project 1', age: 10 },
					{ name: 'Project 1', age: 20 },
					{ name: 'Project 3', age: 30 },
					{ name: 'Project 4', age: 40 },
					{ name: 'Project 5', age: 50 }]);
			})
			.then(function(){
				// limit the results of the query
				return Project.findAll({ limit: 3 });
			})
			.then(function(projects){
				assert.equal(projects.length, 3);
				// step over the first 2 elements
				return Project.findAll({ offset: 2 });
			})
			.then(function(projects){
				assert.equal(projects.length, 3);
				// step over the first 2 elements, and take 2
				return Project.findAll({ offset: 2, limit: 2 });
			})
			.then(function(projects){
				assert.equal(projects.length, 2);
				assert(_.findWhere(projects, { id: 3 }));
				assert(_.findWhere(projects, { id: 4 }));
				// yields ORDER BY id DESC
				return Project.findAll({ order: 'id DESC' });
			})
			.then(function(projects){
				assert.equal(projects[0].id, 5);
				assert.equal(projects[1].id, 4);
				assert.equal(projects[2].id, 3);
				assert.equal(projects[3].id, 2);
				assert.equal(projects[4].id, 1);
				// yields GROUP BY name
				// TODO: example for array notation of `group` and `order`
				return Project.findAll({ group: 'name' });
			})
			.then(function(projects){
				assert(_.filter(projects, function(elem){ return elem.id == 1 }).length, 1);
				cb();
			})
			.catch(function(err){
				console.log('#106:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#finders-count
	 */
	it('#107: Data retrieval / Finders.\
		count - Count the occurences of elements in the database', function(cb){
		var Project = sequelize
							.define('Project107', {});
		
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([{}, {}, {}, {}, {}]);
			})
			.then(function(){
				// There is also a method for counting database objects
				return Project.count({ where: ['id > ?', 3] });
			})
			.then(function(c){
				assert.equal(c, 2);
				cb();
			})
			.catch(function(err){
				console.log('#107:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#finders-max
	 */
	it('#108: Data retrieval / Finders.\
		max - Get the greatest value of a specific attribute within a specific table', function(cb){
		var Project = sequelize
							.define('Project108', { age: Sequelize.INTEGER });
		
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([{ age: 10 }, { age: 20 }, { age: 30 }, { age: 40 }, { age: 50 }]);
			})
			.then(function(){
				// There is also a method for counting database objects
				return Project.max('age', { where: { age: { lt: 20 }}});
			})
			.then(function(max){
				assert.equal(max, 10);
				cb();
			})
			.catch(function(err){
				console.log('#108:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#finder-sum
	 */
	it('#109: Data retrieval / Finders.\
		sum - Sum the value of specific attributes', function(cb){
		var Project = sequelize
							.define('Project109', { age: Sequelize.INTEGER });
		
		Project
			.sync({ force: true })
			.then(function(){
				return Project.bulkCreate([{ age: 10 }, { age: 20 }, { age: 30 }, { age: 40 }, { age: 50 }]);
			})
			.then(function(){
				// There is also a method for counting database objects
				return Project.sum('age', { where: { age: { lt: 30 }}});
			})
			.then(function(sum){
				assert.equal(sum, 30);
				cb();
			})
			.catch(function(err){
				console.log('#109:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/docs/latest/models#eager-loading
	 */
	it('#110: Data retrieval / Finders.\
		Eager loading', function(cb){
		var User = sequelize.define('User110', { name: Sequelize.STRING })
		var Task = sequelize.define('Task110', { name: Sequelize.STRING })
		var Tool = sequelize.define('Tool110', { name: Sequelize.STRING });

		Task.belongsTo(User);
		User.hasMany(Task);
		User.hasMany(Tool, { as: 'Instruments' });
		
		User.sync()
			.then(function(){
				return [Tool.sync(), Task.sync()];
			})
			.spread(function(){
				return [User.destroy(), Task.destroy(), Tool.destroy()];
			})
			.spread(function(){
				return [
					Task.create({ name: 'Task1' })
				  ,	Task.create({ name: 'Task2' })
				  ,	Task.create({ name: 'Task3' })
				  ,	Task.create({ name: 'Task4' })
				  ,	User.create({ name: 'User1' })
				  ,	User.create({ name: 'User2' })
				  ,	User.create({ name: 'User3' })
				  ,	Tool.create({ name: 'Tool1' })
				  ,	Tool.create({ name: 'Tool2' })
				  ,	Tool.create({ name: 'Tool3' })
				];
			})
			.spread(function(	task1, task2, task3, task4,
								user1, user2, user3,
								tool1, tool2, tool3){
				return 	[
							user1.setTask110s([task1, task4])
						  ,	user2.setTask110s([task2])
						  ,	user3.setTask110s([task3])
						  ,	user1.setInstruments([tool1])
						  ,	user2.setInstruments([tool2])
						  ,	user3.setInstruments([tool3])
						];
			})
			.spread(function(){
				// OK. So, first of all, let's load all tasks with their associated user
				return Task.findAll({ include: [ User ] });
			})
			.then(function(tasks){
				assert(_.findWhere(tasks, function(elem){
					return elem.name == 'Task1' && elem.User110.name == 'User1';
				}));
				assert(_.findWhere(tasks, function(elem){
					return elem.name == 'Task2' && elem.User110.name == 'User2';
				}));
				assert(_.findWhere(tasks, function(elem){
					return elem.name == 'Task3' && elem.User110.name == 'User3';
				}));
				// Next thing: Loading of data with many-to-something associations!
				return User.findAll({ include: [ Task ] });
			})
			.then(function(users){
				assert(_.findWhere(users, function(elem){
					return 	elem.name == 'User1' &&
							_.every(elem.Task110s, function(_elem){
								return 	_elem.name == 'Task1' ||
										_elem.name == 'Task4';
							});
				}));
				assert(_.findWhere(users, function(elem){
					return elem.name == 'User2' && elem.Task110s.name == 'Task2';
				}));
				assert(_.findWhere(users, function(elem){
					return elem.name == 'User3' && elem.Task110s.name == 'Task3';
				}));
				// If an association is aliased (using theasoption), you must specify this alias when including the model
				return User.findAll({ include: [{ model: Tool, as: 'Instruments' }] });
			})
			.then(function(users){
				assert(_.findWhere(users, function(elem){
					return elem.name == 'Tool1' && elem.User110.name == 'User1';
				}));
				assert(_.findWhere(users, function(elem){
					return elem.name == 'Tool2' && elem.User110.name == 'User2';
				}));
				assert(_.findWhere(users, function(elem){
					return elem.name == 'Tool3' && elem.User110.name == 'User3';
				}));
				cb();
			})
			.catch(function(err){
				console.log('#110:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
			
	/*
	 * http://sequelizejs.com/docs/latest/models#ordered-eager-loading
	 */
	it('#111: Data retrieval / Finders.\
		Ordering Eager Loaded Associations,\
		nested eager loading', function(cb){
		
		// TODO: example for the case of many-to-many joins
		
		// The case of a one-to-many relationship

		var Company = sequelize.define('Company111', { name: Sequelize.STRING });
		var Division = sequelize.define('Division111', { name: Sequelize.STRING });
		var Department = sequelize.define('Department111', { name: Sequelize.STRING });
		
		Company.hasMany(Division);
		Division.hasMany(Department);
		Division.belongsTo(Company);
		Department.belongsTo(Division);
		
		sequelize.sync()
			//~ .then(function(){
				//~ return [Division.sync(), Department.sync()];
			//~ })
			.spread(function(){
				return [Company.destroy(), Department.destroy(), Division.destroy()];
			})
			.spread(function(){
				return [
					Company.create({ name: 'Company1' })
				  ,	Company.create({ name: 'Company2' })
				  ,	Division.create({ name: 'Division1' })
				  ,	Division.create({ name: 'Division2' })
				  ,	Division.create({ name: 'Division3' })
				  ,	Division.create({ name: 'Division4' })
				  ,	Department.create({ name: 'Department1' })
				  ,	Department.create({ name: 'Department2' })
				  ,	Department.create({ name: 'Department3' })
				  ,	Department.create({ name: 'Department4' })
				  ,	Department.create({ name: 'Department5' })
				  ,	Department.create({ name: 'Department6' })
				  ,	Department.create({ name: 'Department7' })
				  ,	Department.create({ name: 'Department8' })
				];
			})
			.spread(function(	company1, company2,
								division1, division2, division3, division4,
								department1, department2, department3, department4,
								department5, department6, department7, department8){
				return [
					company1.setDivision111s([division1, division2])
				  ,	company2.setDivision111s([division3, division4])
				  ,	division1.setDepartment111s([department1, department2])
				  ,	division2.setDepartment111s([department3, department4])
				  ,	division3.setDepartment111s([department5, department6])
				  ,	division4.setDepartment111s([department7, department8])
				];
			})
			.spread(function(){
				return Company.findAll({
					include: [ Division ],
					order: [
						[ 'name' ]
					  , [ Division, 'name', 'DESC' ]
					]
				});
			})
			.then(function(companies){
				// companiesMap will contain all fields except auxiliary ones
				var companiesMap = _.map(companies, function(elem){
					return {
						name: elem.name,
						Division111s: _.map(elem.Division111s, function(_elem){
							return { name: _elem.name };
						})
					};
				});
				// Company names are ordered by ASC, but Division names by DESC
				assert.deepEqual(companiesMap, [
					{ name: 'Company1', Division111s: [{ name: 'Division2' }, { name: 'Division1' }]},
					{ name: 'Company2', Division111s: [{ name: 'Division4' }, { name: 'Division3' }]}
				]);
				// Nested eager loading
				return Company.findAll({
					attributes: [ 'name' ],
					// Use `order` for nested associations in this form.
					// See https://github.com/sequelize/sequelize/pull/1299
					order: [ 'name', [ Division, Department, 'name' ] ],
					include: [
						{
							model: Division,
							attributes: [ 'name' ],
							// Do not use it. See https://github.com/sequelize/sequelize/pull/1299
							//order: [[ 'name' ]],
							include: [
								{
									model: Department,
									// Do not use it. See https://github.com/sequelize/sequelize/pull/1299
									//order: [[ 'name' ]],
									attributes: [ 'name' ]
								}
							]
						}
					]
				});
			})
			.then(function(companies){
				// companiesMap will contain all fields except auxiliary ones
				var companiesMap = _.map(companies, function(elem){
					return {
						name: elem.name,
						Division111s: _.map(elem.Division111s, function(_elem){
							return {
								name: _elem.name,
								Department111s: _.map(_elem.Department111s, function(__elem){
									return { name: __elem.name };
								})
							};
						})
					};
				});
				assert.deepEqual(companiesMap, [
					{
						name: 'Company1',
						Division111s: [
							{
								name: 'Division1',
								Department111s: [
									{ name: 'Department1' }
								  ,	{ name: 'Department2' }
								]
							}
						  ,	{
								name: 'Division2',
								Department111s: [
									{ name: 'Department3' }
								  ,	{ name: 'Department4' }
								]
							}
						]
					},
					{
						name: 'Company2',
						Division111s: [
							{
								name: 'Division3',
								Department111s: [
									{ name: 'Department5' }
								  ,	{ name: 'Department6' }
								]
							}
						  ,	{
								name: 'Division4',
								Department111s: [
									{ name: 'Department7' }
								  ,	{ name: 'Department8' }
								]
							}
						]
					}
				], json.plain(companiesMap));
				cb();
			})
			.catch(function(err){
				console.log('#111:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
}

