(function() {
	$(function() {
		var generate, input, output, key, roleid, to, platform, short, warning_body;
		output = $("#output");
		input = $("#input");
		generate = $("#generate");
		warning_body = $(".modal-body");
		short = {};
		
		var request = {
			QueryString : function(val)
			{
				var uri = input.val();
				var re = new RegExp("" +val+ "=([^&?]*)", "ig");
				return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null);
			}
		}

		generate.on("click", function(event) {
			output.val('');
			key = request.QueryString('key') ? request.QueryString('key') : request.QueryString('keyid');
			roleid = request.QueryString('roleid');	
			to = request.QueryString('to') ? request.QueryString('to') : request.QueryString('rul');
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
			}
			platform = {'pc':'http://coupon.jd.com/ilink/couponSendFront/send_index.action?key='+key+'&roleId='+roleid+'&to='+to+'&', 'm':'http://coupon.m.jd.com/coupons/show.action?key='+key+'&roleId='+roleid+'&to='+to+'&', 'wq':'http://wqs.jd.com/promote/2016/getcoupon/index.html?keyid='+key+'&roleid='+roleid+'&rurl='+to+'&'};
			
			if (key && roleid && to) {	
				$.each(platform, function(k, v) {
					output.val(!output.val() ? v : output.val()+'\n'+v);
					$.ajax({
						url: 'http://api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long='+encodeURIComponent(v),
						type: "GET",
						dataType: "JSONP",
						jsonp: 'jsoncallback',
						cache: false,
						success: function(data) {
							console.log(data);
							short[k] = '';
						}
					});
				});
				//$(document).ajaxComplete(function(event, xhr, options) {
				//	console.log(short);
				//});
			}

		});
	});
}).call(this);

