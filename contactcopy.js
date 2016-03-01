/*!
 * contactcopy
 * https://github.com/rpotor/contactcopy
 */
 
/*
 * An application to copy the alliance contact list from a character to the personal contact list of 
 * another character.
 * This code uses snippets of code and bucketloads of inspiration from the following sources:
 * 		- the awesome contactjs script located at https://github.com/jimpurbrick/contactjs
 * 		- the code posted by pilot Shegox Gabriel on the EVE forums in post #17 of this topic:
 *		  https://forums.eveonline.com/default.aspx?g=posts&t=463526&find=unread
 *		- the EVE API tutorial here:
 *		  http://www.evepanel.net/blog/eve-online/api/eve-api-tutorial-part-ii-requesting-data-from-the-api-and-save-it.html
 * However since I'm not such a hardcore coder to understand everything, some of the sophistication in 
 * the original sources might have been lost in transition. :-)
 * For that I do apologize and please if you are more knowledgeable than me, feel free to improve on this.
 */
 
// Configuration parameters
var server = "https://crest.eveonline.com/"; // API server
var redirectUri = "http://www.rpotor.com/EVE/contactcopy/"; // client uri
var clientId = "5cb59686ba5e407db253658457fcdd26"; // OAuth client id
var csrfTokenName = clientId + "csrftoken";
var token; // OAuth token
var authorizationEndpoint = "https://login.eveonline.com/oauth/authorize/"; // OAuth endpoint
var scopes = "publicData characterContactsRead characterContactsWrite";
var chname;
var keyID;
var vCode;

function uuidGen() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	return v.toString(16);
    });
}

// Extract value from oauth formatted hash fragment.
function extractFromHash(name, hash) {
	var match = hash.match(new RegExp(name + "=([^&]+)"));
	return !!match && match[1];
}

function redir() {
	document.getElementById("page-wrap").innerHTML = "Processing... please wait.";
	window.location.assign("http://www.rpotor.com/EVE/contactcopy/contactcopy.php?access_token=" + token + "&chname=" + chname + "&keyID=" + keyID + "&vCode=" + vCode);
}

function getbasedata() {
	chname = document.getElementById("characterName").value;
	keyID = document.getElementById("keyID").value;
	vCode = document.getElementById("vCode").value;
	document.getElementById("page-wrap").innerHTML = "Okay thanks. Click on the link below to begin. The whole process should take about 10-15 seconds for each 100 contacts on the alliance contact list you are copying and you shouldn't close your web browser until the application says it's all done. The changes should take effect in-game after a few minutes, as it seems the EVE server needs to sync the new contact list with your EVE Online client. In case you click the link below, then go for a coffee, walk the dog, eat your dinner and come back 30 minutes later to see that the application is still working, then it's safe to say something really went wrong and you might have to try again and start over. :-(<br /><br />";
	document.getElementById("page-wrap").innerHTML += '<a href="#" onclick="redir();">Click here</a> to copy the alliance contact list from your source character to the personal contact list of your target character.<br />';
}

function checkstate() {
if (extractFromHash("state", hash) !== $.cookie(csrfTokenName)) {
		$.cookie(csrfTokenName, null);
		document.getElementById("page-wrap").innerHTML = "Ummm, I'm sorry, but something bad happened.<br /><br />";
		document.getElementById("page-wrap").innerHTML += "Let me explain the problem. The thing is that the cookie we set when we sent you to the login page does not match with the answer we received back from the EVE authentication server. I don't want you to be alarmed but this might mean something fishy is going on, like maybe you have been hacked or have a virus, but I'm not that familiar with cookies, so I don't know what's going on really. You did nothing wrong, but I can't let you access the application in this case. My best guess at this point is to ask you to please go back to the beginning and try again or close and restart your web browser and maybe the problem will fix itself. :-)<br /><br />";
		document.getElementById("page-wrap").innerHTML += '<a href="index.html">Ooookay, take me back to the start.</a>';
		return (false);
	}
	return (true);
}

