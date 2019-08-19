//var nodemailer = require('nodemailer');
//const html2pdf = require('html2pdf.js')
//import html2pdf from 'html2pdf.js';
var Shared = require('../models/shared');


exports.pdf = function(req, res){
    console.log(req.body);

    let element = '<p>Шановний(а) <strong>${req.body.prizv} ${req.body.name} ${req.body.pobatkovi}</strong>, Ви отримали персональне запрошення на виставку.</p><p>Покажіть цей код на вході: <strong>${req.body.regnum}</strong></p>';
    let opt = {
      margin:       0,
      filename:     'invite.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    let file = html2pdf().set(opt).from(element).save();
    Shared.writeFile(file, function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
        }
        console.log('file create');
		res.send(doc);
	})


    // Shared.file('invite.pdf', function(err, doc) {
	// 	if (err) {
	// 		console.log(err);
	// 		return res.sendStatus(500);
    //     }
    //     console.log('file sent');
	// 	res.send(doc);
	// });
    // const mailOptions = {
    //     from: 'sender@email.com', // sender address
    //     to: req.body.email, // list of receivers
    //     subject: 'Subject of your email', // Subject line
    //     html: `<p>Шановний(а) <strong>${req.body.prizv} ${req.body.name} ${req.body.pobatkovi}</strong>, Ви отримали персональне запрошення на виставку.</p><p>Покажіть цей код на вході: <strong>${req.body.regnum}</strong></p>`// plain text body
    // };
    // transporter.sendMail(mailOptions, function (err, info) {
    //     if(err){
    //         console.log(err);
    //         res.send(err)
    //     }   
    //     else{
    //         console.log(info);
    //         res.send(info);
    //     }   
    // });
    //res.sendStatus(204)
}