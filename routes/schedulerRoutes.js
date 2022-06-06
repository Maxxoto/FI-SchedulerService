const { DateTime, Settings } = require('luxon');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Mongoose model
const Scheduler = mongoose.model('scheduler');
const Message = mongoose.model('message');

// Services
const smsService = require('../services/smsService');

Settings.throwOnInvalid = true;

module.exports = (app, agenda) => {
    // Scheduler SMS section
    app.post('/api/scheduler/sms', async (req, res) => {
        try {
            const { message, recipients, date_scheduled, timezone } = req.body;

            // Create date from ISO 8601 format based on IANA timezone based on user's timezone
            // and get the epoch milliseconds
            const unixScheduledDate = DateTime.fromISO(`${date_scheduled}`, {
                zone: timezone,
            }).valueOf();

            const newMessage = new Message({
                message,
                recipients: recipients.split(','),
            });
            await newMessage.save();
            const newScheduler = new Scheduler({
                date_scheduled: unixScheduledDate,
                type: 'sms',
            });
            newScheduler.messages.push(newMessage);
            await newScheduler.save();

            // After create scheduler and message object we need to run node scheduler to schedule the jobs
            const utcDate = DateTime.fromMillis(unixScheduledDate).toString();

            await agenda.start();
            const agendaData = await agenda.schedule(
                utcDate,
                'create sms scheduler',
                {
                    messageData: newMessage,
                    schedulerData: newScheduler,
                }
            );

            // Debug only
            // const agendaData = await agenda.now('create sms scheduler', {
            //     messageData: newMessage,
            //     schedulerData: newScheduler,
            // });

            return res.send({
                status: 'success',
                message: `Successfully created scheduler on ${utcDate}`,
                data: newMessage,
            });
        } catch (error) {
            console.log(error);
            return res.send(`{
                "status" "error",
                "message": "${error.message}"
            }`);
        }
    });
    app.get('/api/scheduler/sms', async (req, res) => {
        try {
            let messages = await Message.find().exec();
            let newMessages = [];
            if (messages.length > 0) {
                // Only check 2 status of the message , to avoid rate limit or flood external API connection
                newMessages = Promise.all(
                    messages.map(async (message) => {
                        // Only check 2 status of the message , to avoid rate limit or flood external API connection
                        if (
                            message.status === 'ACCEPTD' ||
                            message.status === 'SCHEDLD'
                        ) {
                            const response = await smsService.getSMSStatus(
                                message.externalMessageId
                            );
                            if (response.status === 'error') {
                                throw new Error(response.message);
                            } else {
                                message.status = response.status;
                                return message;
                            }
                        } else {
                            return message;
                        }
                    })
                );
            }
            return res.send({
                status: 'success',
                message: 'Successfully fetched messages',
                data: await newMessages,
            });
        } catch (error) {
            console.log(error);
            return res.send({
                status: 'error',
                message: error.message,
            });
        }
    });
    app.get('/api/scheduler/sms/:id', async (req, res) => {
        try {
            const { id } = req.params;
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Data not found !');
            }

            const messages = await Message.findOne({ _id: id }).exec();
            const response = await smsService.getSMSStatus(
                messages.externalMessageId
            );
            if (response.status === 'error') {
                throw new Error(response.message);
            } else {
                messages.status = response.status;
            }
            return res.send({
                status: 'success',
                message: 'Successfully fetched messages',
                data: messages,
            });
        } catch (error) {
            console.log(error);
            return res.send({
                status: 'error',
                message: error.message,
            });
        }
    });

    // Scheduler section
    app.get('/api/scheduler', async (req, res) => {
        try {
            const schedulers = await Scheduler.find()
                .populate('messages')
                .exec();
            return res.send({
                status: 'success',
                message: 'Successfully fetched schedulers',
                data: schedulers,
            });
        } catch (error) {
            console.log(error);
            return res.send({
                status: 'error',
                message: error.message,
            });
        }
    });
    app.get('/api/scheduler/:id', async (req, res) => {
        try {
            const { id } = req.params;
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Data not found !');
            }
            const schedulers = await Scheduler.findOne({ _id: id })
                .populate('messages')
                .exec();
            return res.send({
                status: 'success',
                message: 'Successfully fetched schedulers',
                data: schedulers,
            });
        } catch (error) {
            console.log(error);
            return res.send({
                status: 'error',
                message: error.message,
            });
        }
    });
};