var hash = document.location.hash;
token = extractFromHash("access_token", hash);
if (token) {

	// Note to self: somehow the access token expiration should be handled by the app and it should only ask for a new login when the actual access token is expired or close to expiring. The php script could be used for this, we could check expiry before the curl request calls. A curl get request could get the job done, we need to send the get request described here: https://eveonline-third-party-documentation.readthedocs.org/en/latest/sso/obtaincharacterid/
	// We can then get the current token expiry from the json that the get request spits back. Then we only need to check it against the current timestamp. It's magic.
	// Update: this is not needed anymore, using multi curl we only use one php script now which abides by the request rate limits of the CREST API, so no way the 20 minutes limit would be exceeded even if we do a thousand requests and populate the user's contact list fully.
	
	wegood = checkstate();

	if (wegood) {
	// Delete CSRF token cookie.
	$.cookie(csrfTokenName, null);
	
	// Load data
	document.getElementById("page-wrap").innerHTML = "Oookay, the authentication was successful, so here we go!<br /><br />";
	document.getElementById("page-wrap").innerHTML += "Now we need the details of a character which can &#34;see&#34; the alliance contact list you'd like to copy. We'll call this character the <i>source character</i>. It is very important therefore to fill in the form below with the details of a character of yours that is in the alliance in question (membership in any member corporation of the alliance is okay). It's also super important to fill in your source character name absolutely right.<br />";
	document.getElementById("page-wrap").innerHTML += "We also need an API key of the source character, which allows access to the in-game contact list. If you don&#39;t have such an API key, you can create one now by <a href='https://community.eveonline.com/support/api-key/CreatePredefined?accessMask=16' target='_blank'>clicking this link</a> (opens on a new browser tab, you can come back after you've done it). We'll wait for you, we won't go anywhere.<br />";
	document.getElementById("page-wrap").innerHTML += "After you filled in the form, please click the Submit button.<br /><br />";
	document.getElementById("page-wrap").innerHTML += '<form id="basedata" name="basedata">';
	document.getElementById("page-wrap").innerHTML += 'Name of the source character who is within the alliance: <input type="text" name="characterName" id="characterName"><br />';
	document.getElementById("page-wrap").innerHTML += 'API key ID: <input type="text" name="keyID" id="keyID"><br />';
	document.getElementById("page-wrap").innerHTML += 'API key vCode: <input type="text" name="vCode" id="vCode"><br />';
	document.getElementById("page-wrap").innerHTML += '<button onclick="getbasedata();">Submit</button>';
	document.getElementById("page-wrap").innerHTML += '</form>';
	}
}

