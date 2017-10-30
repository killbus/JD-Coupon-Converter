(function() {
	$(function() {
		var generate, input, output, c, key, roleid, to, platform, short_urls, warning_body, qrinit, debug;
		output = $("#output");
		input = $("#input");
		generate = $("#generate");
		warning_body = $(".modal-body");
		debug = $('#debug');
		short_urls = {};
		qrinit = false;
		
		var request = {
			QueryString : function(uri, val)
			{
				//var uri = input.val();
				var re = new RegExp("" +val+ "=([^&?]*)", "ig");
				return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null);
			},
			isUrlValid: function(url)
			{
				return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
			},
			urlParser: function(url)
			{
				var el = document.createElement('a');
				el.href = url;
				return el;
			}
		};
		var jingdong = {
			'skuFormater': function(obj) {
				var skuid = obj.val();
				var skus = [];
				if (!obj.val()) {
					Tip.focus(obj, "请补充内容！", "bottom");
					return false;
				}
				if (parseInt(skuid) == skuid - 0) {
					skuid = parseInt(skuid);
					skus.push(skuid);
				} else {
					var addons = obj.val().split(',').filter(function(n){ return n != ''});
					var len = addons.length;
					$.each(addons, function(k, v) {
						var url = v;
						el = request.urlParser(url);
						var path_arr = el.pathname.split('/');
						var skuid = path_arr[path_arr.length-1].split('.')[0];
						if (parseInt(skuid) == skuid - 0) {
							skuid = parseInt(skuid);
						} else {
							skuid = request.QueryString(url, 'sku');
							skuid = parseInt(skuid) == skuid - 0 ? skuid : request.QueryString(url, 'wareId');
							skuid = parseInt(skuid) == skuid - 0 ? skuid : '';
						}
						skus.push(skuid);
					});
				}
				return skus.filter(function(n) { return n != ''});
			},
			'getCoupon': function(skuid, dfd) {
				$.ajax({
					url: 'https://json2jsonp.com/?url=' + encodeURIComponent('https://item.m.jd.com/coupon/coupon.json?wareId=' + skuid)+'&callback=',
					dataType: 'jsonp',
					timeout: 5000,
					success: function(data) {
						dfd.resolve(data);
					},
					error: function(xhr) {
						dfd.reject(xhr);
					}
				});
			}
		};

		generate.on("click", function(event) {
			if (c == input.val()){
				return false;
			}
			generate.button('loading');
			qrinit = false;
			$('#qrcode').html('');
			output.val('');
			debug.val('');
			var skuid = jingdong.skuFormater(input)[0];
			if (parseInt(skuid) == skuid - 0) {
				var getCouponAjaxDfd = $.Deferred();
				jingdong.getCoupon(skuid, getCouponAjaxDfd);
				$.when(getCouponAjaxDfd).then(function(data) {
					if (Object.keys(data).length < 1) {
						warning_body.html('没有找到优惠券信息！');
						$('.warning').modal();
						generate.button('reset');
						return false;
					}
					console.log(data);
					var coupon = data.coupon;
					debug.val(!debug.val() ? skuid + ': ' + data.coupon : debug.val() + '\n' + skuid + ': ' + JSON.stringify(data.coupon));
					$.each(coupon, function(k, v) {
						var c = 'http://coupon.m.jd.com/coupons/show.action?key=' + v.encryptedKey + '&roleId=' + v.roleId + '&to=jd.com#batchId=' + v.batchId;
						input.val(k == 0 ? c : input.val() + '\n' + c);
					});
					init();
				}, function(xhr) {
					warning_body.html('调用京东API获取优惠券数据失败！');
					$('.warning').modal();
					generate.button('reset');
					return xhr.reject().promise();
				});
			} else {
				init();
			}
			
			function init() {
				var urls = input.val().split('\n').filter(function(n) { return n != ''});
				$.each(urls, function(n, url) {
					if (url.indexOf('btmkt.jd.com') >= 0) {
						key = request.QueryString(url, 'key');
						if (!key) {
							warning_body.html('key 不能为空，请检查。');
							$('.warning').modal();
							return;
						}
						platform = {'pc':'https://btmkt.jd.com/activity/initParty?key='+key, 'm':'https://btmkt.jd.com/mobile/initMobile?key='+key};
						$.each(platform, function(k, v) {
							output.val(!output.val() ? v : output.val()+'\n'+v);
						});
						output.val(output.val() + '\n');
						return;
					}
					key = request.QueryString(url, 'key') ? request.QueryString(url, 'key') : request.QueryString(url, 'keyid');
					roleid = request.QueryString(url, 'roleid');
					to = request.QueryString(url, 'to') ? request.QueryString(url, 'to') : request.QueryString(url, 'rul');
					//batch = request.QueryString(url, 'batchId') ? "#batchId=" + request.QueryString(url, 'batchId') : "&"; 
					if (!key) {
						warning_body.html('key 不能为空，请检查。');
						$('.warning').modal();
					}
					if (!roleid) {
						warning_body.html('roleid 不能为空，请检查。');
						$('.warning').modal();
					}
					if (!to) {
						to = 'jd.com';
					} else if (to.substr(0,2) == '//') {
						to = to.substr(2);
					}
					platform = {'pc':'https://coupon.jd.com/ilink/couponActiveFront/front_index.action?key='+key+'&roleId='+roleid+'&to='+to, 'pc2':'http://coupon.jd.com/ilink/couponSendFront/send_index.action?key='+key+'&roleId='+roleid+'&to='+to, 'pc3':'http://act-jshop.jd.com/couponSend.html?callback=&roleId='+roleid+'&key='+key+'&pin=&_='+(new Date().getTime()), 'm':'http://coupon.m.jd.com/coupons/show.action?key='+key+'&roleId='+roleid+'&to='+to, 'wq':'http://wqs.jd.com/promote/2016/getcoupon/index.html?keyid='+key+'&roleid='+roleid+'&rurl='+to};
					
					if (key && roleid && to) {	
						$.each(platform, function(k, v) {
							output.val(!output.val() ? v : output.val()+'\n'+v);
								var url = 'http://api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long='+encodeURIComponent(v);
								$.get('https://jsonp.afeld.me/?url='+encodeURIComponent(url), function(data){
									//console.log(data);
									short_urls[k] = data.urls[0].url_short;
								});
						});
						$(document).ajaxComplete(function(event, xhr, options) {
							if (Object.keys(short_urls).length == 4 && !qrinit) {
								console.log(short_urls);
								var temp = {'pc':short_urls['pc'], 'pc2':short_urls['pc2'], 'm':short_urls['m'], 'wq':short_urls['wq']};
								$.each(temp, function(k, v) {
									$('#qrcode').append('<div class="col-xs-6 col-md-3 qrcode_'+k+'" style="padding-bottom: 10px;"></div>');
									$('.qrcode_'+k).qrcode({width: 150,height: 150, text: v});
								});
								qrinit = true;
							}
						});
					}
					output.val(output.val() + '\n');
					c = input.val();
				});
				if (debug.val()) {
					debug.parent().parent().show();
				} else {
					debug.parent().parent().hide();
				}
				generate.button('reset');
			}
		});
	});
}).call(this);

