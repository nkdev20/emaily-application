const requireLogin = require('../middlewares/requireLogin');
const requireCredit = require('../middlewares/requireCredit');
// require mongoose used because it gives problems in running tests
const mongoose = require('mongoose');
const Survey = mongoose.model('surveys');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplates');

module.exports = app => {
    app.get('/api/surveys/thanks', (req, res) => {
        res.send('Thanks for voting');
    });
    
    app.post('/api/surveys', requireLogin, requireCredit, async (req, res) => {

        const {title, subject, body, recipients} =  req.body;

        const survey = new Survey({
            title,
            body,
            subject,
            recipients: recipients.split(',').map(email => ({ email: email.trim() })),
            _user: req.user.id,
            dateSent: Date.now()
        });
        console.log(survey);
        //send Mail
        const mailer = new Mailer(survey, surveyTemplate(survey));
        try{
            await mailer.send();
            await survey.save();
            req.user.credits -= 1;
            const user = await req.user.save();
            res.send(user);
        } catch(err){
            res.status(422).send(err);

        }

    });
};