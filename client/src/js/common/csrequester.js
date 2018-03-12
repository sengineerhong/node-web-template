//import Dexie from '../../../node_modules/dexie/dist/dexie.min.js';
/*!
 * CSRequester.js
 *
 * For indexedDB request
 * Request data from client storage(indexedDB) or Server(ajax) 
 *
 * @author			hong
 * @version			0.5.0
 * @dependencies	dexie.js, logger.min.js
 * 
 */
(function(global) {


	//"use strict";
	
	// Top level module, static requester instance
	var CSRequester = {};
	
	// Version
	CSRequester.VERSION = "0.0.1";
	
	CSRequester.ERROR = 
	{
		TYPE1 : {code : "001", msg : "db connection error"}
			
			
	}

	// Map of constCSRequester instances by dbName. use by CSRequester.get(dbName) to return instance.
	var ConstCSRequesterByNameMap = {};
	
	// Inner class which performs the bulk of the work. 
	// ConstCSRequester instances can be configured independently of each other.
	var ConstCSRequester = function(defaultContext) {
		this.context = defaultContext;
		//this.setLevel(defaultContext.filterLevel);
	};

	
	
	// The operations will be pending until open() completes.
	// forget close() method! hu~
	function openIndexedDB(schema, dbName){
		
		var db = new Dexie(dbName);
		var tables = cloneExceptObj(schema, "version");
		Logger.debug("[dev]","tables:"+ JSON.stringify(tables));
		Logger.debug("[dev]","schema:"+ JSON.stringify(schema));
		db.version(schema.version).stores(tables);
		
		return db;
	}
	
	ConstCSRequester.prototype = {
			
			setHandler : function(func) {
				if (typeof func === "function") {
					this.context.customHandler = func;					
				}
			},
			
			setSchema : function(schema) {
				if (schema.version) {
					this.context.schema = schema;
				}
			},
			
//			setForceUpdate : function(isUpdate) {
//				if (typeof isUpdate === "boolean") {
//					this.context.forceUpdate = isUpdate;
//				}
//			},
			
			getDbName : function() {
				return this.context.dbName;
			},
			
			request : function(reqOpt, callback) {
				
				this.init();
				this.context.isOpen = this.context.db.isOpen();

				if (reqOpt) {
					this.context.reqOpt = reqOpt;
					this.invoke(callback);
				} else {
					callback.error(genCallbackArgs("400", "[CSRequester] check request options"));
				}
			},
			
			init : function() {
				if (this.context.dbName) {
					return this.context.db = openIndexedDB(this.context.schema, this.context.dbName);
				}
			},
			
			invoke : function(callback) {
				//Logger.debug("[dev]","this.context.customHandler:"+ this.context.customHandler);
				if (this.context.customHandler) {
					this.context.customHandler(this.context, callback);
				}		
			}
	};
	
	// global CSRequest object
	var globalCSRequester = new ConstCSRequester(
		
		{ 
			schema: {},
//			forceUpdate: false,
			customHandler: function (){},
		}
		
	);
	
	// initialize CSRequester. can set some options.
	CSRequester.initialize = function (options){
		
//		CSRequester.setForceUpdate(options && options.forceUpdate || false);
		
		CSRequester.setSchema(options && options.schema || CSRequester.defaultSchema);
		
		// if you want use customHandler? create customHandler like this
		// CSRequester.get("dbName").setHandler(function (context, resCB));
		// TODO : CSRequester.defaultSchemaHandler(options)) replace or delete options argument
		CSRequester.setHandler(options && options.handler || CSRequester.defaultSchemaHandler(options));			
	}
	
	CSRequester.setHandler = function (func) {
		
		globalCSRequester.setHandler(func);
		
		// Apply this condition to all registered construction requester.
		for (var key in ConstCSRequesterByNameMap) {
			if (ConstCSRequesterByNameMap.hasOwnProperty(key)) {
				ConstCSRequesterByNameMap[key].setHandler(func);
			}
		}
	};
	
	CSRequester.setValidDbNames= function (dbNames){
		// TODO : db name validation
	}
	
	CSRequester.get = function (dbName) {
		// TODO : db name validation (by setValidDbNames)
		return ConstCSRequesterByNameMap[dbName] ||
			(ConstCSRequesterByNameMap[dbName] = new ConstCSRequester(merge({ dbName: dbName }, globalCSRequester.context)));
	};
	
//	CSRequester.setForceUpdate = function(isUpdate) {
//		
//		globalCSRequester.setForceUpdate(isUpdate);
//
//		// Apply this condition to all registered construction requester.
//		for (var key in ConstCSRequesterByNameMap) {
//			if (ConstCSRequesterByNameMap.hasOwnProperty(key)) {
//				ConstCSRequesterByNameMap[key].setForceUpdate(isUpdate);
//			}
//		}
//	};
	
	CSRequester.setSchema = function (schema){
		
		globalCSRequester.setSchema(schema);

		// Apply this condition to all registered construction requester.
		for (var key in ConstCSRequesterByNameMap) {
			if (ConstCSRequesterByNameMap.hasOwnProperty(key)) {
				ConstCSRequesterByNameMap[key].setSchema(schema);
			}
		}
	};

	// function merge
	var merge = function () {
		var args = arguments, target = args[0], key, i;
		for (i = 1; i < args.length; i++) {
			for (key in args[i]) {
				if (!(key in target) && args[i].hasOwnProperty(key)) {
					target[key] = args[i][key];
				}
			}
		}
		return target;
	};
	
	// function clone object except specific key
	function cloneExceptObj(obj, keys) { 
		var target = {}; 
		for (var i in obj) { 
			if (keys.indexOf(i) >= 0) continue; 
			if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; 
			target[i] = obj[i]; 
		} 
		return target; 
	}
	

	//
	function genCallbackArgs(status, msg) {
		return {status: status, result: msg};
	}

// default setting ------------------------------------------------------------------------------------------------------------------- */
// if you have own default schema, you must change defaultSchema but...
// also, CSRequester instances can be configured independently. (set customSchema or customHandler).
	
	/**
	 * dateRage : day, week, month
	 * date : 20170801, 201708W1, 201708MM 
	 */
	// default schema
	// add pageNum to resTab index? for one-day && too large data 
	CSRequester.defaultSchema = {
		
		version 	: 1,																	// db version
		infoTab 	: "++infoSeq, date, qOpt, dateRage, doneYn, infoCompact",				// info table 
		resTab 		: "++DataSeq, infoSeq"													// resource table
			
	}
	
	// default schema handler
	CSRequester.defaultSchemaHandler = function (options){
			
		// can set options
		options = options || {};
	
		return function(context, callback){
			
			// indexedDB object
			var db = context.db;
			
			// request options. 
			var reqOpt = context.reqOpt;
			
			/**
			 * @type boolean 
			 * @name byPass
			 * @default false
			 * 
			 * CSRequester를 사용하지 않음. 보통의 ajax request 호출 이용. 
			 */
			var byPass = reqOpt.byPass == undefined ? false : reqOpt.byPass;
			
			/**
			 * @type boolean 
			 * @name useSafeMode
			 * @default true
			 * 
			 * callback function 호출시 자제척으로 response의 순서를 보정함. (keep the order by date)
			 */
			var useSafeMode = reqOpt.useSafeMode == undefined ? true : reqOpt.useSafeMode;
			
			/**
			 * @type array 
			 * @name forceUpdate
			 * @default []
			 * 
			 * 반드시 강제적으로 업데이트되어야 하는 데이터의 date 값. (force update date array)
			 */
			var forceUpdate = Array.isArray(reqOpt.forceUpdate) ? reqOpt.forceUpdate : [];
			
			/* TODO : add support option */
			/**
			 * @type string 
			 * @name forceUpdate
			 * @default all
			 * @support each, all, auto
			 * 
			 * 반드시 강제적으로 업데이트되어야 하는 데이터의 date 값. (force update date array)
			 */
			var serverReqSplitLevel = reqOpt.serverReqSplitLevel == undefined ? "all" : reqOpt.serverReqSplitLevel;
			
			// start CSRequester request!
			if (byPass) {
				
				Logger.debug("[dev]", "normalReqProcess:"+JSON.stringify(reqOpt));
				
				var param = $.extend({
					
					isDev: reqOpt.isDev
					
		        }, reqOpt );
				
    			$.ajax({
    				
    				type: "post",
 					url : reqOpt.url,
 					//contentType: "application/json;charset=UTF-8",		// check spring settings
 					dataType : "json",
 					data     : $.param(param),
 					success: function(resData)
 					{
 						
 						//Logger.debug("[dev]","normalReqProcess ajax resData:"+ JSON.stringify(resData));
 						
 						// for [callback.partial(allResMap)]
 						var resMap = new Map();
 						resMap.set("all", resData);
						callback.complete(resMap);
 					},
 					error: function (jqXHR, exception) {
						var msg = '';
						if (jqXHR.status === 0) {
						    msg = 'Not connect.\n Verify Network.';
						} else if (jqXHR.status == 404) {
						    msg = 'Requested page not found. [404]';
						} else if (jqXHR.status == 500) {
						    msg = 'Internal Server Error [500].';
//						} else if (exception === 'parsererror') {
//						msg = 'Requested JSON parse failed.';
						} else if (exception === 'parsererror') {
							msg = 'session time out! Please, Login.';
						} else if (exception === 'timeout') {
						msg = 'Time out error.';
						} else if (exception === 'abort') {
						msg = 'Ajax request aborted.';
						} else {
						    msg = 'Uncaught Error.\n' + jqXHR.responseText;
						}
						callback.error(msg)
 				    }
 				});	
				//normalReqProcess(reqOpt);
				
			} else {
				
				// get all date(array)
				var allDate = calculateDateRange(reqOpt.strDate, reqOpt.endDate, reqOpt.dateRage);
				var progressCnt = 0;
				
				
				// CSRequester status & options 
				// TODO : use map? for performance?
				// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
				// {"20170801":0,"20170802":0,"20170803":0,"20170804":0,"20170805":0}
				var statusMap = new Map();
				
				// set default status 0
				allDate.forEach(function (date) { 
					// changeStatus(statusMap, date, 0);
					statusMap.set(date, 0);
				});
				
				// all response use [callback.partial(result)] function
				// {"20170801":{..result object...},"20170802":{..result object...},"20170803":{..result object...},"20170804":{..result object...},"20170805":{..result object...}}
				var tmpResMap = new Map();
				
				// for [callback.partial(allResMap)]
				var allResMap = new Map();
				
				doReqPreProcess(reqOpt, db)
				.then(function (reqOpt) {
					return byPassData(reqOpt);
					
				})
				.then(reqProcess)
				.catch(function (e) {	
					Logger.error("[rel]", "main promise:"+e);
					//callback.error(genCallbackArgs(status, "[CSRequester] check request status"));
				}).finally (function() {
					//callback.complete(genCallbackArgs(status, "[CSRequester] request complete"));
				});
			
				
				// status code
				// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
				function changeStatus(map, date, status) {
					
					map.set(date, status);
					
					var str = ""; map.forEach(function(v, k) { str += "["+k+":"+v+"]"; });
					Logger.debug("[dev]","changeStatus :"+ str);
					
				}
				

				// [callback.partial] process
				function doPartialCallback(useSafeMode, resResult) {
					
					// [LOGGER-DEV]
					//Logger.debug("[dev]","useSafeMode :"+ useSafeMode);
					
					if (useSafeMode) {
						
						// 1. put response(local storage or ajax response) Data to tmpResMap
						// resResult = info data + res data
						tmpResMap.set(resResult.date, resResult);
						allResMap.set(resResult.date, resResult);
						
						// [LOGGER-DEV]
						var str = ""; tmpResMap.forEach(function(v, k) { str += "["+k+":object]"; });
						Logger.debug("[dev]","tmpResMap :"+ str);
						
						
						// 2. change status = 2
						// you must call this function after tmpResMap.set(resResult.date, resResult);
						// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
						changeStatus(statusMap, resResult.date, 2);
						
						// 3. approval validation(use statusMap & allDate)
						tmpResMap.forEach(function(value, key) {
							
							var isGoOn = true;
							var idx = allDate.indexOf(key);
							var checkArry = allDate.slice(0, idx); 
							
							// [LOGGER-DEV]
							Logger.debug("[dev]","checkArry :"+ checkArry);
							
							// tmpResMap 에 포함된 데이터 중 [callback.partial] 이 가능한 데이터 판별을 위한 변수 
							var validLength = 0;
							
							for (var i = 0; i < checkArry.length; i++) {

								// checkArry 에 포함된 date 들 각각의 status code
								var eachStatus = statusMap.get(checkArry[i]);
								
								// checkArry 에 기록된 각각의 날짜의 상태코드를 가져와서 2보다 작은 상태 코드의 날짜를 포함한 경우 false 
								if (eachStatus < 2) isGoOn =  false;
								
								// tmpResMap 에 포함된 데이터 중 [callback.partial] 이 가능한 데이터 판별
								if (eachStatus >= 2) validLength++;
							}
							
							// [LOGGER-DEV]
							Logger.debug("[dev]","isGoOn :"+ isGoOn);
							Logger.debug("[dev]","checkArry.length :"+ checkArry.length);
							Logger.debug("[dev]","validLength :"+ validLength);
							
							// tmpResMap 에 포함된 데이터 중 [callback.partial] 이 가능한 데이터 판별
							if (isGoOn && checkArry.length == validLength) {
								
								checkArry.forEach(function (date) {
									
									if (tmpResMap.get(date) != undefined) {

										callback.partial( genProgressData(tmpResMap.get(date)) );
										// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
										changeStatus(statusMap, date, 3);
										tmpResMap.delete(date);
									}
								});
								
//								tmpResMap.get(key) = resResult = 
//								{
//									"data":[{"ENTR_TP_NM":"MD", "SELLING_PRD_CNT_TP":46514, "ORD_CNT_S":0, ...}, {...}],
//									"infoSeq":3,
//									"date":"20170803",
//									"qOpt":"1",
//									"dateRage":"day",
//									"doneYn":"n",
//									"infoCompact":"20170803|1|day"
//								}
								
								callback.partial( genProgressData(tmpResMap.get(key)) );
								// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
								changeStatus(statusMap, key, 3);
								tmpResMap.delete(key);
							
							} else if (isGoOn) {
								
								callback.partial( genProgressData(tmpResMap.get(key)) );
								// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
								changeStatus(statusMap, key, 3);
								tmpResMap.delete(key);
							}
						});
						
					} else {
						
						// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
						changeStatus(statusMap, resResult.date, 2);
						callback.partial( genProgressData(resResult) );
						// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
						changeStatus(statusMap, resResult.date, 3);
					}
					
					// for [callback.complete(allResMap)];
					if (statusMap.get(allDate[allDate.length-1]) >= 3) {
						
						callback.complete(allResMap);
					}
				}
				
				
				// for progress 
				// add object progress = {"progress" : "1/5"}
				function genProgressData(partialResult) {
					
					progressCnt++;
					var progress = progressCnt+"/"+allDate.length;
					var finalResult = partialResult;
					finalResult.progress = progress

					return finalResult;
				}
				
				
				function updateInfoDoneYnByInfoSeq(infoSeq, falg) {
					// update infoTab flag (doneYn = y or n or c)
					return db.infoTab.update(infoSeq, { doneYn: falg}).then(function (updated){
						Logger.debug("[dev]","updateInfoDoneYnByInfoSeq updated :"+ updated);
					}).catch(function (e){
						Logger.error("[rel]", "updateInfoDoneYnByInfoSeq:"+e);
						throw e;
					});
				}
				
				function deleteResByInfoSeq(infoSeq) {
					// update infoTab flag (doneYn = y or n or c)
					return db.resTab.delete(infoSeq).catch(function (e){
						Logger.error("[rel]", "deleteResByInfoSeq:"+e);
						throw e;
					});
				}
				
				function getInfosByInfoSeq(infoSeq) {
					
					return db.infoTab.where("infoSeq").equals(infoSeq).last().catch(function (e){
						Logger.error("[rel]", "getInfosByInfoSeq:"+e);
						throw e;
					});
				}
				
				/** 
				 * get informations from infoTab by date(strDate, endDate)
				 * 
				 * [{"date":"20170801","qOpt":"1","dateRage":"day","doneYn":"y","infoCompact":"20170801|1|day","infoSeq":1}
				 * ,{"date":"20170802","qOpt":"1","dateRage":"day","doneYn":"y","infoCompact":"20170802|1|day","infoSeq":2}]
				 * 
				 * @param			{string} 	strDate
				 * @param			{string} 	endDate
				 * @return			{function} 	promise
				 * @throws			{object}	getInfosByDate error
				 */
				function getInfosByDate(strDate, endDate) {
					
					return db.infoTab.where("date").between(strDate, endDate, true, true).sortBy("date").catch(function (e){
						Logger.error("[rel]", "getInfosByDate:"+e);
						throw e;
					});
				}
				
				/**
				 * get resources from resTab by infoSeq and partial result callback.
				 * 
				 * [{"infoSeq":1,"data":"{"COL_11":"0","COL_10":"0","COL_02":"AK플라자".....}"]
				 *  
				 * @param			{string} 	strDate
				 * @param			{string} 	endDate
				 * @return			{function} 	promise
				 * @throws			{object}	getResDataByInfoSeqAndPartialCB error
				 */
				function getResDataByInfoSeqAndPartialCB(info) {
					
					
					return db.resTab.where("infoSeq").equals(info.infoSeq).toArray().then(function (resData){
						
						if (resData) {
							
							// [callback.partial]
							
							var dataArry = [];
								
							resData.forEach(function(obj) {
	                    		
								dataArry.push(JSON.parse(obj.data));
	                    	});
	                    	
		                    	//Logger.debug("[dev]","dataSource load dataArry:"+JSON.stringify(dataArry));
							
							info.data = dataArry;
								
							doPartialCallback(useSafeMode, info);
							
						} else {
							// TODO : if resource data == null ? next logic?
							// or set doneYn = n ? -
							callback.error("resource data is null:"+JSON.stringify(info));
						}
						
					}).catch(function (e){
						Logger.error("[rel]", "getResDataByInfoSeqAndPartialCB:"+e);
						throw e;
					});
				}
				
				function putInfoByReqOpt(info) {
					
					return db.infoTab.put(info).catch(function (e){
						Logger.error("[rel]", "putInfoByReqOpt:"+e);
						throw e;
					});
				}
				
				
				function byPassData(data){
					return data;
				}
				
				
				
				/**
				 * pre-process before request to server
				 * 
				 * @param			{object} 	reqOpt
				 * @param			{object} 	db
				 * @return			{function} 	promise
				 * @throws			{object}	doReqPreProcess error
				 */
				function doReqPreProcess(reqOpt, db){
					
					// transaction 
					return db.transaction('rw', db.resTab, db.infoTab, function () {
						
						// exist info data array
						var existInfoDate = [];
						var noneExistResInfoSeq = {};
						
						Logger.debug("[dev]","doReqPreProcess reqOpt :"+ JSON.stringify(reqOpt));
						
						// get infos by startDate & endDate
						return getInfosByDate(reqOpt.strDate, reqOpt.endDate)
								.then(function (infos) {
									
									Logger.debug("[dev]","getInfosByDate infos :"+ JSON.stringify(infos));
									
									// if local storage have data, call [callback.partial] function
									infos.forEach(function (info) {
							    		
										// check dateRage and query option
							    		if (info.dateRage == reqOpt.dateRage && info.qOpt == reqOpt.qOpt) {
							    			
//							    			infoTab 	: "++infoSeq, date, qOpt, dateRage, doneYn, infoCompact",				// info table 
//							    			resTab 		: "++DataSeq, infoSeq"													// resource table
							    			for (var i = 0; i < forceUpdate.length; i++) {
							    				
							    				if (info.date == forceUpdate[i]) {
							    					
							    					// update infoTab flag (doneYn = c)
							    					updateInfoDoneYnByInfoSeq(parseInt(info.infoSeq), "c");
							    					// set info.doneYn = "c";
							    					info.doneYn = "c";
							    					// delete resTab
							    					deleteResByInfoSeq(parseInt(info.infoSeq));
							    					break;
							    				}
							    			}
											
							    			if (info.doneYn == "y") {

							    				// for filtering(exist infoData)
							    				existInfoDate.push(info.date);
							    				
							    				// get res data from local storage and call [callback.partial] function
							    				getResDataByInfoSeqAndPartialCB(info);
							    				
											} else {
												
												noneExistResInfoSeq[info.date.toString()] = info.infoSeq;
											}
										}
										
									});
									
									Logger.debug("[dev]","noneExistResInfoSeq :"+ JSON.stringify(noneExistResInfoSeq));
									
									
									
								}).then(function () {
									
									// filtering
									allDate.filter(function(eachDate) {
							    		
										// not exist
							    		if (existInfoDate.indexOf(eachDate) == -1) {
							    			Logger.debug("[dev]", "not exist:"+ eachDate);
							    			// TODO : if already have data ? update : insert
							    			var info = {
						    					date: eachDate, qOpt: reqOpt.qOpt , dateRage: reqOpt.dateRage , doneYn: "n", infoCompact: eachDate+"|"+reqOpt.qOpt+"|"+reqOpt.dateRage	
							    			}
							    			
							    			if (noneExistResInfoSeq[eachDate]) {
												info.infoSeq = parseInt(noneExistResInfoSeq[eachDate]);
											}
							    			Logger.debug("[dev]", "noneExistResInfoSeq[eachDate]:"+ noneExistResInfoSeq[eachDate]);
							    			Logger.debug("[dev]", "parseInt(noneExistResInfoSeq[eachDate]):"+ parseInt(noneExistResInfoSeq[eachDate]));
							    			putInfoByReqOpt(info);
										}
							    	});
									
									Logger.debug("[dev]","allDate :"+ allDate);
									Logger.debug("[dev]","existInfoDate :"+ existInfoDate);
									
									return byPassData(reqOpt);
									
								}).catch(function (e){
									// TODO : error message
									Logger.error("[rel]", "doReqPreProcess:"+e);
									throw e;
								});
						
					}).then(function (reqOpt) {
						return byPassData(reqOpt);
						
					}).catch(function (e){
						Logger.error("[rel]", "doReqPreProcess:"+e);
						throw e;
					});
					
				}
				
				// TODO : if local storage has all-data ? return..?
				function reqProcess (reqOpt){
					
					Logger.debug("[dev]", "reqProcess:"+JSON.stringify(reqOpt));

					// infoTab	 	: "++infoSeq, date, qOpt, dateRage, doneYn, infoCompact",				// info table 
					// resTab 		: "++DataSeq, infoSeq"													// resource table
					return getInfosByDate(reqOpt.strDate, reqOpt.endDate).then(function (infos) {
						
						Logger.debug("[dev]","infos sortBy:"+ JSON.stringify(infos));
						
						// TODO : check server request split level  
						
						
						
						infos.forEach(function (info) {
							//Logger.debug("[dev]","infos.forEach:"+ JSON.stringify(info));
				    		if (info.dateRage == reqOpt.dateRage && info.qOpt == reqOpt.qOpt && info.doneYn != "y") {
				    			
				    			var param =
				    			{
				    					strDate : info.date,
				    					endDate : info.date,
				    					qOpt : info.qOpt,
				    					infoSeq : info.infoSeq,
				    					isDev: reqOpt.isDev
				    			};
				    			
				    			$.ajax({
				    				
				    				type: "post",
				 					url : reqOpt.url,
				 					//contentType: "application/json;charset=UTF-8",		// check spring settings
				 					dataType : "json",
				 					data     : $.param(param),
				 					success: function(resData, textStatus, jqXHR)
				 					{
				 						
				 						Logger.debug("[dev]","reqResData1 ajax resData:"+ JSON.stringify(resData));

				 						// [callback.partial]
										doPartialCallback(useSafeMode, $.extend(resData, info));
										
				 						//Logger.debug("[dev]","reqResData1 ajax data:"+ JSON.stringify(resData));
				 						putResData1 (resData)
				 						
				 					}
				 				});		
				    			 
				    			// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
								changeStatus(statusMap, info.date, 1);
							}
			    		});
						
						
					});
					
				}
				
				
				
				// insert(put) resTab data
				function putResData1 (res){
					return db.transaction('rw', db.resTab, db.infoTab, function () {
						
						// check other request (ex> use two or more browsers)
						return getInfosByInfoSeq(parseInt(res.infoSeq)).then(function (info){ 
							
							var doneYn = info.doneYn;
							var data = res.data;
							Logger.debug("[dev]","putResData1 doneYn:"+doneYn);
							
							if (doneYn != 'y' && data && data.length > 1 ) {
								
								// put resTab data
								res.data.forEach(function (item) {
									//Logger.debug("[dev]","Adding object: " + JSON.stringify(item));
									db.resTab.put({ infoSeq: Number(res.infoSeq), data: JSON.stringify(item) });
								});
								// update infoTab flag (doneYn=y)
								db.infoTab.update(parseInt(res.infoSeq), { doneYn: "y"})
								.then(function (isOk){ 
									//Logger.debug("[dev]","isOk:"+isOk); 
								});
							}
						});
						
					}).then(function(){	
						
						// 0:default, 1:reqEnd, 2:resEnd, 3:callbackEnd, 4:saveEnd 
						changeStatus(statusMap, res.date, 4);
						// fake data
						//return getResData(res.reqOpt.infoSeq);	
					}).catch(function (e){
						Logger.error("[rel]", "resTab insert(resData) & infoTab update(infoCompact) query promise:"+e);
					});;
					
				}

			}
			
			

			
			/**
			 * @param			start, end, options(format, dateType)
			 * @dependencies	moment.js, twix.js
			 * 
			 */
			function calculateDateRange(start, end, dateRage) {
				
				var options = getDateRangeOptions(dateRage);
				var dateItr = moment(start, options.format).twix(end, options.format).iterate(options.iterate);
				var allDate = [];
				while(dateItr.hasNext()){
					allDate.push(dateItr.next().format(options.format));
				}
				
				return allDate;
			}
			
			/**
			 * @param			dateRage
			 * @return			options(format, iterateType)
			 */
			function getDateRangeOptions(dateRage) {
				
				var options = {};
				switch (dateRage) {
					
				    case "day":
				    	options.format = "YYYYMMDD";
				    	options.iterate = "days";
				        break;
				        
				    default:
				    	
				        break;
				}
				Logger.debug("[dev]","getIterateTypeForDateRange :"+ dateRage);
				
				return options;
			}
			
			
			
			
			
/*			
			// v0.1.0 : request only one-date(day)
			getReqOptionFromInfoTab(context.reqOpt, db)
				.then(seperateReqEvent)
				.then(function (result){
					status = 200;
					callback.success(genCallbackArgs(status, result));
				})
				.catch(function (e) {	
					Logger.error("[rel]", "getReqOptionFromInfoTab promise:"+e);
					status = 400;
					callback.error(genCallbackArgs(status, "[CSRequester] check request status"));
				}).finally (function() {
					callback.complete(genCallbackArgs(status, "[CSRequester] request complete"));
				});
				
			function addArg(lowData, addName, addData){
				Logger.debug("[dev]","addName:"+ JSON.stringify(addName));
				Logger.debug("[dev]","addData:"+ JSON.stringify(addData));
				lowData[addName.toString()] = addData;
				
				return lowData;
			}
			
			// insert infoTab data before get-server-data request
			function putInfoData(lowData){
				
				if (lowData.info) {					
					// TODO : fix logic - function call
					return db.infoTab.where("infoCompact").equalsIgnoreCase(lowData.info.date+"|"+lowData.info.qOpt+"|"+lowData.info.dateRage).last(function (upInfo) {
						Logger.debug("[dev]","info5:"+ JSON.stringify(upInfo));	
						return makeReqOption(lowData);	
					});
					
				} else {
					
					return db.infoTab.put({ date: lowData.reqOpt.date, qOpt: lowData.reqOpt.qOpt, dateRage: lowData.reqOpt.dateRage, doneYn: "n", infoCompact: lowData.reqOpt.date+"|"+lowData.reqOpt.qOpt+"|"+lowData.reqOpt.dateRage })
					.then(function () {
						db.infoTab.where("infoCompact").equalsIgnoreCase(lowData.reqOpt.date+"|"+lowData.reqOpt.qOpt+"|"+lowData.reqOpt.dateRage).last(function (upInfo) {
							Logger.debug("[dev]","info4:"+ JSON.stringify(upInfo));	
							return makeReqOption(lowData);	
						}).catch(function (e) {
							Logger.error("[rel]", "infoTab select(infoCompact) query promise:"+e);
							throw e;
			        	});
					}).catch(function (e) {
						Logger.error("[rel]", "infoTab insert(infoCompact) query promise:"+e);
						throw e;
		        	});
				}
			}
			
			// set request option
			function makeReqOption (info){
				
				var reqOpt = {"infoCompact":info.infoCompact};
				return info;
			}
			
			// requeset get-server-data 
			function reqResData (reqOpt){
				
				return $.ajax({
					//url : "/isis/resources/data/dailySellerList_maxForDeve_indexedDB.json",
					url : "/isis/resources/data/dailyseller/dailySellerList_day_20170803.json",
					dataType : "json",    
				});	
			}
			
			
			// insert(put) resTab data
			function putResData (res){
				return db.transaction('rw', db.resTab, db.infoTab, function () {
					
					Logger.debug("[dev]","res.status:"+res.status);
					Logger.debug("[dev]","res.reqOpt.infoSeq:"+res.reqOpt.infoSeq);
					Logger.debug("[dev]","res.data[0]:"+res.data[0]);
					// put resTab data
					res.data.forEach(function (item) {
		                   //Logger.debug("[dev]","Adding object: " + JSON.stringify(item));
		                   db.resTab.put({ infoSeq: res.reqOpt.infoSeq, data: JSON.stringify(item) });
		            });
					// update infoTab flag (doneYn=y)
					db.infoTab.update(parseInt(res.reqOpt.infoSeq), { doneYn: "y"}).then(function (isOk){ Logger.debug("[dev]","isOk:"+isOk); });
				}).then(function(){	
					// fake data
					return getResData(res.reqOpt.infoSeq);	
				}).catch(function (e){
					Logger.error("[rel]", "resTab insert(resData) & infoTab update(infoCompact) query promise:"+e);
				});;
				
			}
			
			function getResData(infoSeq){
				// where infoIdx		
				return db.resTab.where("infoSeq").equals(infoSeq).toArray().then(function (resData){
					//Logger.debug("[dev]","res1:"+ JSON.stringify(resData));
					Logger.debug("[dev]","isOk2"); 
					return resData;
				});
				
			}
			
			// get-server-data or get-client-data 
			function seperateReqEvent(lowData){		
				Logger.debug("[dev]","info2:"+ JSON.stringify(lowData.info));
				
				if (!lowData.info || lowData.info.doneYn == "n") {
					
					Logger.error("[here1]");
					// get-server-data promise process
					return putInfoData(lowData)
						.then(reqResData)
						.then(putResData)
						.catch(function (e) {
							Logger.error("[rel]", "putInfoData promise:"+e);
							throw e;
			        	});
				} else {
					Logger.error("[here2]");
					// select exist data from get-client-data(indexedDB)
					return getResData(lowData.info.infoSeq);	
				}
			}
			
			// populate data transaction
			function getReqOptionFromInfoTab(reqOpt, db){
				// 
				var lowData = {};
				addArg(lowData, "reqOpt", reqOpt);
				// get infoTab data where event options
				return db.infoTab.where("infoCompact").equalsIgnoreCase(reqOpt.date+"|"+reqOpt.qOpt+"|"+reqOpt.dateRage).last(function (info){
					Logger.debug("[dev]","info1:"+ JSON.stringify(info));
					return addArg(lowData, "info", info);
					// check data exist
					//return seperateReqEvent(reqOpt, info);
				}).catch(function (e){
					Logger.error("[rel]", "get infoTab data promise:"+e);
					throw e;
				});
			}
*/			
	        	
		}
	}
	
// default setting ------------------------------------------------------------------------------------------------------------------- */
	
	// Export to popular environments boilerplate.
	if (typeof define === 'function' && define.amd) {
		define(CSRequester);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = CSRequester;
	} else {
		CSRequester._prevLogger = global.CSRequester;

		CSRequester.noConflict = function() {
			global.CSRequester = CSRequester._prevLogger;
			return CSRequester;
		};

		global.CSRequester = CSRequester;
	}
}(this));
