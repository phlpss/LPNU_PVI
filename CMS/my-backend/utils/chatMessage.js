import moment from 'moment';

export const formatMessage = ({ fromUser, toUser, msg }) => {
    let message = {
        from: fromUser,
        to: toUser,
        message: msg,
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("hh:mm a")
    };
    return message;
}