(function() {
	$(function() {
		var generate, input, output, key, roleid, to;
		output = $("#output");
		input = $("#input");
		generate = $("#generate");
		
		var request = {
			QueryString : function(val)
			{
				var uri = input.val();
				var re = new RegExp("" +val+ "=([^&?]*)", "ig");
				return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null);
			}
		}

		generate.on("click", function(event) {
			key = request.QueryString('key') ? request.QueryString('key') : request.QueryString('keyid');
			roleid = request.QueryString('roleid');	
			to = request.QueryString('to') ? request.QueryString('to') : request.QueryString('rul');
			
			console.log(event);
			console.log(key);
			console.log(roleid);
		});
	});
}).call(this);

