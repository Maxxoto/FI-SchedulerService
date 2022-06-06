const mongoose = require('mongoose');
const { DateTime, Settings } = require('luxon');
const fetch = require('node-fetch');
const { checkStatus } = require('../helpers/httpError');

const Message = mongoose.model('message');

Settings.throwOnInvalid = true;

const sendSMS = async (body, messageId) => {
    try {
        // Execute when scheduler need to run and doesnt need return the value
        const res = await fetch(process.env.FI_SMS_SERVICE_BASE_URI, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
        const validResponse = checkStatus(res);
        const finalResponse = await validResponse.json();
        // Check if its multiple recipients (means array response)
        if (Array.isArray(finalResponse)) {
            finalResponse.forEach(async (response) => {
                const { message_id } = response;
                await Message.findOneAndUpdate(
                    { _id: messageId },
                    { status: 'ACCEPTD', externalMessageId: message_id },
                    { new: true, useFindAndModify: false }
                );
                console.log(
                    `Successfully run a scheduled SMS ${messageId} on ${new Date()}`
                );
            });
        } else {
            const { message_id } = finalResponse;
            await Message.findOneAndUpdate(
                { _id: messageId },
                { status: 'ACCEPTD', externalMessageId: message_id },
                { new: true, useFindAndModify: false }
            );
            console.log(
                `Successfully run a scheduled SMS ${messageId} on ${new Date()}`
            );
        }
    } catch (error) {
        console.log({ status: 'error', message: error.message });
    }
};
const getSMSStatus = async (externalMessageId) => {
    try {
        // Execute everytime user need to check the status of a SMS , and need return value
        const res = await fetch(
            `${process.env.FI_SMS_SERVICE_BASE_URI}?messageId=${externalMessageId}`,
            {
                method: 'GET',
            }
        );
        const validResponse = checkStatus(res);
        const finalResponse = await validResponse.json();
        const { status, delivery_time } = finalResponse;

        // Note that external API datetime must be on UTC to maintain consistency

        const unixDateSent = DateTime.fromFormat(
            delivery_time,
            process.env.FI_SMS_SERVICE_DATE_FORMAT
        );

        const newMessage = await Message.findOneAndUpdate(
            { externalMessageId: externalMessageId },
            { status: status, date_sent: unixDateSent.valueOf() },
            { new: true, useFindAndModify: false }
        );
        return newMessage;
    } catch (error) {
        console.log(error.message);
        return { status: 'error', message: error.message };
    }
};

module.exports = {
    sendSMS,
    getSMSStatus,
};
