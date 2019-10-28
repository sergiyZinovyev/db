var nodemailer = require('nodemailer');
var fs = require('fs');

let testEmailAccount = nodemailer.createTestAccount();

var transporter = nodemailer.createTransport({
    // service: 'gmail',
    // auth: {
    //    
    // }
    host: 'smtp.galexpo.com.ua',
    port: 587,
    secure: false, //disable SSL    
    requireTLS: true, //Force TLS
    tls: {
        rejectUnauthorized: false
    },
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
        from: 'send@galexpo.lviv.ua', // sender address
        to: req.body.email, // list of receivers
        subject: 'Запрошення на виставку', // Subject line
        attachments: [
            {   
                path: req.body.file
            }
        ],
        html: `<p>Шановний(а) <strong>${req.body.prizv} ${req.body.name} ${req.body.pobatkovi}</strong>, у вкладенні Ви отримали персональне запрошення на виставку.</p>
                <p>Якщо Ви не змогли зберегти чи отримати на пошту повне запрошення зі штрихкодом то покажіть цей код на реєстрації:</p>
                <p><strong>${req.body.regnum}</strong></p>
                <p>З повагою ПрАТ "Гал-Експо"</p>`// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
            console.log(err);
            //res.send(err)
        }   
        else{
            //console.log(info);
            res.send(info);
        }   
    });
}