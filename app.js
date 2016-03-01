var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async 	= require('async')

//ROUTES ===============================================

app.get('/scrape', function(req, res){

	url = 'http://services.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws';
	  request({
    // will be ignored
    method: 'POST',
    uri: 'http://services.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws',
    // HTTP Archive Request Object
    har: {
      url: 'http://services.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws',
      method: 'POST',
      headers: [
        {
          name: 'content-type',
          value: 'application/x-www-form-urlencoded'
        }
      ],
      postData: {
        mimeType: 'application/x-www-form-urlencoded',
        params: [
          {
            name: 'user1',
            value: 'frenchie81'
          }
        ]
      }
    }
  },function(error, response, html){
				    	if(!error){
				        var $ = cheerio.load(html);
				        console.log('here')
				        // console.log(html)
				        // $('td[align="right"]').filter(function(){

				        //     var data = $(this);
				        //     var el = data.text().split('\n')
				            
				        //     for (var i = 0; i < el.length; i++) {
				        //     	console.log(el[i])
				        //     }
				          
				            
				        // })
				        var list = []

				        $('td[align="left"]').filter(function(){
				        	
					            var data = $(this);
					            var el = data.text().split('\n')
					            var trigger = false 
					            if(el.length != 3){

					            for (var i = 0; i < el.length; i++) {


					            	var item = {
					            		name:'',
					            		rank:'',
					            		level:'',
					            		xp:''
					            	}

					            	// console.log(el[i])

					            	if(el[i]=="Attack")
					            		trigger = true
					            	
					            	if(trigger){
					            		
					            		while(1){
					            			console.log(el[i])
					            			var item = {
							            		name: el[i],
							            		rank: el[i+2],
							            		level: el[i+3],
							            		xp: el[i+4],
							            	}
						            		list.push(item)
						            		i=i+9
						            		if(i>=el.length-1)
						            			break;
					            		}
					            		
					            	}
					            	
					            }
					        }
				          
				            
				        })
				        res.send(list)
				    }else{
				    	console.log('there was an error')
				    }
				})

		  //   request({
		  //   	method: 'POST',
		  //   	uri: url,
		  //   	postData: {
		  //       	mimeType: 'application/x-www-form-urlencoded',
		  //       	params: [{
		  //           	user1: 'frenchie81',
		  //         	}]
		  //     }}, function(error, response, html){
				//     	if(!error){
				//         var $ = cheerio.load(html);
				//         console.log('here')
				//         console.log(html)
				//         $('align').filter(function(){

				//             var data = $(this);
				//             var el = data.text().split('\n')
				            
				//             for (var i = 1; i < el.length; i++) {
				//             	console.log(el[i])
				//             }
				          
				            
				//         })
				//     }
				// })
	
})

app.listen('1330')

console.log('Magic happens on port 1330');

exports = module.exports = app;


