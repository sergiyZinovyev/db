var nodemailer = require('nodemailer');
var fs = require('fs');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
     
    }
});

exports.sendEmail = function(req, res){
    //console.log(req.body.file);
    //res.send(req.body);
    //fs.createWriteStream('server/img/file.pdf').write(req.body.file.buffer);
    // var base64Data = req.body.file.replace(/^data:image\/png;base64,/, "");
    // fs.writeFile('server/img/file.pdf', base64Data, 'base64', function(err) {
    // console.log(err);
    // });

    //console.log(req.body);
    const mailOptions = {
        from: 'sender@email.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Запрошення на виставку', // Subject line
        attachments: [
            {   
                path: req.body.file
            }
        ],
        html: `<p>Шановний(а) <strong>${req.body.prizv} ${req.body.name} ${req.body.pobatkovi}</strong>, у вкладенні Ви отримали персональне запрошення на виставку.</p><p>З повагою ПрАТ "Гал-Експо"</p>`// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
            console.log(err);
            res.send(err)
        }   
        else{
            //console.log(info);
            res.send(info);
        }   
    });
}