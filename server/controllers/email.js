var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thrion1@gmail.com',
        pass: 'grthrangel666'
        
    }
});

exports.sendEmail = function(req, res){
    console.log(req.body);
    const mailOptions = {
        from: 'sender@email.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Subject of your email', // Subject line
        html: `<p>Шановний(а) <strong>${req.body.prizv} ${req.body.name} ${req.body.pobatkovi}</strong>, Ви отримали персональне запрошення на виставку.</p><p>Покажіть цей код на вході: <strong>${req.body.regnum}</strong></p>`// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
            console.log(err);
            res.send(err)
        }   
        else{
            console.log(info);
            res.send(info);
        }   
    });
    //res.sendStatus(204)
}