const requireLogin = require('../middlewares/requireLogin');
const requireCredit = require('../middlewares/requireCredit');
// require mongoose used because it gives problems in running tests
const mongoose = require('mongoose');
const Survey = mongoose.model('surveys');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplates');

module.exports = app => {
    app.post('/api/surveys', requireLogin, requireCredit, (req, res) => {

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
        mailer.send();

    });
};