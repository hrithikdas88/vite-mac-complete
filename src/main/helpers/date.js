import { format } from "date-fns";

export const getTimeSlot = (date = new Date()) => {
    const now = date
    const minutes = now.getMinutes()

    const nearestPreviousMinutes = Math.floor(minutes / 10) * 10;

    now.setMinutes(nearestPreviousMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    const formattedDate = format(now, "yyyy-MM-dd'T'HH:mm:ssxxx");

    return formattedDate;
}

export const formatDateToDefaultFormat = (date = new Date()) => {
    console.log("format", date)
    return format(date, "yyyy-MM-dd'T'HH:mm:ssxxx")
}