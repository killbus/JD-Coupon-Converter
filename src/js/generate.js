(function() {
	$(function() {
		var generate, input, output, key, roleid, to, platform, short_urls, warning_body, qrinit;
		output = $("#output");
		input = $("#input");
		generate = $("#generate");
		warning_body = $(".modal-body");
		short_urls = {};
		qrinit = false;
		
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
						var url = 'http://api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long='+encodeURIComponent(v);
						$.get('https://jsonp.afeld.me/?url='+encodeURIComponent(url), function(data){
							//console.log(data);
							short_urls[k] = data.urls[0].url_short;
						});
				});
				$(document).ajaxComplete(function(event, xhr, options) {
					if (Object.keys(short_urls).length == 3 && !qrinit) {
						console.log(short_urls);
						var temp = {'pc':short_urls['pc'], 'm':short_urls['m'], 'wq':short_urls['wq']};
						$.each(temp, function(k, v) {
							$('#qrcode').append('<div class="col-xs-6 col-md-4 qrcode_'+k+'"></div>');
							$('.qrcode_'+k).qrcode({width: 150,height: 150, text: v});
						});
						qrinit = true;
					}
				});
			}
		});
	});
}).call(this);

