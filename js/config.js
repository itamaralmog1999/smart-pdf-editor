// YOUR SETTINGS. This is the only file you edit by hand.
// update_from_zip.py never overwrites it, and you never need to paste anything into the other files.
window.MYDOCS_CONFIG={
 // Google Cloud > Google Auth Platform > Clients > your Web client. (A Client ID is public by design, it is not a secret.)
 GOOGLE_CLIENT_ID:'448128086418-7lhu422d8dv433c7eahe9o7pmh2laj1p.apps.googleusercontent.com',

 // false = anyone may use the app.  true = only approved people (see README: "Who can use the app").
 // Turn this on only after your approval service is working, or you may lock yourself out.
 REQUIRE_LOGIN:false,

 // The URL of your Apps Script web app (admin/approval-Code.gs). Empty = use the allowed.json list instead.
 APPROVAL_URL:''
};