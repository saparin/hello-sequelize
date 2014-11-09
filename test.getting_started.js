/*
 * http://sequelizejs.com/articles/getting-started
 */

var Sequelize = require('sequelize')
  ,	assert = require('assert')
  ,	colors = require('colors');
  
module.exports = function(sequelize){
	
	var User;

	/*
	 * http://sequelizejs.com/articles/getting-started#connecting
	 */  
	it('#001: Connecting to the database', function(cb){
		sequelize
		  .authenticate()
		  .complete(function(err){
			  assert(!err);
			  cb();
		  });
	});
	
	/*
	 * http://sequelizejs.com/articles/getting-started#schema
	 */
	it('#002: Defining a model', function(cb){
		User = sequelize.define('User002', {
			username: Sequelize.STRING,
			password: Sequelize.STRING
		});
		assert(true);
		cb();
	});
	
	it('#003: Synchronizing the schema', function(cb){
		sequelize
			.sync({ force: true })
			.complete(function(err){
				assert(!err);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/articles/getting-started#instance
	 */
	it('#004: Creating and persisting instances', function(cb){
		var user = User.build({
			username: 'john-doe',
			password: 'i-am-so-great'
		})
		
		user.save()
			.complete(function(err){
				assert(!err);
				cb();
			});
	});
	
	/*
	 * http://sequelizejs.com/articles/getting-started#reading
	 */
	it('#005: Reading data from the database', function(cb){
		User.find({ where: { username: 'john-doe' } })
			.complete(function(err, johnDoe) {
				assert(!err);
				assert.equal(johnDoe.username, 'john-doe');
				cb();
			})
	});
	
	/*
	 * http://sequelizejs.com/articles/getting-started#associations
	 */
	it('#006: Defining associations. One to one', function(cb){
		var Source = sequelize.define('Source006', {})
		  , Target = sequelize.define('Target006', {});
	 
		Source.hasOne(Target);
		Target.belongsTo(Source);
	 
		sequelize
			.sync()
			.complete(function(err) {
				// Even if we didn't define any foreign key or something else,
				// instances of Target will have a column SourceId!
				assert(!err);
				cb();
			});
	});
	
	it('#007: Defining associations. One to many.', function(cb){
		var Source = sequelize.define('Source007', {})
		  , Target = sequelize.define('Target007', {});
	 
		Source.hasMany(Target)
		Target.belongsTo(Source)
	 
		sequelize
			.sync()
			.complete(function(err) {
				// Even if we didn't define any foreign key or something else,
				// instances of Target will have a column SourceId!
				assert(!err);
				cb();
			});
	});
	
	it('#008: Defining associations. Many to many.', function(cb){
		var Source = sequelize.define('Source008', {})
		  , Target = sequelize.define('Target008', {});
	 
		Source.hasMany(Target)
		Target.hasMany(Source)
	 
		sequelize
			.sync()
			.complete(function(err) {
				// Even if we didn't define any foreign key or something else,
				// instances of Target will have a column SourceId!
				assert(!err);
				cb();
			});
	});
	
	it('#010: Getting/Setting associations. Promise edition.', function(cb){
		var Source = sequelize.define('Source010', {})
		  , Target = sequelize.define('Target010', {});
	
		Source.hasOne(Target);
		Target.belongsTo(Source);

		sequelize
			.sync()
			.then(function(){
				return [Source.destroy(), Target.destroy()];
			})
			//~ .spread(function(){
				//~ return Target.destroy();
			//~ })
			.then(function(){
				return [Source.create({}), Target.create({})];
			})
			.spread(function(source, target){
				assert(!!source);
				assert(!!target);
				
				return [source, source.setTarget010(target)];
			})
			.spread(function(source){
				return [source, source.getTarget010()];
			})
			.spread(function(source, target){
				assert.equal(target.values.Source010Id, source.values.id);
				cb();
			})
			.catch(function(err){
				console.log('#010:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
	
	it('#011: Adding / removing associations. Promise edition.', function(cb){
		var Source = sequelize.define('Source011', {})
		  ,	Target = sequelize.define('Target011', {});
		  
		Source.hasMany(Target);
		Target.belongsTo(Source);
		
		Source
			.sync()
			.then(function(){
				return [Source.destroy(), Target.sync()];
			})
			.spread(function(){
				return Target.destroy();
			})
			.then(function(){
				return [Source.create({}), Target.create({}), Target.create({})];
			})
			.spread(function(source, target1, target2){
				return [source, source.setTarget011s([target1, target2])];
			})
			.spread(function(source){
				return [source, source.getTarget011s()];
			})
			.spread(function(source, targets){
				assert.equal(targets.length, 2);
				return [source, targets[0], source.removeTarget011(targets[0])];
			})
			.spread(function(source, target1){
				return [source, target1, source.hasTarget011(target1), source.getTarget011s()];
			})
			.spread(function(source, target1, hasTarget1, targets){
				assert.equal(targets.length, 1);
				assert(!hasTarget1);
				return [source, target1, source.addTarget011(target1)];
			})
			.spread(function(source, target1){
				return [source, target1, source.hasTarget011(target1), source.getTarget011s()];
			})
			.spread(function(source, target1, hasTarget1, targets){
				assert(hasTarget1);
				assert.equal(targets.length, 2);
				cb();
			})
			.catch(function(err){
				console.log('#011:'.bold, err.message.bold);
				assert(false);
				cb();
			});
	});
}