else {
	// Store CSRF token as cookie
	var csrfToken = uuidGen();
	$.cookie(csrfTokenName, csrfToken);

	// No OAuth token, request one from the OAuth authentication endpoint
	var loginlink = authorizationEndpoint + "?response_type=token" + "&client_id=" + clientId + "&scope=" + scopes + "&redirect_uri=" + redirectUri + "&state=" + csrfToken;

	document.getElementById("page-wrap").innerHTML = "<center><h1>Welcome Capsuleer!</h1></center><br />";
	document.getElementById("page-wrap").innerHTML += "You can use this website to quickly copy the contact list of your alliance to another character of yours (which is not in the alliance).<br />";
	document.getElementById("page-wrap").innerHTML += "To start the copy process, first you need to log-in to the character whose personal contact list you'd like to synchronize with the alliance contact list. Let's call this character the <i>target character</i> from now on. To do that, click the button below.<br /><br />";
	document.getElementById("page-wrap").innerHTML += '<center><a href="#" onclick="' + "window.location.assign('" + loginlink + "')" + ';"><img src="EVE_SSO_Login_Buttons_Large_Black.png" /></a></center>';
	document.getElementById("page-wrap").innerHTML += "<center><h2>FAQ</h2></center>";
	document.getElementById("page-wrap").innerHTML += "<b>Question:</b>Heeey! You won't fool me! You just want me to log-in to your crappy website with my EVE login details to steal my character!<br />";
	document.getElementById("page-wrap").innerHTML += "<b>Answer:</b>Ummm, no, that's not how I roll. :-) This application is registered with CCP according to their rules which you can read on the developer website: <a href='https://developers.eveonline.com/' target='_blank'>https://developers.eveonline.com/</a> The button above will take you to a legit CCP EVE login website. I promise I can't see your password or anything like that, and I can't steal anything from your account. With this app, I can only access those information that you specifically authorize the app to access. In this case that would be to read and write your contact list. That means in the worst case scenario I could theoretically see and &#34;steal&#34; all your contacts and the standings you set for them. Or I could make you best buddies (Excellent standing) with any alliance in EVE. I promise you I won't do that with this app, and really I'm not that interested in who is included on your contact list, but for full disclosure this is what I could do. If you are uncomfortable with that, you of course have the option of not using this app. So in short the login button above only serves the purpose of logging in, selecting the correct character and giving the app permission to the above mentioned. It is done in a very user friendly way, you just need to click it through, it'll be self explanatory. The authorization you give by the way is only good for 20 minutes, so it's not like you log-in here once and then I could access your contact list forever. Okay, I hope that clears every concern you might have, but in case you'd still like to use the app, have some knowledge of php, javascript and html and you have access to a web server, just can't trust me :-) you can find the <a href='https://github.com/rpotor/contactcopy' target='_blank'>source code here</a> to do with it whatever you like. :-)<br /><br />";
	document.getElementById("page-wrap").innerHTML += "<b>Question:</b> What if I already have some of the alliance contacts added on my target character's personal contact list?<br />";
	document.getElementById("page-wrap").innerHTML += "<b>Answer:</b> No problem. The app will just &#34;overwrite&#34; the existing contact with the same contact, so you'll see no change on your contact list regarding that contact. The only thing which could be an issue is that let's say your target character is best buddies and excellent standing with - okay this is just an example, I got nothing against them or anything - &#34;The Order of Saint James the Divine&#34; alliance and so you have them set to blue on your target character's personal contact list. Now let's say that the alliance whose contact list you'd like to copy does not really like them and they have them set to Bad standing on the alliance contact list. In that case the copy process will overwrite the standing you set previously and they'll now be Bad standing on the target character's personal contact list.<br /><br />";
	document.getElementById("page-wrap").innerHTML += "<b>Question:</b> I see hundreds of contacts on my alliance's contact list in game. That could take a long time to add...<br />";
	document.getElementById("page-wrap").innerHTML += "<b>Answer:</b> You're correct...ish! It will take about 10-15 seconds for every 100 contacts currently on the contact list in question. This also depends on the time of day you run it, the load on the EVE servers at the moment, etc. You shouldn't close your browser window until the application gives you the &#34;All done&#34; message. This could go faster, but the EVE server requires code like this application to slow down a bit so as not to overrun the server with lots of requests.<br /><br />";
	document.getElementById("page-wrap").innerHTML += "<b>Question:</b> This is a super-awesome application! Which character should I give lots of ISK to?<br />";
	document.getElementById("page-wrap").innerHTML += "<b>Answer:</b> I'm glad you like it. :-) No need to donate me money as I'd have made this application anyway as an entry to the EVE API Challenge competition and now I'm only just making it available to the general EVE population in case someone might also find it useful. If you really, absolutely would like to &#34;thank&#34; me, then you can maybe go to <a href='https://www.youtube.com/watch?v=RrutzRWXkKs' target='_blank'>this Youtube video</a> and like it if you like it. :-) Lindsey Stirling is a world-class dancing hip-hop violinist, okay actually the greatest violinist in human history with a music that sounds like a bunch of rats being strangled. :-) She is doing something right though, because she has a combined view count on her Youtube channel of more than 1 billion and well she is just awesome 'nuff said and I'm of course not passing up an opportunity like this, to promote her. :-)";
}