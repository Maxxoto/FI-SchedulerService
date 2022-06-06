const { setShouldSaveResult } = require('agenda/dist/job/set-shouldsaveresult');
const smsService = require('./smsService');

const createSMSScheduler = (agenda) => {
    agenda.define(
        'create sms scheduler',
        { priority: 'high', shouldSaveResult: true },
        async (job) => {
            try {
                const { messageData, schedulerData } = job.attrs.data;
                console.log(`Creating scheduler ${schedulerData._id}`);
                const body = {
                    dnis: messageData.recipients.join(','),
                    message: messageData.message,
                };

                await smsService.sendSMS(body, messageData._id);
            } catch (error) {
                console.log(error);
            }
        }
    );
};

module.exports = {
    createSMSScheduler,
};
